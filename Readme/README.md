# 일일 근무 기록 및 일급 관리 시스템

직원이 근무 내용을 직접 등록하고, 관리자가 근무 기록을 승인한 뒤 일급과 매출/지출을 관리할 수 있도록 만든 Django + React 기반 웹 애플리케이션입니다.

프론트엔드는 React로 사용자/관리자 화면을 구성하고, 백엔드는 Django REST API로 로그인, 근무 기록, 급여 계산, 재무 데이터, Google 연동, 실시간 알림을 처리합니다.

## 주요 기능

### 사용자 기능

- 사용자 로그인 및 인증 상태 유지
- 달력 기반 근무 일정/근무 기록 확인
- 근무 날짜, 근무지, 근무 시간, 근무 형태 입력
- 주간/야간/연장/식대 연장 등 근무 상세 시간 등록
- 제출한 근무 기록의 승인 상태 확인
- 반려된 근무 기록과 반려 사유 확인
- 월별 근무 요약 및 예상 일급 확인

### 관리자 기능

- 관리자 로그인 및 권한 기반 화면 접근
- 직원 목록 조회, 추가, 수정, 삭제
- 직원별 근무지 및 근무지별 시급 정보 관리
- 제출된 근무 기록 승인/반려 처리
- 승인 대기 건수 실시간 알림 확인
- 일급/급여 관련 데이터 조회
- 매출과 지출 등록, 수정, 삭제
- 기간별 재무 데이터 조회 및 차트 시각화
- 최근 3개월 지출 합계 조회
- Google OAuth 연동
- Google Calendar 이벤트 조회
- Google Drive로 근무지/급여 Excel 파일 내보내기

### WebSocket 실시간 알림

- 관리자는 직원이 제출한 근무 기록 중 승인 대기 건수가 생기면 실시간으로 알림을 받을 수 있습니다.
- 사용자는 본인의 근무 기록이 반려되었을 때 반려 건수와 반려 사유를 실시간으로 확인할 수 있습니다.
- 승인/반려 상태 변경을 새로고침 없이 화면에 반영해 관리자와 사용자가 빠르게 상태를 확인할 수 있습니다.

### JWT 인증

- 사용자와 관리자는 로그인 성공 시 JWT 기반 인증 토큰을 사용합니다.
- Access Token은 API 요청 인증에 사용하고, Refresh Token은 Access Token 재발급에 사용합니다.
- Refresh Token은 관리자용 `AdminRefreshToken`, 사용자용 `UserRefreshToken` 모델로 구분해 관리합니다.
- 프론트엔드는 `front/src/services/api/fetchWithAuth.js`, `front/src/services/api/token.js`에서 토큰 처리와 인증 API 요청을 관리합니다.
- 백엔드는 `djangorestframework-simplejwt`와 `Back/myproject/myapp/jwt_utils.py`, `Back/myproject/myapp/auth_utils.py`를 사용해 토큰 생성, 검증, 재발급, 로그아웃 처리를 수행합니다.

## 프로젝트 구조

```text
teamproject_-3/
├─ Back/
│  └─ myproject/
│     ├─ manage.py
│     ├─ requirements.txt
│     ├─ db.sqlite3
│     ├─ myproject/
│     │  ├─ settings.py
│     │  ├─ urls.py
│     │  ├─ asgi.py
│     │  ├─ wsgi.py
│     │  └─ middlewares.py
│     └─ myapp/
│        ├─ models.py
│        ├─ serializers.py
│        ├─ views.py
│        ├─ urls.py
│        ├─ consumers.py
│        ├─ routing.py
│        ├─ auth_utils.py
│        ├─ jwt_utils.py
│        ├─ salary.py
│        ├─ excel_utils.py
│        ├─ google_drive_utils.py
│        ├─ date_utils.py
│        ├─ signals.py
│        └─ migrations/
├─ front/
│  ├─ package.json
│  ├─ vercel.json
│  ├─ public/
│  └─ src/
│     ├─ app/
│     ├─ pages/
│     ├─ services/
│     ├─ common/
│     ├─ feactures/
│     └─ assets/
└─ Readme/
   ├─ README.md
   └─ Code_Review/
```

## 주요 파일 용도

### Backend

