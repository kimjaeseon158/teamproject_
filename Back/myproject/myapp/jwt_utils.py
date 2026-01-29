# jwt_utils.py
from rest_framework.authentication import BaseAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Admin_Login_Info, User_Login_Info

class CustomRefreshToken(RefreshToken):
    @classmethod
    def for_subject(cls, subject_value, **extra_claims):
        """
        subject_value : JWT의 고유 식별자 (ex: admin_uuid, user_uuid 등)
        extra_claims  : 추가로 넣을 claim
        """
        token = cls()

        #  내가 지정한 값으로 sub 교체
        token['sub'] = subject_value

        #  추가 claim 넣기
        for key, value in extra_claims.items():
            token[key] = value

        token.set_exp(lifetime=cls.lifetime)  # 만료시간 보장
        return token

class AdminJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        """ validated_token['sub']를 사용하여 Admin_Login_Info 모델에서 관리자를 찾습니다. """

        admin_uuid = validated_token.get("sub")
        if not admin_uuid:
            raise AuthenticationFailed("Token is missing admin identifier (sub).")

        try:
            return Admin_Login_Info.objects.get(admin_uuid=admin_uuid)

        except Admin_Login_Info.DoesNotExist:
            raise AuthenticationFailed("Admin user not found.")

        except Exception as e:
            # DB 조회 과정 중 다른 예외 처리
            raise AuthenticationFailed(f"Admin user lookup failed: {e}")


# 💡 User 모델용 인증 클래스 (User_Login_Info는 user_uuid 식별자로 사용한다고 가정)
class UserJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        """ validated_token['sub']를 사용하여 User_Login_Info 모델에서 사용자를 찾습니다. """
        
        user_uuid  = validated_token.get('sub')
        if not user_uuid :
            raise AuthenticationFailed("Token is missing employee number (sub).")

        try:
            # 🌟 User_Login_Info 모델에서 조회
            return User_Login_Info.objects.get(user_uuid =user_uuid )
        except User_Login_Info.DoesNotExist:
            raise AuthenticationFailed("General user not found.")
