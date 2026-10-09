from rest_framework import serializers

from .models import Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name")

    def validate_name(self, value):
        user = self.context["request"].user
        tags = Tag.objects.filter(user=user, name=value)

        if self.instance:
            tags = tags.exclude(id=self.instance.id)

        if tags.exists():
            raise serializers.ValidationError("Такой тег уже существует.")

        return value
