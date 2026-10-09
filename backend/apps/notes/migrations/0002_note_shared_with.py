from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("notes", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="note",
            name="shared_with",
            field=models.ManyToManyField(
                blank=True,
                related_name="shared_notes",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
