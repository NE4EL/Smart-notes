from rest_framework import serializers

from .models import Space


class SpaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Space
        fields = ("id", "name")

    def validate_name(self, value):
        user = self.context["request"].user
        spaces = Space.objects.filter(user=user, name=value)

        if self.instance:
            spaces = spaces.exclude(id=self.instance.id)

        if spaces.exists():
            raise serializers.ValidationError("Такое пространство уже существует.")

        return value
