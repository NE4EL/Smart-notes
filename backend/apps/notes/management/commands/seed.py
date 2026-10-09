from django.core.management.base import BaseCommand

from apps.accounts.models import User
from apps.notes.models import Note
from apps.spaces.models import Space
from apps.tags.models import Tag


class Command(BaseCommand):
    help = "Создаёт простые тестовые данные"

    def handle(self, *args, **options):
        user, _ = User.objects.get_or_create(
            email="demo@example.com",
            defaults={"name": "Demo"},
        )
        user.set_password("demo12345")
        user.save()

        space, _ = Space.objects.get_or_create(user=user, name="Учёба")
        tag, _ = Tag.objects.get_or_create(user=user, name="важное")
        note, _ = Note.objects.get_or_create(
            user=user,
            title="Первая заметка",
            defaults={
                "content": "Тестовая заметка для знакомства с проектом",
                "space": space,
            },
        )
        note.tags.add(tag)

        self.stdout.write(self.style.SUCCESS("Тестовые данные созданы"))
