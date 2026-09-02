from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import Notice, NoticeRead
from ...serializers import NoticeSerializer
from ..shared.notices import NoticePagination, filter_notices, get_notice
from ..token import UserJWTAuthentication


def can_manage_user_notice(user, notice):
    return (
        notice.author_type == Notice.AuthorType.USER
        and notice.author_uuid == user.user_uuid
    )


class UserNoticeListCreateAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        paginator = NoticePagination()
        page = paginator.paginate_queryset(filter_notices(request.query_params), request, view=self)
        return paginator.get_paginated_response(NoticeSerializer(page, many=True).data)

    def post(self, request):
        serializer = NoticeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        notice = serializer.save(
            author_type=Notice.AuthorType.USER,
            author_uuid=request.user.user_uuid,
            author_name=request.user.user_name,
        )
        return Response(NoticeSerializer(notice).data, status=status.HTTP_201_CREATED)


class UserNoticeDetailAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, notice_uuid):
        notice = get_notice(notice_uuid)
        if notice is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(NoticeSerializer(notice).data)

    def patch(self, request, notice_uuid):
        notice = get_notice(notice_uuid)
        if notice is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if not can_manage_user_notice(request.user, notice):
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = NoticeSerializer(notice, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, notice_uuid):
        notice = get_notice(notice_uuid)
        if notice is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        if not can_manage_user_notice(request.user, notice):
            return Response(status=status.HTTP_403_FORBIDDEN)
        notice.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserNoticeReadAPIView(APIView):
    authentication_classes = [UserJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, notice_uuid):
        notice = get_notice(notice_uuid)
        if notice is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        read_record, created = NoticeRead.objects.get_or_create(
            user=request.user,
            notice=notice,
        )
        return Response(
            {
                "success": True,
                "is_newly_read": created,
                "read_at": read_record.read_at,
            }
        )
