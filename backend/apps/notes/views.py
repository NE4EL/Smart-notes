from django.contrib.postgres.search import SearchQuery, SearchVector
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.generics import DestroyAPIView, ListCreateAPIView
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.accounts.models import User
from apps.common.permissions import IsOwner

from .filters import NoteFilter
from .models import Attachment, Note
from .serializers import AttachmentSerializer, NoteSerializer


class NoteViewSet(ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = NoteFilter

    def get_queryset(self):
        queryset = Note.objects.filter(
            Q(user=self.request.user)
            | Q(shared_with=self.request.user, space__isnull=False)
        ).distinct().select_related("space", "user").prefetch_related(
            "tags", "attachments", "shared_with"
        )

        scope = self.request.query_params.get("scope")
        if scope == "mine":
            queryset = queryset.filter(user=self.request.user)
        elif scope == "shared":
            queryset = queryset.exclude(user=self.request.user)

        search = self.request.query_params.get("search")
        if search:
            vector = SearchVector("title", "content", config="russian")
            query = SearchQuery(search, config="russian")
            queryset = queryset.annotate(search_vector=vector).filter(
                Q(search_vector=query)
                | Q(title__icontains=search)
                | Q(content__icontains=search)
            )

        ordering = self.request.query_params.get("ordering", "-updated_at")
        allowed_ordering = {
            "created_at",
            "updated_at",
            "-created_at",
            "-updated_at",
        }
        if ordering not in allowed_ordering:
            ordering = "-updated_at"

        return queryset.order_by("-is_pinned", ordering)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        note = self.get_object()
        if note.user_id != request.user.id:
            if set(request.data) - {"title", "content"}:
                raise PermissionDenied("Можно менять только заголовок и текст.")
            kwargs["partial"] = True
        return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        old_space_id = serializer.instance.space_id
        note = serializer.save()
        if note.space_id != old_space_id:
            note.shared_with.clear()

    def destroy(self, request, *args, **kwargs):
        if self.get_object().user_id != request.user.id:
            raise PermissionDenied("Удалять заметку может только автор.")
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post", "delete"])
    def share(self, request, pk=None):
        note = self.get_object()
        if not note.space_id or note.space.user_id != request.user.id:
            raise PermissionDenied(
                "Доступом управляет создатель пространства."
            )

        email = request.data.get("email", "").strip()
        if not email:
            raise ValidationError({"email": "Укажите email пользователя."})

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            raise ValidationError({"email": "Пользователь не найден."})
        if user.id == request.user.id:
            raise ValidationError({"email": "Нельзя пригласить себя."})

        if request.method == "POST":
            note.shared_with.add(user)
        else:
            note.shared_with.remove(user)

        return Response(self.get_serializer(note).data, status=status.HTTP_200_OK)


class AttachmentView(ListCreateAPIView):
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_note(self):
        return get_object_or_404(
            Note,
            id=self.kwargs["note_id"],
            user=self.request.user,
        )

    def get_queryset(self):
        return Attachment.objects.filter(note=self.get_note()).order_by("id")

    def perform_create(self, serializer):
        serializer.save(note=self.get_note())


class AttachmentDetailView(DestroyAPIView):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Attachment.objects.filter(note__user=self.request.user)
