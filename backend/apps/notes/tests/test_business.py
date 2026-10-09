import os
import tempfile
from uuid import uuid4

from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.notes.models import Note
from apps.spaces.models import Space
from apps.tags.models import Tag


class NoteBusinessTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email=f"first-{uuid4()}@example.com",
            password="strongpass123",
        )
        self.other_user = User.objects.create_user(
            email=f"second-{uuid4()}@example.com",
            password="strongpass123",
        )
        self.space = Space.objects.create(user=self.user, name="Учёба")
        self.tag = Tag.objects.create(user=self.user, name="важное")
        self.client.force_authenticate(self.user)

    def test_space_and_tag_names_are_unique_for_one_user(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Space.objects.create(user=self.user, name="Учёба")

        with self.assertRaises(IntegrityError), transaction.atomic():
            Tag.objects.create(user=self.user, name="важное")

        other_space = Space.objects.create(user=self.other_user, name="Учёба")
        other_tag = Tag.objects.create(user=self.other_user, name="важное")
        self.assertIsNotNone(other_space.id)
        self.assertIsNotNone(other_tag.id)

    def test_user_cannot_read_foreign_note(self):
        note = Note.objects.create(user=self.other_user, title="Чужая заметка")

        response = self.client.get(f"/api/notes/{note.id}")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_owner_shares_only_one_note_in_space(self):
        shared = Note.objects.create(
            user=self.user, space=self.space, title="Общая"
        )
        private = Note.objects.create(
            user=self.user, space=self.space, title="Личная"
        )

        invited = self.client.post(
            f"/api/notes/{shared.id}/share",
            {"email": self.other_user.email},
            format="json",
        )
        self.assertEqual(invited.status_code, status.HTTP_200_OK)
        self.assertEqual(
            invited.data["shared_with"][0]["email"],
            self.other_user.email,
        )

        self.client.force_authenticate(self.other_user)
        notes = self.client.get("/api/notes?scope=shared")
        self.assertEqual(notes.data["count"], 1)
        self.assertEqual(notes.data["results"][0]["id"], shared.id)
        self.assertEqual(
            self.client.get(f"/api/notes/{private.id}").status_code,
            status.HTTP_404_NOT_FOUND,
        )

        changed = self.client.patch(
            f"/api/notes/{shared.id}",
            {"title": "Изменено вторым пользователем"},
            format="json",
        )
        self.assertEqual(changed.status_code, status.HTTP_200_OK)
        self.assertEqual(changed.data["title"], "Изменено вторым пользователем")
        self.assertEqual(
            self.client.delete(f"/api/notes/{shared.id}").status_code,
            status.HTTP_403_FORBIDDEN,
        )
        self.assertEqual(
            self.client.patch(
                f"/api/notes/{shared.id}",
                {"space": None},
                format="json",
            ).status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.client.force_authenticate(self.user)
        revoked = self.client.delete(
            f"/api/notes/{shared.id}/share",
            {"email": self.other_user.email},
            format="json",
        )
        self.assertEqual(revoked.status_code, status.HTTP_200_OK)
        self.assertEqual(revoked.data["shared_with"], [])

        self.client.force_authenticate(self.other_user)
        self.assertEqual(
            self.client.get(f"/api/notes/{shared.id}").status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_note_without_space_cannot_be_shared(self):
        note = Note.objects.create(user=self.user, title="Без пространства")

        response = self.client.post(
            f"/api/notes/{note.id}/share",
            {"email": self.other_user.email},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_moving_note_out_of_space_removes_access(self):
        note = Note.objects.create(
            user=self.user, space=self.space, title="Общая"
        )
        note.shared_with.add(self.other_user)

        response = self.client.patch(
            f"/api/notes/{note.id}", {"space": None}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        note.refresh_from_db()
        self.assertEqual(note.shared_with.count(), 0)

        self.client.force_authenticate(self.other_user)
        self.assertEqual(
            self.client.get(f"/api/notes/{note.id}").status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_user_cannot_assign_foreign_space_or_tag(self):
        foreign_space = Space.objects.create(user=self.other_user, name="Личное")
        foreign_tag = Tag.objects.create(user=self.other_user, name="секрет")

        response = self.client.post(
            "/api/notes",
            {
                "title": "Проверка",
                "space": foreign_space.id,
                "tags": [foreign_tag.id],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_pinned_notes_are_always_first(self):
        usual = Note.objects.create(user=self.user, title="Обычная")
        pinned = Note.objects.create(
            user=self.user,
            title="Закреплённая",
            is_pinned=True,
        )

        response = self.client.get("/api/notes?ordering=created_at")

        self.assertEqual(response.data["results"][0]["id"], pinned.id)
        self.assertEqual(response.data["results"][1]["id"], usual.id)

    def test_search_finds_part_of_word_and_word_form(self):
        Note.objects.create(user=self.user, title="Полезная заметка")

        partial = self.client.get("/api/notes?search=замет")
        word_form = self.client.get("/api/notes?search=заметки")

        self.assertEqual(partial.data["count"], 1)
        self.assertEqual(word_form.data["count"], 1)

    def test_filters_by_space_and_tag(self):
        expected = Note.objects.create(
            user=self.user,
            space=self.space,
            title="Нужная",
        )
        expected.tags.add(self.tag)
        Note.objects.create(user=self.user, title="Другая")

        response = self.client.get(
            f"/api/notes?space={self.space.id}&tags={self.tag.id}"
        )

        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], expected.id)

    def test_attachment_file_is_deleted_with_note(self):
        with tempfile.TemporaryDirectory() as media_root:
            with self.settings(MEDIA_ROOT=media_root):
                note = Note.objects.create(user=self.user, title="С файлом")
                uploaded = self.client.post(
                    f"/api/notes/{note.id}/attachments",
                    {"file": SimpleUploadedFile("plan.txt", b"study plan")},
                    format="multipart",
                )
                file_name = uploaded.data["file"].split("/media/")[-1]
                file_path = os.path.join(media_root, file_name)
                self.assertTrue(os.path.exists(file_path))

                self.client.delete(f"/api/notes/{note.id}")

                self.assertFalse(os.path.exists(file_path))
