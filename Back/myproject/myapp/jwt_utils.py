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

class CustomJWTAuthentication(BaseAuthentication):
    # Authorization 헤더에서 JWT 인증.
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header:
            return None # 인증이 필요하지 않은 경우(AllowAny)를 위해 None 반환

        parts = auth_header.split()
        
        if parts[0].lower() != 'bearer' or len(parts) != 2:
            # 토큰 형식 오류
            raise AuthenticationFailed("Invalid token header format.")
        
        token = parts[1]
        
        try:
            # simplejwt의 JWTAuthentication을 사용하여 유효성 검증 재사용
            # user 객체를 가져오거나, user 객체를 구할 수 없다면 None을 반환
            simplejwt_auth = JWTAuthentication()
            user, validated_token = simplejwt_auth.authenticate(request)
            
            # 여기서 user 객체가 있다면 (user, validated_token) 튜플을 반환
            # user 객체를 가져올 수 없다면 (None, validated_token)을 반환할 수도 있습니다.
            return user, validated_token 

        except Exception:
            # 토큰 만료, 잘못된 서명 등 인증 실패
            raise AuthenticationFailed("Invalid or expired token.")
        
class AdminJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        """ validated_token['sub']를 사용하여 Admin_Login_Info 모델에서 사용자를 찾습니다. """
        
        # Admin 토큰의 sub 클레임에 있는 admin_id 값 획득
        admin_id = validated_token.get('sub') 
        if not admin_id:
            raise AuthenticationFailed("Token is missing admin identifier (sub).")

        try:
            # 🌟 Admin_Login_Info 모델에서 조회
            return Admin_Login_Info.objects.get(admin_id=admin_id)
        except Admin_Login_Info.DoesNotExist:
            raise AuthenticationFailed("Admin user not found.")
        except Exception as e:
            # DB 조회 과정 중 다른 예외 처리
            raise AuthenticationFailed(f"Admin user lookup failed: {e}")


# 💡 User 모델용 인증 클래스 (User_Login_Info는 employee_number를 식별자로 사용한다고 가정)
class UserJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        """ validated_token['sub']를 사용하여 User_Login_Info 모델에서 사용자를 찾습니다. """
        
        employee_number = validated_token.get('sub')
        if not employee_number:
            raise AuthenticationFailed("Token is missing employee number (sub).")

        try:
            # 🌟 User_Login_Info 모델에서 조회
            return User_Login_Info.objects.get(employee_number=employee_number)
        except User_Login_Info.DoesNotExist:
            raise AuthenticationFailed("General user not found.")
        
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

