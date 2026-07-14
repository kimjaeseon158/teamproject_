# 일일 근무 기록 및 일급 관리 시스템

직원이 근무 내용을 직접 등록하고, 관리자가 근무 기록 승인, 급여 계산, 매출/지출, Google 연동, 실시간 알림을 관리하는 Django + React 기반 웹 애플리케이션입니다.

프론트엔드는 React로 사용자/관리자 화면을 제공하고, 백엔드는 Django REST API와 Django Channels WebSocket으로 로그인, 근무 기록, 급여 계산, 재무 데이터, Google Drive Excel export, 실시간 알림을 처리합니다.

## 주요 기능

### 사용자 기능

- 사용자 로그인 및 JWT 인증
- 근무 날짜, 근무지, 근무 시간, 근무 형태 입력
- 제출한 근무 기록의 승인/반려 상태 확인
- 반려된 근무 기록과 반려 사유 확인
- 월별 근무 요약 및 예상 일급 확인

### 관리자 기능

- 관리자 로그인/로그아웃
- 직원 목록 조회, 추가, 수정, 삭제, 필터링
- 직원별 근무지 및 근무지별 시급 관리
- 제출된 근무 기록 승인/반려 처리
- 승인 대기 건수 실시간 알림 확인
- 수입/지출 등록, 수정, 삭제, 기간별 조회
- 최근 3개월 지출 합계 조회
- Google OAuth 연동
- Google Calendar 이벤트 조회
- Google Drive 템플릿 기반 근무지/급여/사용자 급여 Excel export

### WebSocket 실시간 알림

- 관리자는 승인 대기 근무 기록 건수를 실시간으로 받습니다.
- 사용자는 본인의 반려 근무 기록 수와 반려 사유를 실시간으로 받습니다.
- Django Channels와 Redis Channel Layer를 사용합니다.

### JWT 인증

- 사용자와 관리자는 로그인 성공 시 JWT Access Token과 Refresh Token을 사용합니다.
- Access Token은 API 인증에 사용합니다.
- Refresh Token은 HttpOnly Cookie로 내려가며 Access Token 재발급에 사용합니다.
- Refresh Token은 관리자용 `AdminRefreshToken`, 사용자용 `UserRefreshToken` 모델로 구분해 저장합니다.
- JWT 인증/토큰 관련 코드는 `Back/myproject/myapp/api_views/token/` 아래로 정리했습니다.

## 프로젝트 구조

```text
teamproject_-3/
├─ Back/
│  └─ myproject/
│     ├─ manage.py
│     ├─ myproject/
│     │  ├─ settings.py
│     │  ├─ urls.py
│     │  ├─ asgi.py
│     │  ├─ wsgi.py
│     │  └─ middlewares.py
│     └─ myapp/
│        ├─ apps.py
│        ├─ models.py
│        ├─ serializers.py
│        ├─ views.py
│        ├─ urls.py
│        ├─ salary.py
│        ├─ api_views/
│        │  ├─ __init__.py
│        │  ├─ admin/
│        │  │  ├─ __init__.py
│        │  │  ├─ admin_auth.py
│        │  │  ├─ user_management.py
│        │  │  ├─ finance.py
│        │  │  └─ work.py
│        │  ├─ user/
│        │  │  ├─ __init__.py
│        │  │  └─ user.py
│        │  ├─ google/
│        │  │  ├─ __init__.py
│        │  │  ├─ google.py
│        │  │  ├─ excel_utils.py
│        │  │  └─ google_drive_utils.py
│        │  ├─ token/
│        │  │  ├─ __init__.py
│        │  │  ├─ jwt_utils.py
│        │  │  └─ token.py
│        │  └─ shared/
│        │     ├─ __init__.py
│        │     ├─ common.py
│        │     └─ utils.py
│        ├─ ws/
│        │  ├─ __init__.py
│        │  ├─ consumers.py
│        │  ├─ routing.py
│        │  └─ signals.py
│        └─ migrations/
├─ front/
│  ├─ package.json
│  ├─ vercel.json
│  ├─ public/
│  └─ src/
└─ Readme/
   ├─ README.md
   └─ Code_Review/
```

## Backend 주요 파일

