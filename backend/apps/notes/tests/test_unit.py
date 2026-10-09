from uuid import uuid4

from django.test import TestCase

from apps.accounts.models import User
from apps.notes.models import Note
from apps.spaces.models import Space
from apps.tags.models import Tag


class NoteModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email=f"unit-{uuid4()}@example.com",
            password="strongpass123",
        )

    def test_note_defaults_and_string(self):
        note = Note.objects.create(user=self.user, title="Первая заметка")

        self.assertEqual(str(note), "Первая заметка")
        self.assertEqual(note.content, "")
        self.assertFalse(note.is_pinned)
        self.assertIsNone(note.space)

    def test_note_can_have_space_and_many_tags(self):
        space = Space.objects.create(user=self.user, name="Учёба")
        first_tag = Tag.objects.create(user=self.user, name="важное")
        second_tag = Tag.objects.create(user=self.user, name="срочно")
        note = Note.objects.create(
            user=self.user,
            space=space,
            title="Экзамен",
        )
        note.tags.add(first_tag, second_tag)

        self.assertEqual(note.space, space)
        self.assertEqual(note.tags.count(), 2)

    def test_deleting_space_keeps_note(self):
        space = Space.objects.create(user=self.user, name="Учёба")
        note = Note.objects.create(user=self.user, space=space, title="Экзамен")

        space.delete()
        note.refresh_from_db()

        self.assertIsNone(note.space)