| 파일 | 용도 |
| --- | --- |
| `Back/myproject/manage.py` | Django 관리 명령 실행 파일 |
| `Back/myproject/requirements.txt` | 백엔드 Python 패키지 목록 |
| `Back/myproject/myproject/settings.py` | Django 앱, DB, JWT, CORS, Redis, Google OAuth, 정적 파일 설정 |
| `Back/myproject/myproject/urls.py` | 프로젝트 전체 URL 연결 |
| `Back/myproject/myproject/asgi.py` | HTTP와 WebSocket 처리를 위한 ASGI 진입점 |
| `Back/myproject/myproject/wsgi.py` | 배포용 WSGI 진입점 |
| `Back/myproject/myproject/middlewares.py` | 인증/요청 처리에 사용하는 커스텀 미들웨어 |
| `Back/myproject/myapp/models.py` | 사용자, 관리자, 근무일, 근무 상세, 근무지 시급, 매출, 지출, Refresh Token 모델 정의 |
| `Back/myproject/myapp/serializers.py` | 모델 데이터를 API 요청/응답 형식으로 변환 |
| `Back/myproject/myapp/views.py` | 로그인, 직원 관리, 근무 기록, 승인, 급여, 재무, Google 연동 API 로직 |
| `Back/myproject/myapp/urls.py` | `myapp` API 엔드포인트 라우팅 |
| `Back/myproject/myapp/consumers.py` | Django Channels 기반 WebSocket 알림 처리 |
| `Back/myproject/myapp/routing.py` | WebSocket URL 라우팅 |
| `Back/myproject/myapp/auth_utils.py` | 사용자/관리자 인증 보조 로직 |
| `Back/myproject/myapp/jwt_utils.py` | JWT 및 Refresh Token 관련 유틸리티 |
| `Back/myproject/myapp/salary.py` | 근무 시간과 시급 기준 일급 계산 로직 |
| `Back/myproject/myapp/excel_utils.py` | Excel 생성/내보내기 관련 유틸리티 |
| `Back/myproject/myapp/google_drive_utils.py` | Google Drive 업로드/연동 유틸리티 |
| `Back/myproject/myapp/date_utils.py` | 날짜 계산 및 변환 유틸리티 |
| `Back/myproject/myapp/signals.py` | 데이터 변경 시 알림 등 후속 처리 연결 |
| `Back/myproject/myapp/migrations/` | DB 스키마 변경 이력 |

### Frontend

| 파일/폴더 | 용도 |
| --- | --- |
| `front/package.json` | 프론트엔드 의존성 및 실행 스크립트 |
| `front/vercel.json` | Vercel 배포 설정 |
| `front/public/index.html` | React 앱이 마운트되는 HTML 템플릿 |
| `front/src/index.js` | React 앱 진입점 |
| `front/src/index.css` | 전역 스타일 |
| `front/src/app/AppRoutes.js` | 로그인, 사용자, 관리자 페이지 라우팅 |
| `front/src/requireauth.js` | 인증이 필요한 페이지 접근 제어 |
| `front/src/pages/LoginPage/` | 로그인 페이지 |
| `front/src/pages/UserPage/CalendarPage.js` | 사용자 근무 입력/조회 캘린더 페이지 |
| `front/src/pages/dashboard.js` | 관리자 대시보드 레이아웃 및 하위 라우팅 |
| `front/src/pages/AdminPage/EmployeeList.js` | 직원 관리 화면 |
| `front/src/pages/AdminPage/ApprovalPage.js` | 근무 승인/반려 화면 |
| `front/src/pages/AdminPage/DailyPayPage.js` | 일급 관리 화면 |
| `front/src/pages/AdminPage/TotalSalesPage.js` | 매출/지출 통계 화면 |
| `front/src/services/api/` | 공통 API 호출, 토큰 처리, 인증 요청 로직 |
| `front/src/services/ws/useNotifySocket.js` | WebSocket 알림 연결 훅 |
| `front/src/feactures/auth/` | 로그인 사용자 상태 Context |
| `front/src/feactures/alarm/` | 알림 상태와 알림 UI |
| `front/src/feactures/login/` | 로그인 폼, 검증, 로그인 API, 로그인 레이아웃 |
| `front/src/feactures/user/` | 사용자 캘린더, 근무 입력 폼, 근무 시간/날짜 유틸리티 |
| `front/src/feactures/admin/` | 관리자 직원 관리, 근무 승인, 근무지 시급, 재무 통계, Google 연동 기능 |
| `front/src/common/` | 공통 버튼, 캘린더, 테이블, 날짜 선택 컴포넌트 |
| `front/src/assets/` | 이미지 등 정적 리소스 |

## 중요 라이브러리

### Backend

