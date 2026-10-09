from rest_framework import serializers

from apps.accounts.serializers import UserSerializer

from .models import Attachment, Note


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ("id", "file", "uploaded_at")
        read_only_fields = ("id", "uploaded_at")


class NoteSerializer(serializers.ModelSerializer):
    attachments = AttachmentSerializer(many=True, read_only=True)
    owner = UserSerializer(source="user", read_only=True)
    space_name = serializers.CharField(source="space.name", read_only=True)
    shared_with = UserSerializer(many=True, read_only=True)
    is_owner = serializers.SerializerMethodField()

    def get_is_owner(self, obj):
        return obj.user_id == self.context["request"].user.id

    class Meta:
        model = Note
        fields = (
            "id",
            "owner",
            "is_owner",
            "title",
            "content",
            "space",
            "space_name",
            "tags",
            "shared_with",
            "is_pinned",
            "attachments",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id", "owner", "space_name", "shared_with", "attachments",
            "created_at", "updated_at",
        )

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
