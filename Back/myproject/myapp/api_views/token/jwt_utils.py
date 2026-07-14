# JWT 인증 유틸

from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

from ...models import Admin_Login_Info, User_Login_Info


class CustomRefreshToken(RefreshToken):
    @classmethod
    def for_subject(cls, subject_value, **extra_claims):
        token = cls()
        token["sub"] = subject_value

        for key, value in extra_claims.items():
            token[key] = value

        token.set_exp(lifetime=cls.lifetime)
        return token


class AdminJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        admin_uuid = validated_token.get("sub")
        if not admin_uuid:
            raise AuthenticationFailed("Token is missing admin identifier (sub).")

        try:
            return Admin_Login_Info.objects.get(admin_uuid=admin_uuid)
        except Admin_Login_Info.DoesNotExist:
            raise AuthenticationFailed("Admin user not found.")
        except Exception as e:
            raise AuthenticationFailed(f"Admin user lookup failed: {e}")


class UserJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_uuid = validated_token.get("sub")
        if not user_uuid:
            raise AuthenticationFailed("Token is missing employee number (sub).")

        try:
            return User_Login_Info.objects.get(user_uuid=user_uuid)
        except User_Login_Info.DoesNotExist:
            raise AuthenticationFailed("General user not found.")