| 파일/폴더 | 역할 |
| --- | --- |
| `Back/myproject/manage.py` | Django 관리 명령 실행 파일 |
| `Back/myproject/myproject/settings.py` | Django, DB, JWT, CORS, Redis, Google OAuth 설정 |
| `Back/myproject/myproject/urls.py` | 프로젝트 전체 URL 연결 |
| `Back/myproject/myproject/asgi.py` | HTTP/WebSocket ASGI 진입점, `myapp.ws.routing` 연결 |
| `Back/myproject/myproject/wsgi.py` | WSGI 진입점 |
| `Back/myproject/myproject/middlewares.py` | WebSocket 토큰 인증 미들웨어 |
| `Back/myproject/myapp/apps.py` | Django 앱 설정, `myapp.ws.signals` 등록 |
| `Back/myproject/myapp/models.py` | 사용자, 관리자, 근무 기록, 급여, 재무, Refresh Token 모델 |
| `Back/myproject/myapp/serializers.py` | API 요청/응답 직렬화 및 생성/수정 검증 |
| `Back/myproject/myapp/views.py` | 기존 import 호환을 위한 API view export 파일 |
| `Back/myproject/myapp/urls.py` | `myapp` API endpoint 라우팅 |
| `Back/myproject/myapp/salary.py` | 급여 계산, 시급 조회, 급여 지출 동기화 도메인 로직 |
| `Back/myproject/myapp/api_views/` | REST API view를 도메인별로 분리한 패키지 |
| `Back/myproject/myapp/ws/` | WebSocket consumer, routing, signal 패키지 |
| `Back/myproject/myapp/migrations/` | DB 스키마 변경 이력 |

## API View 구조

| 파일/폴더 | 역할 |
| --- | --- |
| `api_views/__init__.py` | API view export |
| `api_views/admin/admin_auth.py` | 관리자 로그인/로그아웃 API |
| `api_views/admin/user_management.py` | 관리자의 직원 조회/추가/수정/삭제/필터링 API |
| `api_views/admin/finance.py` | 수입/지출 조회, 추가, 수정, 삭제, 집계 API |
| `api_views/admin/work.py` | 근무 승인/반려, 근무지, 시급 관리 API |
| `api_views/user/user.py` | 사용자 로그인, 비밀번호 변경, 근무 입력, 월별 근무 요약 API |
| `api_views/google/google.py` | Google OAuth, Calendar, Drive Excel export API |
| `api_views/google/excel_utils.py` | Google export용 Excel Workbook 생성 유틸 |
| `api_views/google/google_drive_utils.py` | Google Drive 파일 조회, 다운로드, 업로드 유틸 |
| `api_views/token/jwt_utils.py` | `CustomRefreshToken`, 관리자/사용자 JWT 인증 클래스 |
| `api_views/token/token.py` | 토큰 재발급 API, 로그인 credential 확인, Refresh Token 저장/갱신 |
| `api_views/shared/utils.py` | 날짜 범위, 월 계산, 근무 타입 정규화 공용 유틸 |
| `api_views/shared/common.py` | shared 확장용 빈 파일 |

## WebSocket 구조

| 파일 | 역할 |
| --- | --- |
| `Back/myproject/myapp/ws/consumers.py` | 관리자 승인 대기 알림, 사용자 반려 알림 WebSocket Consumer |
| `Back/myproject/myapp/ws/routing.py` | WebSocket URL 라우팅 |
| `Back/myproject/myapp/ws/signals.py` | 근무 기록 변경 시 WebSocket 알림 전송 트리거 |
| `Back/myproject/myproject/asgi.py` | `myapp.ws.routing.websocket_urlpatterns`를 ASGI에 연결 |

WebSocket endpoint:

```text
ws/admin/request-monitor/
ws/user/request-monitor/
```

## 주요 API 분류

| 분류 | Endpoint 예시 |
| --- | --- |
| 로그인/로그아웃 | `check-admin-login/`, `check-user-login/`, `admin-logout/`, `user-logout/`, `refresh-token/` |
| 직원 관리 | `user-info-list/`, `user-info-add/`, `user-info-update/`, `user-info-delete/`, `user-info-filtering/` |
| 근무 기록 | `user-work-info/`, `user-monthly-work-summary/`, `admin-page-workday/`, `admin-workday-status-update/` |
| 근무지/시급 | `work-place-list-create/`, `work-place-update-delete/`, `work-place-rate-list-create/`, `work-place-rate-update-delete/` |
| 재무 관리 | `finance-table-date-filtered/`, `income-date-filtered/`, `expense-date-filtered/`, `income-add/`, `expense-add/` |
| Google 연동 | `google-login/`, `google-callback/`, `google-calendar-events/`, Google Drive Excel export 관련 endpoint |

## 실행 방법

### Backend

```bash
cd Back/myproject
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd front
npm install
npm start
```

기본 개발 서버:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8000
```

## 환경 변수

Backend는 `Back/myproject/.env`를 사용합니다.

```env
SECRET_KEY=
REFRESH_TOKEN_HASH_SECRET=
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:3000
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
UPSTASH_REDIS_REST_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
FRONTEND_URL=http://localhost:3000
```

Frontend WebSocket 주소 예시:

```env
REACT_APP_WS_BASE_URL=ws://localhost:8000/ws
```

## 참고 문서

구현 기록과 코드 리뷰 문서는 `Readme/Code_Review/` 폴더에 정리합니다.