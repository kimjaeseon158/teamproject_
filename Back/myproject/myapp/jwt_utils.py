# jwt_utils.py
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

def get_user_from_cookie(request):
    token = request.COOKIES.get('access_token')
    if not token:
        raise AuthenticationFailed("No access token in cookies")
    
    jwt_auth = JWTAuthentication()
    validated_token = jwt_auth.get_validated_token(token)

    # user = jwt_auth.get_user(validated_token) # ❗️ 이 줄을 주석 처리하거나 삭제
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
