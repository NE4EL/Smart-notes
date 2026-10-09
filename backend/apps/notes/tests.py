import os
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.spaces.models import Space
from apps.tags.models import Tag

from .models import Note


class NoteApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="first@example.com",
            password="strongpass123",
        )
        self.other_user = User.objects.create_user(
            email="second@example.com",
            password="strongpass123",
        )
        self.space = Space.objects.create(user=self.user, name="Учёба")
        self.tag = Tag.objects.create(user=self.user, name="важное")
        self.client.force_authenticate(self.user)

    def test_create_search_filter_and_pin_note(self):
        created = self.client.post(
            "/api/notes",
            {
                "title": "Подготовка к экзамену",
                "content": "Изучить Django",
                "space": self.space.id,
                "tags": [self.tag.id],
            },
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)

        pinned = self.client.patch(
            f"/api/notes/{created.data['id']}",
            {"is_pinned": True},
            format="json",
        )
        self.assertTrue(pinned.data["is_pinned"])

        result = self.client.get(
            f"/api/notes?search=экзам&space={self.space.id}&tags={self.tag.id}"
        )
        self.assertEqual(result.status_code, status.HTTP_200_OK)
        self.assertEqual(result.data["count"], 1)
        self.assertEqual(result.data["results"][0]["id"], created.data["id"])

    def test_foreign_note_returns_404(self):
        note = Note.objects.create(user=self.other_user, title="Чужая заметка")

        response = self.client.get(f"/api/notes/{note.id}")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_use_foreign_space_or_tag(self):
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

    def test_attachment_file_is_deleted_with_note(self):
        with tempfile.TemporaryDirectory() as media_root:
            with self.settings(MEDIA_ROOT=media_root):
                note = Note.objects.create(user=self.user, title="С файлом")
                uploaded = self.client.post(
                    f"/api/notes/{note.id}/attachments",
                    {"file": SimpleUploadedFile("plan.txt", b"study plan")},
                    format="multipart",
                )
                self.assertEqual(uploaded.status_code, status.HTTP_201_CREATED)

                file_name = uploaded.data["file"].split("/media/")[-1]
                file_path = os.path.join(media_root, file_name)
                self.assertTrue(os.path.exists(file_path))

                deleted = self.client.delete(f"/api/notes/{note.id}")
                self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)
                self.assertFalse(os.path.exists(file_path))
