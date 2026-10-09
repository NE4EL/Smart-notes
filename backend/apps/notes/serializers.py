from rest_framework import serializers

from .models import Attachment, Note


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ("id", "file", "uploaded_at")
        read_only_fields = ("id", "uploaded_at")


class NoteSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Note
        fields = (
            "id",
            "title",
            "content",
            "space",
            "tags",
            "is_pinned",
            "attachments",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "attachments", "created_at", "updated_at")

    def validate(self, data):
        user = self.context["request"].user
        space = data.get("space")
        tags = data.get("tags", [])

        if space and space.user != user:
            raise serializers.ValidationError(
                {"space": "Нельзя выбрать чужое пространство."}
            )

        if any(tag.user != user for tag in tags):
            raise serializers.ValidationError({"tags": "Нельзя выбрать чужой тег."})

        return data
