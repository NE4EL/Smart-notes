from rest_framework import status
from rest_framework.test import APITestCase


class BackendSmokeTests(APITestCase):
    def test_schema_and_docs_are_available(self):
        self.assertEqual(
            self.client.get("/api/schema/").status_code,
            status.HTTP_200_OK,
        )
        self.assertEqual(
            self.client.get("/api/docs/").status_code,
            status.HTTP_200_OK,
        )

    def test_notes_require_authentication(self):
        response = self.client.get("/api/notes")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
