from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions

class CookieJWTAuthentication(JWTAuthentication):
    """
    JWT를 http-only 쿠키에서 읽어오는 인증 클래스
    """
    def authenticate(self, request):
        token = request.COOKIES.get('access_token')  # 쿠키 이름
        if not token:
            return None  # 인증 안된 상태 반환

        try:
            validated_token = self.get_validated_token(token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except Exception:
            raise exceptions.AuthenticationFailed('Invalid token in cookie')
