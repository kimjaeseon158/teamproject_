# jwt_utils.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

class CustomRefreshToken(RefreshToken):
    @classmethod
    def for_subject(cls, subject_value, **extra_claims):
        """
        subject_value : JWT의 고유 식별자 (ex: employee_number, admin_id 등)
        extra_claims  : 추가로 넣을 claim
        """
        token = cls()

        # ✅ 내가 지정한 값으로 sub 교체
        token['sub'] = subject_value

        # ✅ 추가 claim 넣기
        for key, value in extra_claims.items():
            token[key] = value

        token.set_exp(lifetime=cls.lifetime)  # 만료시간 보장
        return token


def get_user_from_cookie(request):
    token = request.COOKIES.get('access_token')
    if not token:
        raise AuthenticationFailed("No access token in cookies")
    
    jwt_auth = JWTAuthentication()
    validated_token = jwt_auth.get_validated_token(token)

    return validated_token # ✅ 사용자 객체 대신 디코딩된 토큰 자체를 반환

def get_user_from_token(token_str):
    """
    Access Token 문자열로부터 사용자 반환
    """
    from rest_framework_simplejwt.authentication import JWTAuthentication
    jwt_auth = JWTAuthentication()
    validated_token = jwt_auth.get_validated_token(token_str)
    user = jwt_auth.get_user(validated_token)
    return user

