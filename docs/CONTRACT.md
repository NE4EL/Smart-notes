# Контракт имён проекта «Умные заметки»

Документ фиксирует **имена**: классы, функции, типы, переменные, файлы, маршруты. Цель — чтобы четыре человека (A/B/C/D) работали параллельно и не переизобретали одно и то же под разными именами. Это карта, а не код: реализация — в задачах исполнителей.

**Правила:**
- Имена из этого файла менять **только через PR с ревью B** (для API) или хозяина зоны (для внутренних).
- У каждой папки один хозяин (см. README → «Команда и роли»). В чужую зону — только через PR.
- Ветки и коммиты подписываем буквой роли: `feature/C-notes-list`, `A: docker-compose`.

Легенда зон: **A** — Евтушенко (инфра/config), **B** — Лимонов (docs/API-контракт), **C** — Прошин (frontend), **D** — Асаков (backend/apps).

---

## 1. Общие соглашения

| Что | Правило |
|-----|---------|
| Python | `snake_case` функции/переменные, `PascalCase` классы, файлы `snake_case.py`. Линтер — ruff. |
| TypeScript | `camelCase` переменные/функции, `PascalCase` компоненты и типы, файлы компонентов `PascalCase.tsx`, остальное `camelCase.ts`. Линтер — ESLint + Prettier. |
| API | пути в `kebab-case`/существительные во мн. числе, всё под `/api/`. Тела запросов/ответов — `snake_case` (как в Django). |
| Даты | ISO-8601 UTC (`2026-09-25T12:00:00Z`), поля `created_at` / `updated_at`. |
| Идентификаторы | `bigint id`, во фронте — `number`. |

---

## 2. Модель данных (зона D → `backend/apps/`)

Соответствует ER-диаграмме из README. Одна сущность = одно Django-приложение (кроме `attachments` — живёт внутри `notes`).

### 2.1 `accounts` — пользователь

Файл `apps/accounts/models.py`:

| Имя | Тип | Заметки |
|-----|-----|---------|
| `User` | модель (`AbstractBaseUser` + `PermissionsMixin`) | вход по email |
| `User.email` | `EmailField(unique=True)` | `USERNAME_FIELD = "email"` |
| `User.name` | `CharField(max_length=150, blank=True)` | |
| `User.password` | (наследуется) | только хеш (NFR-02) |
| `User.is_active` / `is_staff` | `BooleanField` | |
| `User.date_joined` | `DateTimeField(auto_now_add=True)` | |
| `UserManager` | менеджер | `create_user()`, `create_superuser()` |

`settings.AUTH_USER_MODEL = "accounts.User"` (задаёт A в config).

### 2.2 `spaces` — пространства (FR-03)

| Имя | Тип |
|-----|-----|
| `Space` | модель |
| `Space.user` | `FK(User, on_delete=CASCADE, related_name="spaces")` |
| `Space.name` | `CharField(max_length=100)` |
| ограничение | `UniqueConstraint(["user", "name"], name="uq_space_user_name")` |

### 2.3 `tags` — теги (FR-04)

| Имя | Тип |
|-----|-----|
| `Tag` | модель |
| `Tag.user` | `FK(User, CASCADE, related_name="tags")` |
| `Tag.name` | `CharField(max_length=50)` |
| ограничение | `UniqueConstraint(["user", "name"], name="uq_tag_user_name")` |

### 2.4 `notes` — заметки и вложения (FR-02, FR-05..08)

`Note` (`apps/notes/models.py`):

