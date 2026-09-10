from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ...models import Notice
from ...serializers import NoticeSerializer
from ..shared.notices import (
    NoticePagination,
    filter_notices,
    get_notice,
    get_notice_image,
    delete_notice_image,
    get_notice_images,
    save_notice_with_images,
    validate_notice_images,
)
from ..token import AdminJWTAuthentication


class AdminNoticeListCreateAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request):
        paginator = NoticePagination()
        page = paginator.paginate_queryset(
            filter_notices(request.query_params), request, view=self
        )
        serializer = NoticeSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        images = validate_notice_images(get_notice_images(request))
        serializer = NoticeSerializer(data=request.data, context={"request": request, "uploaded_images": images})
        serializer.is_valid(raise_exception=True)
        notice = save_notice_with_images(
            serializer,
            images,
            author_type=Notice.AuthorType.ADMIN,
            author_uuid=request.user.admin_uuid,
            author_name=request.user.admin_name,
        )
        output = NoticeSerializer(notice, context={"request": request})
        return Response(output.data, status=status.HTTP_201_CREATED)


class AdminNoticeDetailAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get(self, request, notice_uuid):
        notice = get_notice(notice_uuid)
        if notice is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(NoticeSerializer(notice, context={"request": request}).data)

    def patch(self, request, notice_uuid):
        notice = get_notice(notice_uuid)
        if notice is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        images = validate_notice_images(
            get_notice_images(request), existing_count=notice.images.count()
        )
        serializer = NoticeSerializer(
            notice, data=request.data, partial=True, context={"request": request, "uploaded_images": images}
        )
        serializer.is_valid(raise_exception=True)
        notice = save_notice_with_images(serializer, images)
        return Response(NoticeSerializer(notice, context={"request": request}).data)

    def delete(self, request, notice_uuid):
        notice = get_notice(notice_uuid)
        if notice is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        notice.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminNoticeImageDetailAPIView(APIView):
    authentication_classes = [AdminJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, notice_uuid, image_uuid):
        notice = get_notice(notice_uuid)
        if notice is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        notice_image = get_notice_image(notice, image_uuid)
        if notice_image is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        delete_notice_image(notice, notice_image)
        return Response(status=status.HTTP_204_NO_CONTENT)
