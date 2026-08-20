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
teamproject_/
teamproject_/
├─ Back/
│   └─ myproject/
│      ├─ manage.py
│      ├─ requirements.txt
│      ├─ myproject/                 # Django 프로젝트 설정
│      │  ├─ settings.py
│      │  ├─ urls.py
│      │  ├─ middlewares.py
│      │  ├─ asgi.py
│      │  └─ wsgi.py
│      └─ myapp/                     # 백엔드 주요 Django 앱
│         ├─ models/                  # 기능별 DB 모델
│         │  ├─ accounts.py
│         │  ├─ work.py
│         │  ├─ schedules.py
│         │  ├─ finance.py
│         │  └─ tokens.py
│         ├─ serializers/             # 기능별 DRF serializer
│         │  ├─ accounts.py
│         │  ├─ work.py
│         │  ├─ schedules.py
│         │  └─ finance.py
│         ├─ api_views/               # API 요청 처리
│         │  ├─ admin/           # 관리자 API
│         │  ├─ user/            # 사용자 API
│         │  ├─ google/          # Google 연동
│         │  ├─ token/           # JWT·refresh token
│         │  └─ shared/          # API 공통 로직
│         ├─ encryption/              # 민감 정보 암호화
│         ├─ management/              # Django 관리 명령
│         ├─ migrations/              # DB migration 이력
│         ├─ ws/                      # Channels WebSocket
│         ├─ urls.py                  # 기존 HTTP URL 라우팅
│         └─ views.py                 # URL import 호환 모듈
│  ├─ package.json
│  ├─ vercel.json
│  ├─ public/
│  └─ src/
└─ Readme/
   ├─ README.md
   └─ Code_Review/
