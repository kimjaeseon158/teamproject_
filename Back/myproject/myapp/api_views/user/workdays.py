# 사용자 근무일 등록과 조회 API

from django.db import IntegrityError, transaction
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from ...models import User_WorkDay
from ...serializers import UserWorkDaySerializer
from ..token import UserJWTAuthentication


class UserWorkInfoAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def _password_change_required_response(self, request):
        if request.user.must_change_password:
            return Response(
                {"success": False, "must_change_password": True},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None

    def _target_params(self, request):
        work_date_str = request.query_params.get("work_date")
        work_shift = request.query_params.get("work_shift")
        work_date = parse_date(work_date_str) if work_date_str else None

        if work_date is None or not work_shift:
            return None
        return work_date, work_shift

    def post(self, request):
        password_response = self._password_change_required_response(request)
        if password_response:
            return password_response

        data = request.data.get("data")

        # 1개/여러개 자동 판별
        is_many = isinstance(data, list)

        serializer = UserWorkDaySerializer(data=data, many=is_many)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"success": True})

    def patch(self, request):
        password_response = self._password_change_required_response(request)
        if password_response:
            return password_response

        target = self._target_params(request)
        if target is None:
            return Response(
                {"success": False},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = request.data.get("data")
        if not isinstance(data, dict):
            return Response(
                {"success": False},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = data.copy()
        data["user_uuid"] = request.user.user_uuid
        data["is_approved"] = None

        work_date, work_shift = target
        try:
            with transaction.atomic():
                try:
                    work_day = (
                        User_WorkDay.objects
                        .select_for_update()
                        .get(
                            user_uuid=request.user,
                            work_date=work_date,
                            work_shift=work_shift,
                        )
                    )
                except User_WorkDay.DoesNotExist:
                    return Response(
                        {"success": False},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                if work_day.is_approved is not None:
                    return Response(
                        {"success": False},
                        status=status.HTTP_403_FORBIDDEN,
                    )

                serializer = UserWorkDaySerializer(
                    work_day,
                    data=data,
                    context={"request": request},
                )
                serializer.is_valid(raise_exception=True)
                serializer.save()
        except IntegrityError:
            return Response(
                {"success": False},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"success": True})

    def delete(self, request):
        password_response = self._password_change_required_response(request)
        if password_response:
            return password_response

        target = self._target_params(request)
        if target is None:
            return Response(
                {"success": False},
                status=status.HTTP_400_BAD_REQUEST,
            )

        work_date, work_shift = target
        with transaction.atomic():
            try:
                work_day = (
                    User_WorkDay.objects
                    .select_for_update()
                    .get(
                        user_uuid=request.user,
                        work_date=work_date,
                        work_shift=work_shift,
                    )
                )
            except User_WorkDay.DoesNotExist:
                return Response(
                    {"success": False},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if work_day.is_approved is not None:
                return Response(
                    {"success": False},
                    status=status.HTTP_403_FORBIDDEN,
                )

            work_day.delete()

        return Response({"success": True})
