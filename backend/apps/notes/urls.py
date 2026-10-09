from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.spaces.views import SpaceViewSet
from apps.tags.views import TagViewSet

from .views import AttachmentDetailView, AttachmentView, NoteViewSet

router = DefaultRouter(trailing_slash=False)
router.register("notes", NoteViewSet, basename="note")
router.register("spaces", SpaceViewSet, basename="space")
router.register("tags", TagViewSet, basename="tag")

urlpatterns = [
    path(
        "notes/<int:note_id>/attachments",
        AttachmentView.as_view(),
        name="note-attachments",
    ),
    path(
        "attachments/<int:pk>",
        AttachmentDetailView.as_view(),
        name="attachment-detail",
    ),
] + router.urls
