from uuid import uuid4

from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User


class AuthIntegrationTests(APITestCase):
    def test_register_login_refresh_and_logout(self):
        email = f"auth-{uuid4()}@example.com"
        register = self.client.post(
            "/api/auth/register",
            {
                "email": email,
                "password": "strongpass123",
                "name": "Student",
            },
            format="json",
        )
        self.assertEqual(register.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.get(email=email).check_password("strongpass123"))

        login = self.client.post(
            "/api/auth/login",
            {"email": email, "password": "strongpass123"},
            format="json",
        )
        self.assertEqual(login.status_code, status.HTTP_200_OK)

        refreshed = self.client.post(
            "/api/auth/refresh",
            {"refresh": login.data["refresh"]},
            format="json",
        )
        self.assertEqual(refreshed.status_code, status.HTTP_200_OK)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {refreshed.data['access']}"
        )
        logout = self.client.post(
            "/api/auth/logout",
            {"refresh": refreshed.data["refresh"]},
            format="json",
        )
        self.assertEqual(logout.status_code, status.HTTP_204_NO_CONTENT)

        blocked = self.client.post(
            "/api/auth/refresh",
            {"refresh": refreshed.data["refresh"]},
            format="json",
        )
        self.assertEqual(blocked.status_code, status.HTTP_401_UNAUTHORIZED)
