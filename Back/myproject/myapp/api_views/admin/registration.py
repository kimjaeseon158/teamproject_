import hashlib
from collections.abc import Mapping

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.utils.crypto import constant_time_compare
from django.views.decorators.debug import sensitive_post_parameters
from django.utils.decorators import method_decorator
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from ...admin_codes import generate_admin_code
from ...models import Admin_Login_Info
from ...serializers import AdminRegistrationSerializer


@method_decorator(sensitive_post_parameters('password', 'registration_password'), name='dispatch')
class AdminRegistrationAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = []

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response['Cache-Control'] = 'no-store'
        return response

    def post(self, request):
        # Never trust client-supplied forwarded IP headers.
        peer = request.META.get('REMOTE_ADDR') or 'unknown'
        key = 'admin-registration:' + hashlib.sha256(peer.encode()).hexdigest()
        try:
            if cache.add(key, 1, timeout=60):
                count = 1
            else:
                try:
                    count = cache.incr(key)
                except ValueError:
                    count = 1 if cache.add(key, 1, timeout=60) else cache.incr(key)
        except Exception:
            return Response({'message': 'Registration temporarily unavailable.'}, status=503)
        if count > 5:
            return Response({'message': 'Too many requests.'}, status=429, headers={'Retry-After': '60'})
        if not isinstance(request.data, Mapping):
            return Response({'message': 'Invalid input.'}, status=400)
        configured = settings.ADMIN_REGISTRATION_PASSWORD
        supplied = request.data.get('registration_password')
        if not configured or not isinstance(supplied, str) or not constant_time_compare(configured, supplied):
            return Response({'message': 'Registration authorization denied.'}, status=403)
        serializer = AdminRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'message': 'Invalid input.', 'errors': serializer.errors}, status=400)
        data = serializer.validated_data
        if Admin_Login_Info.objects.filter(admin_id=data['admin_id']).exists():
            return Response({'message': 'Admin ID already exists.'}, status=409)
        code = generate_admin_code()
        try:
            with transaction.atomic():
                admin = Admin_Login_Info.objects.create(
                    admin_id=data['admin_id'], admin_name=data['admin_name'], admin_code=code,
                    password=make_password(data['password'], hasher='pbkdf2_sha256'),
                )
        except IntegrityError:
            return Response({'message': 'Admin ID already exists.'}, status=409)
        # This is the only registration response that discloses the generated code.
        return Response({'message': 'Administrator created.', 'admin_id': admin.admin_id,
                         'admin_code': code}, status=201)