| 라이브러리 | 용도 |
| --- | --- |
| `Django` | 백엔드 웹 프레임워크 |
| `djangorestframework` | REST API 구현 |
| `djangorestframework-simplejwt` | JWT 기반 인증 |
| `django-cors-headers` | React 개발 서버와의 CORS 처리 |
| `django-environ` | `.env` 환경변수 관리 |
| `psycopg2-binary` | PostgreSQL 연결 |
| `django-redis` | Redis 캐시 연결 |
| `channels`, `channels-redis`, `daphne` | WebSocket 실시간 알림 |
| `google-auth`, `google-auth-oauthlib` | Google OAuth 인증 |
| `requests` | 외부 HTTP 요청 |
| `django-apscheduler` | 예약 작업 처리 |
| `openpyxl` | Excel 파일 생성/처리 |
| `gunicorn`, `whitenoise` | 배포 서버 및 정적 파일 처리 |
| `black` | Python 코드 포맷팅 |

### Frontend

| 라이브러리 | 용도 |
| --- | --- |
| `react`, `react-dom` | UI 구성 |
| `react-router-dom` | SPA 라우팅 |
| `@chakra-ui/react`, `@chakra-ui/icons` | 관리자 화면 등 UI 컴포넌트 |
| `@emotion/react`, `@emotion/styled` | Chakra UI 스타일 엔진 |
| `framer-motion` | UI 애니메이션 |
| `axios` | API 통신 |
| `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction` | 캘린더 UI |
| `react-big-calendar`, `react-calendar`, `react-day-picker`, `react-date-range` | 날짜/캘린더 선택 UI |
| `date-fns`, `moment` | 날짜 및 시간 처리 |
| `recharts` | 매출/지출 차트 시각화 |
| `react-icons` | 아이콘 |
| `concurrently` | 프론트엔드와 백엔드 동시 실행 |

## 실행 방법

### 1. Backend 실행

```bash
cd Back/myproject
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 2. Frontend 실행

```bash
cd front
npm install
npm start
```

React 개발 서버는 기본적으로 `http://localhost:3000`에서 실행되고, Django 개발 서버는 `http://localhost:8000`에서 실행됩니다.

## 환경변수

백엔드는 `Back/myproject/.env` 파일을 사용합니다. `settings.py` 기준으로 아래 값들이 필요합니다.

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

프론트엔드는 WebSocket 주소가 필요할 때 `front/.env`에 아래 값을 둘 수 있습니다.

```env
REACT_APP_WS_BASE_URL=ws://localhost:8000/ws
```

## WebSocket 사용 구조

이 프로젝트는 일반 API 요청은 Django REST API로 처리하고, 실시간 알림은 WebSocket으로 분리해서 처리합니다.

| 구분 | 설명 |
| --- | --- |
| 연결 방식 | React 클라이언트가 WebSocket 주소로 연결 |
| 프론트 연결 파일 | `front/src/services/ws/useNotifySocket.js` |
| 백엔드 Consumer | `Back/myproject/myapp/consumers.py` |
| WebSocket 라우팅 | `Back/myproject/myapp/routing.py` |
| ASGI 진입점 | `Back/myproject/myproject/asgi.py` |
| Channel Layer | Redis, `channels-redis` 사용 |
| 환경변수 | `REACT_APP_WS_BASE_URL=ws://localhost:8000/ws` |

Django Channels와 Redis Channel Layer를 사용해 클라이언트별 알림 그룹을 관리합니다. 서버에서 승인 대기 또는 반려 상태 변경 메시지를 그룹으로 보내면, 프론트엔드는 수신한 데이터를 알림 상태에 반영합니다.

## 주요 API 분류

| 분류 | 엔드포인트 예시 |
| --- | --- |
| 로그인/로그아웃 | `check_admin_login/`, `check_user_login/`, `admin_logout/`, `user_logout/`, `refresh_token/` |
| 직원 관리 | `user_info_list/`, `user_info_add/`, `user_info_update/`, `user_info_delete/`, `user_info_filtering/` |
| 근무 기록 | `user_work_info/`, `user_monthly_work_summary/`, `admin_page_workday/`, `admin_workday_status_update/` |
| 근무지 시급 | `work_place_rate_list_create/`, `work_place_rate_update_delete/`, `work_place_rate_list_filtering/` |
| 재무 관리 | `finance_total/`, `income_filtered/`, `expense_filtered/`, `income_add/`, `expense_add/`, `income_update/`, `expense_update/`, `income_delete/`, `expense_delete/` |
| Google 연동 | `google_calendar_auth/`, `google_calendar_auth/callback/`, `google_calendar_auth/events/`, `google_drive_excel_export/`, `google_drive_salary_excel_export/` |

## 참고 문서

세부 구현 기록과 기능별 코드 리뷰는 `Readme/Code_Review/` 폴더에 정리되어 있습니다.
