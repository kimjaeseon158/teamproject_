# Google Calendar 일정 조회 API

from datetime import datetime
import requests
from django.conf import settings
from django.shortcuts import redirect
from google_auth_oauthlib.flow import Flow
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from ...models import User_Login_Info, User_WorkDay
from .excel_utils import generate_salary_excel, generate_users_pay_excel, generate_workplace_excel
from .google_drive_utils import GoogleDriveService, GoogleDriveUploadError, download_drive_template, parse_year_month, save_workbook_to_drive, workbook_download_response


class GoogleCalendarEventsAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        access_token = request.COOKIES.get("google_access_token")

        if not access_token:
            return Response(
                {"error": "No access token found. Please re-authenticate with Google."},
                status=401,
            )

        events_url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"

        headers = {
            "Authorization": f"Bearer {access_token}",
        }
        now = datetime.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        if now.month == 12:
            next_month = now.replace(
                year=now.year + 1,
                month=1,
                day=1,
                hour=0,
                minute=0,
                second=0,
                microsecond=0,
            )
        else:
            next_month = now.replace(
                month=now.month + 1, day=1, hour=0, minute=0, second=0, microsecond=0
            )

        params = {
            "maxResults": 10,
            "orderBy": "startTime",
            "singleEvents": True,
            "timeMin": start_of_month.isoformat() + "Z",
            "timeMax": next_month.isoformat() + "Z",
        }


        res = requests.get(events_url, headers=headers, params=params)

        if res.status_code != 200:
            return Response(
                {"error": "Failed to fetch events", "details": res.json()},
                status=res.status_code,
            )

        events = res.json().get("items", [])
        return Response({"events": events})
