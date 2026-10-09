from types import SimpleNamespace

from django.test import SimpleTestCase

from apps.common.pagination import DefaultPagination
from apps.common.permissions import IsOwner


class CommonUnitTests(SimpleTestCase):
    def test_default_pagination_settings(self):
        pagination = DefaultPagination()

        self.assertEqual(pagination.page_size, 20)
        self.assertEqual(pagination.page_size_query_param, "page_size")
        self.assertEqual(pagination.max_page_size, 100)

    def test_is_owner_accepts_direct_owner(self):
        user = object()
        request = SimpleNamespace(user=user)
        note = SimpleNamespace(user=user)

        allowed = IsOwner().has_object_permission(request, None, note)

        self.assertTrue(allowed)

    def test_is_owner_accepts_attachment_owner(self):
        user = object()
        request = SimpleNamespace(user=user)
        attachment = SimpleNamespace(note=SimpleNamespace(user=user))

        allowed = IsOwner().has_object_permission(request, None, attachment)

        self.assertTrue(allowed)