| Имя | Тип | Заметки |
|-----|-----|---------|
| `Note.user` | `FK(User, CASCADE, related_name="notes")` | владелец |
| `Note.space` | `FK(Space, on_delete=SET_NULL, null=True, blank=True, related_name="notes")` | заметка без пространства допустима |
| `Note.title` | `CharField(max_length=255)` | |
| `Note.content` | `TextField(blank=True)` | |
| `Note.tags` | `ManyToManyField(Tag, blank=True, related_name="notes")` | таблица `note_tags` — Django создаёт сам |
| `Note.is_pinned` | `BooleanField(default=False)` | закреп (FR-07) |
| `Note.created_at` | `DateTimeField(auto_now_add=True)` | |
| `Note.updated_at` | `DateTimeField(auto_now=True)` | |
| индекс поиска | `GinIndex` по `to_tsvector('russian', title || ' ' || content)` | миграция руками, NFR-01 |

`Attachment` (там же):

| Имя | Тип |
|-----|-----|
| `Attachment.note` | `FK(Note, on_delete=CASCADE, related_name="attachments")` |
| `Attachment.file` | `FileField(upload_to="attachments/%Y/%m/")` |
| `Attachment.uploaded_at` | `DateTimeField(auto_now_add=True)` |

Удаление заметки → каскадом удаляются вложения (FR-08). Удаление сигналом чистит и файлы с диска: `apps/notes/signals.py` (по желанию).

---

## 3. Сериализаторы, вьюхи, права (зона D)

### 3.1 accounts

| Имя | Файл | Назначение |
|-----|------|-----------|
| `RegisterSerializer` | `serializers.py` | вход: `email`, `password`, `name`; создаёт User |
| `UserSerializer` | `serializers.py` | ответ: `id`, `email`, `name` |
| `RegisterView` | `views.py` | `POST /auth/register` (AllowAny) |
| `LoginView`, `RefreshView` | `views.py` | обёртки simplejwt |
| `LogoutView` | `views.py` | `refresh` → blacklist |

### 3.2 spaces / tags

| Имя | Файл |
|-----|------|
| `SpaceSerializer` (`id`, `name`) | `spaces/serializers.py` |
| `SpaceViewSet` (`ModelViewSet`) | `spaces/views.py` |
| `TagSerializer` (`id`, `name`) | `tags/serializers.py` |
| `TagViewSet` (`ModelViewSet`) | `tags/views.py` |

### 3.3 notes

| Имя | Файл | Назначение |
|-----|------|-----------|
| `NoteSerializer` | `serializers.py` | полный объект (см. §5) |
| `NoteListSerializer` | `serializers.py` | облегчённый для списка (по желанию) |
| `AttachmentSerializer` | `serializers.py` | `id`, `file` (url), `uploaded_at` |
| `NoteViewSet` (`ModelViewSet`) | `views.py` | CRUD + закреп через `PATCH` |
| `AttachmentView` | `views.py` | список/загрузка вложений заметки |
| `NoteFilter` (`django_filters.FilterSet`) | `filters.py` | `space`, `tags`, `ordering` |

### 3.4 common (общий слой)

| Имя | Файл | Назначение |
|-----|------|-----------|
| `IsOwner` | `common/permissions.py` | доступ к объекту только владельцу; чужой id → **404**, не 403 (NFR-02) |
| `DefaultPagination` | `common/pagination.py` | `page_size=20`, параметр `page`, `page_size` |

**Единое правило D:** каждый queryset фильтруется `.filter(user=self.request.user)`. Это база изоляции данных.

---

## 4. config (зона A → `backend/config/`)

| Что | Где | Значение/ключи |
|-----|-----|----------------|
| `INSTALLED_APPS` | `settings.py` | + `rest_framework`, `django_filters`, `drf_spectacular`, `apps.accounts/spaces/tags/notes` |
| `AUTH_USER_MODEL` | `settings.py` | `"accounts.User"` |
| `DATABASES["default"]` | `settings.py` | PostgreSQL из env: `POSTGRES_DB/USER/PASSWORD/HOST/PORT` |
| `REST_FRAMEWORK` | `settings.py` | JWTAuthentication, `IsAuthenticated` по умолчанию, `DefaultPagination`, `drf_spectacular` схема |
| `SIMPLE_JWT` | `settings.py` | lifetime access/refresh, `ROTATE_REFRESH_TOKENS`, blacklist |
| `SPECTACULAR_SETTINGS` | `settings.py` | title «Smart Notes API» |
| `MEDIA_URL` / `MEDIA_ROOT` | `settings.py` | `/media/`, вложения |
| команда `seed` | `apps/.../management/commands/seed.py` | тестовые данные |

