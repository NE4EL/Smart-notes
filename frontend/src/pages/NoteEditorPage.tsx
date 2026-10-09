// The effect below copies a loaded note into editable form fields.
// oxlint-disable react/set-state-in-effect
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { AttachmentList } from '../components/AttachmentList'
import { PinButton } from '../components/PinButton'
import { SpaceSelect } from '../components/SpaceSelect'
import { TagPicker } from '../components/TagPicker'
import {
  useCreateNote,
  useDeleteNote,
  useNote,
  useShareNote,
  useTogglePin,
  useUpdateNote,
} from '../hooks/useNotes'
import { useSpaces } from '../hooks/useSpaces'
import { useTags } from '../hooks/useTags'

export function NoteEditorPage() {
  const { id } = useParams()
  const noteId = id === 'new' ? 0 : Number(id)
  const isNew = noteId === 0
  const navigate = useNavigate()
  const note = useNote(noteId)
  const spaces = useSpaces()
  const tagsList = useTags()
  const create = useCreateNote()
  const update = useUpdateNote()
  const remove = useDeleteNote()
  const pin = useTogglePin()
  const share = useShareNote()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [space, setSpace] = useState<number | null>(null)
  const [tags, setTags] = useState<number[]>([])
  const [isPinned, setIsPinned] = useState(false)
  const [shareEmail, setShareEmail] = useState('')

  useEffect(() => {
    if (!note.data) return
    setTitle(note.data.title)
    setContent(note.data.content)
    setSpace(note.data.space)
    setTags(note.data.tags)
    setIsPinned(note.data.is_pinned)
  }, [note.data])

  async function save(event: FormEvent) {
    event.preventDefault()
    const data = { title, content, space, tags, is_pinned: isPinned }

    try {
      if (isNew) {
        const created = await create.mutateAsync(data)
        navigate(`/notes/${created.id}`)
      } else {
        const isOwner = Boolean(note.data?.is_owner)
        await update.mutateAsync({
          id: noteId,
          note: isOwner ? data : { title, content },
          isOwner,
        })
      }
    } catch {
      // The mutation state displays the error below the editor.
    }
  }

  async function deleteCurrentNote() {
    if (!window.confirm('Удалить заметку?')) return
    await remove.mutateAsync(noteId)
    navigate('/')
  }

  async function toggleCurrentPin() {
    const nextValue = !isPinned
    setIsPinned(nextValue)
    if (!isNew) await pin.mutateAsync({ id: noteId, value: nextValue })
  }

  async function addUser() {
    if (!shareEmail.trim()) return
    try {
      await share.mutateAsync({ id: noteId, email: shareEmail.trim() })
      setShareEmail('')
    } catch {
      // The message below explains that sharing failed.
    }
  }

  async function removeUser(email: string) {
    await share.mutateAsync({ id: noteId, email, remove: true })
  }

  if (!isNew && note.isLoading) return <div className="empty-state">Загрузка...</div>
  if (!isNew && note.isError) return <div className="error">Заметка не найдена</div>

  return (
    <form className="editor" onSubmit={save}>
      <div className="editor-toolbar">
        <Link className="secondary-button" to="/">
          ← К списку
        </Link>
        {(isNew || note.data?.is_owner) && (
          <PinButton onClick={toggleCurrentPin} pinned={isPinned} />
        )}
        {!isNew && note.data?.is_owner && (
          <button className="danger-button" onClick={deleteCurrentNote} type="button">
            Удалить
          </button>
        )}
        <button
          className="primary-button"
          disabled={create.isPending || update.isPending}
          type="submit"
        >
          Сохранить
        </button>
      </div>

      <input
        className="title-input"
        maxLength={255}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Заголовок"
        required
        value={title}
      />
      <textarea
        className="content-input"
        onChange={(event) => setContent(event.target.value)}
        placeholder="Введите текст заметки..."
        value={content}
      />

      {(isNew || note.data?.is_owner) && (
        <div className="editor-options">
          <SpaceSelect onChange={setSpace} spaces={spaces.data || []} value={space} />
          <TagPicker onChange={setTags} tags={tagsList.data || []} value={tags} />
        </div>
      )}

      {!isNew && note.data && !note.data.is_owner && (
        <p>Автор: {note.data.owner.name || note.data.owner.email}. Вы можете изменить заголовок и текст.</p>
      )}

      {!isNew && note.data?.is_owner && note.data.space !== null && (
        <section className="share-section">
          <h2>Доступ к заметке</h2>
          <p>Приглашённый пользователь сможет изменить заголовок и текст.</p>
          <div className="share-row">
            <input
              onChange={(event) => setShareEmail(event.target.value)}
              placeholder="Email пользователя"
              type="email"
              value={shareEmail}
            />
            <button disabled={share.isPending} onClick={addUser} type="button">
              Разрешить доступ
            </button>
          </div>
          {note.data.shared_with.map((user) => (
            <div className="share-row" key={user.id}>
              <span>{user.name || user.email} ({user.email})</span>
              <button onClick={() => removeUser(user.email)} type="button">
                Убрать доступ
              </button>
            </div>
          ))}
          {share.isError && <div className="error">Не удалось изменить доступ. Проверьте email.</div>}
        </section>
      )}

      {!isNew && note.data?.is_owner && note.data.space === null && (
        <p>Чтобы поделиться заметкой, сначала выберите пространство и сохраните.</p>
      )}

      {!isNew && note.data?.is_owner && (
        <AttachmentList
          attachments={note.data.attachments}
          noteId={noteId}
          onChange={() => note.refetch()}
        />
      )}

      {(create.isError || update.isError) && (
        <div className="error">Не удалось сохранить заметку</div>
      )}
    </form>
  )
}
