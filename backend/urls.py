from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.notes.views import NoteViewSet, SpaceViewSet

router = DefaultRouter(trailing_slash=False)
router.register("spaces", SpaceViewSet)
router.register("notes", NoteViewSet)

urlpatterns = [path("api/", include(router.urls))]