```

## Backend 파일별 역할

### 모델

| 경로 | 역할 |
|---|---|
| `myapp/models/__init__.py` | 기능별 Django 모델을 기존 import 경로로 제공하는 패키지 |
| `myapp/models/accounts.py` | 사용자와 관리자 계정 및 비밀번호 재설정 모델 |
| `myapp/models/work.py` | 근무일·근무 상세·근무지·급여율 모델 |
| `myapp/models/schedules.py` | 직원 근무 일정 모델과 과거 파일 경로 함수 |
| `myapp/models/finance.py` | 수입과 지출 모델 |
| `myapp/models/tokens.py` | 사용자와 관리자 refresh token 모델 |

### Serializer

| 경로 | 역할 |
|---|---|
| `myapp/serializers/__init__.py` | 기능별 serializer를 기존 import 경로로 제공하는 패키지 |
| `myapp/serializers/accounts.py` | 사용자 계정 생성과 조회 serializer |
| `myapp/serializers/work.py` | 근무일·근무지·급여율 serializer |
| `myapp/serializers/schedules.py` | 직원 근무 일정 입력 serializer |
| `myapp/serializers/finance.py` | 수입과 지출 serializer |
### 관리자 API

| 경로 | 역할 |
|---|---|
| `myapp/api_views/admin/__init__.py` | 관리자 기능별 API 패키지 |
| `myapp/api_views/admin/admin_auth.py` | 관리자 로그인/로그아웃 |
| `myapp/api_views/admin/user_management.py` | 관리자 사용자 정보 관리 API |
| `myapp/api_views/admin/password_reset.py` | 관리자의 사용자 비밀번호 재설정 요청 처리 API |
| `myapp/api_views/admin/workdays.py` | 관리자 근무일 조회와 승인 상태 변경 API |
| `myapp/api_views/admin/workplaces.py` | 관리자 근무지 생성·조회·수정·삭제 API |
| `myapp/api_views/admin/workplace_rates.py` | 사용자별 근무지 급여율 관리 API |
| `myapp/api_views/admin/workplace_helpers.py` | 관리자 근무지와 급여율 공통 처리 함수 |
| `myapp/api_views/admin/schedules.py` | 관리자 주간 근무 일정 조회와 일괄 변경 API |
| `myapp/api_views/admin/finance.py` | 관리자 수입/지출 관리 |

### 사용자 API

| 경로 | 역할 |
|---|---|
| `myapp/api_views/user/__init__.py` | 사용자 인증·근무·급여·일정 API 패키지 |
| `myapp/api_views/user/auth.py` | 사용자 로그인과 로그아웃 API |
| `myapp/api_views/user/password.py` | 사용자 비밀번호 변경과 재설정 요청 API |
| `myapp/api_views/user/workdays.py` | 사용자 근무일 등록과 조회 API |
| `myapp/api_views/user/workplaces.py` | 사용자 근무지 조회 API |
| `myapp/api_views/user/salary.py` | 사용자 월별 근무와 급여 요약 API |
| `myapp/api_views/user/schedules.py` | 사용자 주간 근무 일정 조회 API |

### Google 연동

| 경로 | 역할 |
|---|---|
| `myapp/api_views/google/__init__.py` | Google 인증·Calendar·Drive 연동 API를 제공하는 패키지 |
| `myapp/api_views/google/auth.py` | Google 로그인·콜백·로그아웃 API |
| `myapp/api_views/google/calendar.py` | Google Calendar 일정 조회 API |
| `myapp/api_views/google/drive_export.py` | Google Drive 근무·급여 Excel 내보내기 API |
| `myapp/api_views/google/google_drive_utils.py` | Google Drive 다운로드·업로드 공통 함수 |
| `myapp/api_views/google/excel_utils.py` | Google Drive용 Excel 생성과 셀 처리 함수 |

### Token·JWT

| 경로 | 역할 |
|---|---|
| `myapp/api_views/token/__init__.py` | JWT 인증·자격 검증·refresh token 처리를 제공하는 패키지 |
| `myapp/api_views/token/authentication.py` | 관리자·사용자 JWT 인증 클래스 |
| `myapp/api_views/token/credentials.py` | 관리자·사용자 로그인 자격 증명 검사 함수 |
| `myapp/api_views/token/refresh.py` | JWT refresh token 갱신 API |
| `myapp/api_views/token/storage.py` | refresh token 해시와 데이터베이스 저장 함수 |

### API 공통 로직

| 경로 | 역할 |
|---|---|
| `myapp/api_views/shared/__init__.py` | 여러 API가 공통으로 사용하는 함수 패키지 |
| `myapp/api_views/shared/date_utils.py` | 날짜 범위와 월 계산 공통 함수 |
| `myapp/api_views/shared/work_type_utils.py` | 근무 유형 별칭과 정규화 공통 함수 |
| `myapp/api_views/shared/salary_utils.py` | 근무 유형별 급여 계산과 급여 지출 동기화 함수 |
| `myapp/api_views/shared/schedule_utils.py` | 근무 일정 검증과 주간 응답 공통 함수 |

### 프로젝트·인프라

| 경로 | 역할 |
|---|---|
| `manage.py` | Django 관리 명령 실행 진입점 |
| `requirements.txt` | Python 패키지 의존성 목록 |
| `myproject/settings.py` | Django·DB·JWT·Channels·Google 환경 설정 |
| `myproject/urls.py` | 최상위 HTTP URL과 `myapp.urls` 연결 |
| `myproject/middlewares.py` | WebSocket token 인증 middleware |
| `myproject/asgi.py` | HTTP와 WebSocket ASGI 진입점 |
| `myproject/wsgi.py` | WSGI 배포 진입점 |
| `myapp/apps.py` | Django 앱 설정과 WebSocket signal 등록 |
| `myapp/urls.py` | 기존 API URL path와 URL name 정의 |
| `myapp/views.py` | 기존 URL import를 유지하는 API view 호환 모듈 |
| `myapp/tests.py` | Django 테스트 모듈; 현재 등록된 테스트 없음 |
| `myapp/encryption/crypto.py` | 민감 정보 암복호화·정규화·blind index 함수 |
| `myapp/encryption/fields.py` | Django 암호화 TextField |
| `myapp/management/commands/rotate_field_encryption_key.py` | 필드 암호화 키 교체 명령 |
| `myapp/migrations/` | Django DB schema와 data migration 이력; 기존 파일 수정 금지 |

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

## 프론트/백엔드 필드명 약속

### WorkPlaceRate 필드명

프론트와 백엔드는 아래 변수명을 그대로 맞춰서 사용합니다.

| 필드명 | 의미 |
| --- | --- |
| `user_uuid` | 사용자 UUID |
| `work_place` | 근무지명 |
| `base_hourly_wage` | 주간 기본 단가 |
| `overtime_hourly_wage` | 평일 잔업 단가 |
| `meal_ot_hourly_wage` | 중식연장 단가 |
| `day_special_hourly_wage` | 주간 특근 단가 |
| `night_special_hourly_wage` | 야간 특근 단가 |
| `overnight_hourly_wage` | 야간 기본 단가 |
| `overnight_ot_hourly_wage` | 야간 잔업 단가 |
| `early_hourly_wage` | 조기출근 단가 |

`special_hourly_wage`는 기존 호환용 필드입니다. 새로 주고받는 값은 `day_special_hourly_wage`, `night_special_hourly_wage`를 사용합니다.

```json
{
  "user_uuid": "00000000-0000-0000-0000-000000000000",
  "work_place": "A현장",
  "base_hourly_wage": 100000,
  "overtime_hourly_wage": 50000,
  "meal_ot_hourly_wage": 30000,
  "day_special_hourly_wage": 120000,
  "night_special_hourly_wage": 150000,
  "overnight_hourly_wage": 130000,
  "overnight_ot_hourly_wage": 60000,
  "early_hourly_wage": 30000
}
```

### work_type 표준 이름

근무 상세 `work_type`은 아래 문자열을 기준으로 사용합니다.

| work_type | 적용 단가 |
| --- | --- |
| `주간` | `base_hourly_wage` |
| `평일 잔업` | `overtime_hourly_wage` |
| `중식연장` | `meal_ot_hourly_wage` |
| `주간 특근` | `day_special_hourly_wage` |
| `야간 특근` | `night_special_hourly_wage` |
| `야간` | `overnight_hourly_wage` |
| `야간 잔업` | `overnight_ot_hourly_wage` |
| `조기출근` | `early_hourly_wage` |

사용하지 않을 이름:

- `잔업` 대신 `평일 잔업`
- `철야` 대신 `야간`
- `철야연장` 대신 `야간 잔업`
- `철야 잔업` 대신 `야간 잔업`
- `특근` 대신 `주간 특근` 또는 `야간 특근`

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