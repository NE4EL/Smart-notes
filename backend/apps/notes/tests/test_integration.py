import tempfile
from uuid import uuid4

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase


class NotesIntegrationTests(APITestCase):
    def test_complete_notes_flow(self):
        email = f"flow-{uuid4()}@example.com"
        self.client.post(
            "/api/auth/register",
            {
                "email": email,
                "password": "strongpass123",
                "name": "Student",
            },
            format="json",
        )
        login = self.client.post(
            "/api/auth/login",
            {"email": email, "password": "strongpass123"},
            format="json",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login.data['access']}"
        )

        space = self.client.post("/api/spaces", {"name": "Учёба"}, format="json")
        tag = self.client.post("/api/tags", {"name": "важное"}, format="json")
        note = self.client.post(
            "/api/notes",
            {
                "title": "Экзамен",
                "content": "Повторить Django",
                "space": space.data["id"],
                "tags": [tag.data["id"]],
            },
            format="json",
        )
        self.assertEqual(note.status_code, status.HTTP_201_CREATED)

        pinned = self.client.patch(
            f"/api/notes/{note.data['id']}",
            {"is_pinned": True},
            format="json",
        )
        self.assertTrue(pinned.data["is_pinned"])

        with tempfile.TemporaryDirectory() as media_root:
            with self.settings(MEDIA_ROOT=media_root):
                attachment = self.client.post(
                    f"/api/notes/{note.data['id']}/attachments",
                    {"file": SimpleUploadedFile("plan.txt", b"plan")},
                    format="multipart",
                )
                self.assertEqual(attachment.status_code, status.HTTP_201_CREATED)

        notes = self.client.get("/api/notes?search=экзамен")
        self.assertEqual(notes.data["count"], 1)

        deleted = self.client.delete(f"/api/notes/{note.data['id']}")
        self.assertEqual(deleted.status_code, status.HTTP_204_NO_CONTENT)
