from django.core.files.base import ContentFile
from django.db import IntegrityError, transaction
from django.http import FileResponse
from django.urls import reverse
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import WorkSchedule, WorkSchedulePreviewPage
from ..work_schedule_service import (
    WorkScheduleConversionError,
    WorkScheduleValidationError,
    delete_storage_files,
    prepare_work_schedule,
)
from .token import AdminJWTAuthentication, UserJWTAuthentication

NOT_FOUND_MESSAGE = "해당 날짜의 근무표가 없습니다."


def _parse_required_date(value):
    if not isinstance(value, str):
        return None
    parsed = parse_date(value)
    if parsed is None or parsed.isoformat() != value:
        return None
    return parsed


def _admin_schedule_data(schedule):
    return {
        "schedule_uuid": str(schedule.schedule_uuid),
        "schedule_date": schedule.schedule_date.isoformat(),
        "original_file_name": schedule.original_file_name,
        "original_file_size": schedule.original_file_size,
        "preview_page_count": schedule.preview_pages.count(),
        "created_at": schedule.created_at.isoformat(),
        "updated_at": schedule.updated_at.isoformat(),
    }


def _user_schedule_data(request, schedule):
    pages = []
    for page in schedule.preview_pages.all():
        path = reverse(
            "user-work-schedule-preview-page",
            kwargs={
                "schedule_uuid": schedule.schedule_uuid,
                "page_number": page.page_number,
            },
        )
        pages.append(
            {
                "page_number": page.page_number,
                "image_url": request.build_absolute_uri(path),
            }
        )
    return {
        "success": True,
        "schedule_date": schedule.schedule_date.isoformat(),
        "pages": pages,
    }


def _conversion_error_response(exc):
    if isinstance(exc, WorkScheduleValidationError):
        response_status = status.HTTP_400_BAD_REQUEST
    else:
        response_status = status.HTTP_503_SERVICE_UNAVAILABLE
    return Response(
        {"success": False, "message": str(exc)},
        status=response_status,
    )


def _save_preview_pages(schedule, prepared, saved_names):
    for page_number, preview in enumerate(prepared.preview_pages, start=1):
        page = WorkSchedulePreviewPage(
            schedule=schedule,
            page_number=page_number,
            width=preview.width,
            height=preview.height,
        )
        page.image.save(
            f"page-{page_number}.png",
            ContentFile(preview.content),
            save=False,
        )
        saved_names.append(page.image.name)
        page.save()


class AdminWorkScheduleListCreateAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        schedules = WorkSchedule.objects.prefetch_related("preview_pages").all()
        return Response(
            {
                "success": True,
                "schedules": [_admin_schedule_data(item) for item in schedules],
            }
        )

    def post(self, request):
        schedule_date = _parse_required_date(request.data.get("schedule_date"))
        uploaded_file = request.FILES.get("file")
        if schedule_date is None:
            return Response(
                {
                    "success": False,
                    "message": "schedule_date는 YYYY-MM-DD 형식이어야 합니다.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if uploaded_file is None:
            return Response(
                {"success": False, "message": "file이 필요합니다."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if WorkSchedule.objects.filter(schedule_date=schedule_date).exists():
            return Response(
                {"success": False, "message": "해당 날짜의 근무표가 이미 존재합니다."},
                status=status.HTTP_409_CONFLICT,
            )

        try:
            prepared = prepare_work_schedule(uploaded_file)
        except (WorkScheduleValidationError, WorkScheduleConversionError) as exc:
            return _conversion_error_response(exc)

        saved_names = []
        storage = WorkSchedule._meta.get_field("original_file").storage
        try:
            with transaction.atomic():
                schedule = WorkSchedule(
                    schedule_date=schedule_date,
                    original_file_name=prepared.original_name,
                    original_file_size=prepared.original_size,
                    uploaded_by=request.user,
                )
                schedule.original_file.save(
                    prepared.original_name,
                    ContentFile(prepared.original_content),
                    save=False,
                )
                saved_names.append(schedule.original_file.name)
                schedule.save()
                _save_preview_pages(schedule, prepared, saved_names)
        except IntegrityError:
            delete_storage_files(storage, saved_names)
            return Response(
                {"success": False, "message": "해당 날짜의 근무표가 이미 존재합니다."},
                status=status.HTTP_409_CONFLICT,
            )
        except Exception:
            delete_storage_files(storage, saved_names)
            raise

        return Response(
            {"success": True, "schedule": _admin_schedule_data(schedule)},
            status=status.HTTP_201_CREATED,
        )


class AdminWorkScheduleDetailAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def _get_schedule(self, schedule_uuid):
        try:
            return WorkSchedule.objects.prefetch_related("preview_pages").get(
                schedule_uuid=schedule_uuid
            )
        except (WorkSchedule.DoesNotExist, ValueError):
            return None

    def patch(self, request, schedule_uuid):
        schedule = self._get_schedule(schedule_uuid)
        if schedule is None:
            return Response(
                {"success": False, "message": NOT_FOUND_MESSAGE},
                status=status.HTTP_404_NOT_FOUND,
            )

        date_was_provided = "schedule_date" in request.data
        uploaded_file = request.FILES.get("file")
        if not date_was_provided and uploaded_file is None:
            return Response(
                {
                    "success": False,
                    "message": "변경할 schedule_date 또는 file이 필요합니다.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        schedule_date = schedule.schedule_date
        if date_was_provided:
            schedule_date = _parse_required_date(request.data.get("schedule_date"))
            if schedule_date is None:
                return Response(
                    {
                        "success": False,
                        "message": "schedule_date는 YYYY-MM-DD 형식이어야 합니다.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if (
                WorkSchedule.objects.filter(schedule_date=schedule_date)
                .exclude(schedule_uuid=schedule.schedule_uuid)
                .exists()
            ):
                return Response(
                    {
                        "success": False,
                        "message": "해당 날짜의 근무표가 이미 존재합니다.",
                    },
                    status=status.HTTP_409_CONFLICT,
                )

        prepared = None
        if uploaded_file is not None:
            try:
                prepared = prepare_work_schedule(uploaded_file)
            except (WorkScheduleValidationError, WorkScheduleConversionError) as exc:
                return _conversion_error_response(exc)

        date_changed = schedule_date != schedule.schedule_date
        relocation_original = None
        relocation_pages = []
        if prepared is None and date_changed:
            with schedule.original_file.open("rb") as original_file:
                relocation_original = original_file.read()
            for page in schedule.preview_pages.all():
                with page.image.open("rb") as preview_file:
                    relocation_pages.append((page, preview_file.read()))

        storage = WorkSchedule._meta.get_field("original_file").storage
        old_names = []
        new_names = []
        if prepared is not None or date_changed:
            old_names = [schedule.original_file.name]
            old_names.extend(schedule.preview_pages.values_list("image", flat=True))

        try:
            with transaction.atomic():
                schedule.schedule_date = schedule_date
                if prepared is not None:
                    schedule.original_file.save(
                        prepared.original_name,
                        ContentFile(prepared.original_content),
                        save=False,
                    )
                    new_names.append(schedule.original_file.name)
                    schedule.original_file_name = prepared.original_name
                    schedule.original_file_size = prepared.original_size
                    schedule.preview_pages.all().delete()
                elif date_changed:
                    schedule.original_file.save(
                        schedule.original_file_name,
                        ContentFile(relocation_original),
                        save=False,
                    )
                    new_names.append(schedule.original_file.name)
                schedule.save()
                if prepared is not None:
                    _save_preview_pages(schedule, prepared, new_names)
                elif date_changed:
                    for page, content in relocation_pages:
                        page.image.save(
                            f"page-{page.page_number}.png",
                            ContentFile(content),
                            save=False,
                        )
                        new_names.append(page.image.name)
                        page.save(update_fields=["image"])
        except IntegrityError:
            delete_storage_files(storage, new_names)
            return Response(
                {"success": False, "message": "해당 날짜의 근무표가 이미 존재합니다."},
                status=status.HTTP_409_CONFLICT,
            )
        except Exception:
            delete_storage_files(storage, new_names)
            raise

        if old_names:
            transaction.on_commit(lambda: delete_storage_files(storage, old_names))
        return Response({"success": True, "schedule": _admin_schedule_data(schedule)})

    def delete(self, request, schedule_uuid):
        schedule = self._get_schedule(schedule_uuid)
        if schedule is None:
            return Response(
                {"success": False, "message": NOT_FOUND_MESSAGE},
                status=status.HTTP_404_NOT_FOUND,
            )

        storage = WorkSchedule._meta.get_field("original_file").storage
        names = [schedule.original_file.name]
        names.extend(schedule.preview_pages.values_list("image", flat=True))
        with transaction.atomic():
            schedule.delete()
        delete_storage_files(storage, names)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminWorkScheduleDownloadAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, schedule_uuid):
        try:
            schedule = WorkSchedule.objects.get(schedule_uuid=schedule_uuid)
        except (WorkSchedule.DoesNotExist, ValueError):
            return Response(
                {"success": False, "message": NOT_FOUND_MESSAGE},
                status=status.HTTP_404_NOT_FOUND,
            )

        response = FileResponse(
            schedule.original_file.open("rb"),
            as_attachment=True,
            filename=schedule.original_file_name,
            content_type=(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ),
        )
        response["X-Content-Type-Options"] = "nosniff"
        response["Cache-Control"] = "private, no-store"
        return response


class UserWorkScheduleAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_value = request.query_params.get("date")
        schedules = WorkSchedule.objects.prefetch_related("preview_pages")
        if date_value is not None:
            schedule_date = _parse_required_date(date_value)
            if schedule_date is None:
                return Response(
                    {
                        "success": False,
                        "message": "date는 YYYY-MM-DD 형식이어야 합니다.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            schedule = schedules.filter(schedule_date=schedule_date).first()
        else:
            schedule = schedules.order_by("-schedule_date").first()

        if schedule is None:
            return Response(
                {"success": False, "message": NOT_FOUND_MESSAGE},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(_user_schedule_data(request, schedule))


class UserWorkSchedulePreviewPageAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, schedule_uuid, page_number):
        try:
            page = WorkSchedulePreviewPage.objects.select_related("schedule").get(
                schedule_id=schedule_uuid,
                page_number=page_number,
            )
        except (WorkSchedulePreviewPage.DoesNotExist, ValueError):
            return Response(
                {"success": False, "message": NOT_FOUND_MESSAGE},
                status=status.HTTP_404_NOT_FOUND,
            )

        response = FileResponse(
            page.image.open("rb"),
            as_attachment=False,
            content_type="image/png",
        )
        response["Content-Disposition"] = (
            f'inline; filename="schedule-{page.schedule.schedule_date}-'
            f'{page.page_number}.png"'
        )
        response["X-Content-Type-Options"] = "nosniff"
        response["Cache-Control"] = "private, max-age=300"
        return response
