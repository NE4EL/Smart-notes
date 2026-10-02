from rest_framework.exceptions import ValidationError
from rest_framework.viewsets import ModelViewSet

from .models import Note, Space
from .serializers import NoteSerializer, SpaceSerializer


# ModelViewSet уже умеет получать, создавать, изменять и удалять записи.
class SpaceViewSet(ModelViewSet):
    queryset = Space.objects.all().order_by("name")
    serializer_class = SpaceSerializer


class NoteViewSet(ModelViewSet):
    queryset = Note.objects.all().order_by("-updated_at")
    serializer_class = NoteSerializer

    def get_queryset(self):
        notes = super().get_queryset()
        space_id = self.request.query_params.get("space")
        if self.action == "list" and space_id is not None:
            try:
                space_id = int(space_id)
            except ValueError:
                raise ValidationError({"space": "Укажите номер пространства."})
            if space_id < 1 or space_id > 9223372036854775807:
                raise ValidationError({"space": "Неверный номер пространства."})
            notes = notes.filter(space_id=space_id)
        return notes