`config/urls.py` подключает `/api/auth/` (accounts) и `/api/` (spaces, tags, notes), плюс `/api/schema/` и `/api/docs/`.

**Переменные окружения** (`.env.example`, зона A): `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`, `VITE_API_URL`.

---

## 5. Контракт API (зона B — согласование, D — реализация)

Все ответы — JSON, `snake_case`. Авторизация: `Authorization: Bearer <access>` везде, кроме register/login/refresh.

### Объект `note` (ответ сервера)

```json
{
  "id": 1,
  "title": "Отчёт",
  "content": "текст…",
  "space": 3,
  "tags": [1, 4],
  "is_pinned": false,
  "attachments": [{ "id": 10, "file": "/media/attachments/2026/09/a.pdf", "uploaded_at": "2026-09-25T12:00:00Z" }],
  "created_at": "2026-09-20T09:00:00Z",
  "updated_at": "2026-09-25T12:00:00Z"
}
```

### Эндпоинты

| Метод | Путь | Тело / параметры |
|-------|------|------------------|
| POST | `/api/auth/register` | `{email, password, name}` |
| POST | `/api/auth/login` | `{email, password}` → `{access, refresh}` |
| POST | `/api/auth/refresh` | `{refresh}` → `{access}` |
| POST | `/api/auth/logout` | `{refresh}` |
| GET/POST | `/api/notes` | список (см. фильтры) / `{title, content, space?, tags?}` |
| GET/PUT/PATCH/DELETE | `/api/notes/{id}` | закреп = `PATCH {is_pinned: true}` |
| GET/POST | `/api/notes/{id}/attachments` | `multipart/form-data`, поле `file` |
| DELETE | `/api/attachments/{id}` | |
| GET/POST | `/api/spaces` | `{name}` |
| PUT/DELETE | `/api/spaces/{id}` | |
| GET/POST | `/api/tags` | `{name}` |
| DELETE | `/api/tags/{id}` | |

### Параметры списка `/api/notes`

`search` (строка), `space` (id), `tags` (id через запятую: `1,4`), `ordering` (`created_at`|`updated_at`|`-created_at`|`-updated_at`), `page`, `page_size`. Закреплённые всегда сверху. Формат страницы — DRF: `{count, next, previous, results: []}`.

---

## 6. Frontend (зона C → `frontend/src/`)

### 6.1 Типы — `src/types/index.ts`

Зеркалят объекты API. Одни имена и во фронте, и в контракте.

| Тип | Поля |
|-----|------|
| `User` | `id, email, name` |
| `Space` | `id, name` |
| `Tag` | `id, name` |
| `Attachment` | `id, file, uploaded_at` |
| `Note` | `id, title, content, space, tags, is_pinned, attachments, created_at, updated_at` |
| `Paginated<T>` | `{ count, next, previous, results: T[] }` |
| `NoteFilters` | `{ search?, space?, tags?, ordering?, page? }` |
| `AuthTokens` | `{ access, refresh }` |

### 6.2 API-слой — `src/api/` (единственное место запросов к бэку)

| Файл | Экспорт (функции) |
|------|-------------------|
| `client.ts` | `apiClient` (инстанс axios с `baseURL = VITE_API_URL`), интерсептор Bearer + refresh |
| `auth.ts` | `register`, `login`, `refresh`, `logout` |
| `notes.ts` | `getNotes(filters)`, `getNote(id)`, `createNote`, `updateNote`, `patchNote`, `deleteNote`, `togglePin(id, value)` |
| `spaces.ts` | `getSpaces`, `createSpace`, `renameSpace`, `deleteSpace` |
| `tags.ts` | `getTags`, `createTag`, `deleteTag` |
| `attachments.ts` | `getAttachments(noteId)`, `uploadAttachment(noteId, file)`, `deleteAttachment(id)` |

