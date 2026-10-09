from django_filters import rest_framework as filters

from .models import Note


class NoteFilter(filters.FilterSet):
    tags = filters.CharFilter(method="filter_tags")

    class Meta:
        model = Note
        fields = ("space", "tags")

    def filter_tags(self, queryset, name, value):
        try:
            tag_ids = [int(tag_id) for tag_id in value.split(",")]
        except ValueError:
            return queryset.none()

        return queryset.filter(tags__id__in=tag_ids).distinct()
