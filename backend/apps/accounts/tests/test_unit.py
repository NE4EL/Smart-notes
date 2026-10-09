from django.test import TestCase

from apps.accounts.models import User
from apps.accounts.serializers import RegisterSerializer


class UserModelTests(TestCase):
    def test_create_user_hashes_password_and_normalizes_email(self):
        user = User.objects.create_user(
            email="Student@EXAMPLE.COM",
            password="strongpass123",
        )

        self.assertEqual(user.email, "Student@example.com")
        self.assertTrue(user.check_password("strongpass123"))
        self.assertNotEqual(user.password, "strongpass123")
        self.assertEqual(str(user), user.email)

    def test_create_user_requires_email(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(email="", password="strongpass123")

    def test_create_superuser_sets_flags(self):
        user = User.objects.create_superuser(
            email="admin@example.com",
            password="strongpass123",
        )

        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)


class RegisterSerializerTests(TestCase):
    def test_serializer_creates_user(self):
        serializer = RegisterSerializer(
            data={
                "email": "new@example.com",
                "password": "strongpass123",
                "name": "New User",
            }
        )

        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.name, "New User")
        self.assertTrue(user.check_password("strongpass123"))

    def test_serializer_rejects_short_password(self):
        serializer = RegisterSerializer(
            data={
                "email": "new@example.com",
                "password": "short",
                "name": "New User",
            }
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)