### 6.3 Query-хуки — `src/hooks/`

TanStack Query. Ключи кеша — константы, чтобы не расходились:

| Хук / ключ | Файл |
|-----------|------|
| `useNotes(filters)`, `useNote(id)`, `useCreateNote`, `useUpdateNote`, `useDeleteNote`, `useTogglePin` | `useNotes.ts` |
| `useSpaces`, `useCreateSpace`, `useRenameSpace`, `useDeleteSpace` | `useSpaces.ts` |
| `useTags`, `useCreateTag`, `useDeleteTag` | `useTags.ts` |
| `useAuth` (login/logout, текущий пользователь) | `useAuth.ts` |
| ключи | `queryKeys = { notes, note, spaces, tags }` в `src/lib/queryKeys.ts` |

### 6.4 Страницы — `src/pages/` (`PascalCase.tsx`)

| Компонент | Маршрут |
|-----------|---------|
| `LoginPage` | `/login` |
| `RegisterPage` | `/register` |
| `NotesPage` (список + поиск + фильтры) | `/` |
| `NoteEditorPage` | `/notes/:id`, `/notes/new` |
| `SpacesPage` | `/spaces` |
| `TagsPage` | `/tags` |

### 6.5 Компоненты — `src/components/` (`PascalCase.tsx` + `*.module.css`)

`NoteCard`, `NoteList`, `SearchBar`, `FilterPanel`, `TagPicker`, `SpaceSelect`, `AttachmentList`, `PinButton`, `Layout`, `ProtectedRoute`.

### 6.6 Инфраструктура фронта

| Файл | Содержимое |
|------|-----------|
| `src/main.tsx` | точка входа, `QueryClientProvider`, `RouterProvider` |
| `src/App.tsx` | описание роутов |
| `src/lib/queryClient.ts` | инстанс `QueryClient` |
| `src/lib/auth.ts` | хранение токенов (`getToken`, `setTokens`, `clearTokens`) |

---

## 7. Инфраструктура (зона A)

| Файл | Назначение |
|------|-----------|
| `docker-compose.yml` | сервисы `db` (postgres:17), `backend`, `frontend`, `nginx` |
| `backend/Dockerfile` | python:3.12 |
| `frontend/Dockerfile` | node build → раздача |
| `nginx/nginx.conf` | HTTPS, `/api/` → backend, статика фронта, `/media/` |
| `.github/workflows/ci.yml` | джобы `backend` (ruff + pytest), `frontend` (eslint + vitest) |
| `.env.example` | список env из §4 |

---

## 8. Тесты

- Бэк (D): `apps/*/tests/` — `test_models.py`, `test_api.py`, `test_permissions.py`. Ключевой — изоляция данных между пользователями (NFR-02).
- Фронт (C): рядом с компонентами `*.test.tsx` (Vitest + Testing Library).
- Приёмка фич — B, по колонке «Как проверяем» из ТЗ.

---

## 9. Как это гасит конфликты в git

1. **Один файл — один хозяин.** Папки не пересекаются (A→config/инфра, B→docs, C→frontend, D→apps). Два человека почти никогда не редактируют один файл.
2. **Имена заранее.** Никто не придумывает `getNotesList` против `fetchNotes` — имя уже здесь.
3. **API — только через B.** Контракт из §5 меняется одним PR, фронт и бэк подхватывают согласованно.
4. **Мелкие ветки по буквам.** `feature/<буква>-<фича>`, мерж в `dev` после ревью, `main` защищён (A).
5. **Общий слой заранее выделен** (`apps/common`, `src/lib`, `src/types`) — общие вещи в одном месте, а не копипастой у каждого.
