from django.conf import settings
from django.db import models


class Space(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="spaces",
    )
    name = models.CharField(max_length=100)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name"],
                name="uq_space_user_name",
            )
        ]

    def __str__(self):
        return self.name
