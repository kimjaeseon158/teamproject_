# JWT refresh token 갱신 API

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken


class TokenRefreshAPIView(APIView):
    permission_classes = []

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response(
                {"success": False, "message": "Refresh token missing"}, status=401
            )

        try:
            refresh_obj = RefreshToken(refresh_token)
            role = refresh_obj.get("role", "")
            new_access = refresh_obj.access_token

            return Response({"success": True, "access": str(new_access), "Role": role})
        except Exception:
            return Response(
                {"success": False, "message": "Invalid refresh token"}, status=401
            )
