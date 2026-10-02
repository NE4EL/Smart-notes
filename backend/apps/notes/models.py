from django.db import models


class Space(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Note(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    space = models.ForeignKey(
        Space,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notes",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
