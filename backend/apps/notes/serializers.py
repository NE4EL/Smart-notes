from rest_framework import serializers

from .models import Note, Space


class SpaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Space
        fields = ["id", "name"]


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "space", "created_at", "updated_at"]
        read_only_fields = ["created_at", "updated_at"]
