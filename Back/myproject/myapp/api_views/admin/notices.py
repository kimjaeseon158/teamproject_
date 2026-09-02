from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import Notice
from ...serializers import NoticeSerializer
from ..shared.notices import NoticePagination, filter_notices, get_notice
from ..token import AdminJWTAuthentication


class AdminNoticeListCreateAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        paginator = NoticePagination()
        page = paginator.paginate_queryset(filter_notices(request.query_params), request, view=self)
        return paginator.get_paginated_response(NoticeSerializer(page, many=True).data)

    def post(self, request):
        serializer = NoticeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        notice = serializer.save(
            author_type=Notice.AuthorType.ADMIN,
            author_uuid=request.user.admin_uuid,
            author_name=request.user.admin_name,
        )
        return Response(NoticeSerializer(notice).data, status=status.HTTP_201_CREATED)


class AdminNoticeDetailAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
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
        serializer = NoticeSerializer(notice, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, notice_uuid):
        notice = get_notice(notice_uuid)
        if notice is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        notice.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
