from django.contrib.postgres.search import SearchQuery, SearchVector
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.generics import DestroyAPIView, ListCreateAPIView
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from apps.common.permissions import IsOwner

from .filters import NoteFilter
from .models import Attachment, Note
from .serializers import AttachmentSerializer, NoteSerializer


class NoteViewSet(ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend]
    filterset_class = NoteFilter

    def get_queryset(self):
        queryset = (
            Note.objects.filter(user=self.request.user)
            .select_related("space")
            .prefetch_related("tags", "attachments")
        )

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
