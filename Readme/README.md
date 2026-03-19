# 📄 일일 근무 기록 및 일급 관리 시스템 (Daily Pay Management)

- 반복적인 근무 기록과 일급 계산 과정을 간소화하기 위해 개발된 직원 근무 현황 기록 및 자동 급여 계산 시스템입니다.
- 관리자는 데이터를 보다 빠르고 정확하게 관리할 수 있으며, 사용자는 자신의 근무 기록과 예상 일급을 실시간으로 확인할 수 있습니다.

## 💡 주요 특징

- **User (사용자)**: 날짜, 장소, 시간 등 일일 근무 내용 입력, 자동 일급 계산 및 월별 합계 확인.
- **Admin (관리자)**: 사용자 정보 관리, 시급 차등 설정, 근무 기록 승인/반려, 통계 대시보드.

## 🛠 사용 라이브러리 (Dependencies)

### 🐍 Backend (Django)
| 분류 | 라이브러리 | 용도 |
| :--- | :--- | :--- |
| **Core** | `Django`, `djangorestframework` | 웹 프레임워크 및 REST API 구축 |
| **Auth** | `djangorestframework-simplejwt`, `google-auth-oauthlib` | JWT 인증 및 Google OAuth 2.0 연동 |
| **Database** | `psycopg2-binary`, `django-redis` | PostgreSQL 연동 및 Redis 캐시 사용 |
| **Real-time** | `channels`, `channels-redis`, `daphne` | WebSocket 기반 실시간 알림 시스템 |
| **Async/Task** | `django-apscheduler` | 백엔드 예약 작업 및 스케줄링 |
| **Config/Security** | `django-environ`, `django-cors-headers` | 환경 변수 관리 및 CORS 보안 설정 |
| **Deployment** | `gunicorn`, `whitenoise` | 배포용 웹 서버 및 정적 파일 관리 |

### ⚛️ Frontend (React)
| 분류 | 라이브러리 | 용도 |
| :--- | :--- | :--- |
| **Core** | `react`, `react-router-dom` | UI 라이브러리 및 SPA 라우팅 |
| **UI/Styling** | `@chakra-ui/react`, `framer-motion`, `react-icons` | 컴포넌트 라이브러리, 애니메이션, 아이콘 |
| **Calendar** | `@fullcalendar/react`, `react-big-calendar` | 근무 기록 표시용 인터랙티브 캘린더 |
| **Chart** | `recharts` | 매출 및 지출 통계 시각화 |
| **HTTP Client** | `axios` | 백엔드 API와의 비동기 통신 |
| **Utility** | `date-fns`, `moment` | 복잡한 날짜 및 시간 데이터 처리 |

## ⚙️ 시작하기 전 설정 (Initial Setup)

프로젝트를 실행하기 위해 백엔드와 프론트엔드 각각에 환경 변수(`.env`) 설정이 필요합니다. 각 디렉토리에 포함된 `.env.example` 파일을 복사하여 사용하세요.

### ⚠️ 중요: 주소 설정
기본적으로 모든 주소는 `localhost`로 되어 있습니다. 실제 배포 환경이나 다른 네트워크에서 접속할 경우, `.env` 파일의 각 항목(`CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`, `REACT_APP_WS_BASE_URL` 등)을 해당 환경의 IP 또는 도메인 주소로 반드시 변경해야 합니다.

### 1. Backend 설정 (`Back/myproject/.env`)
`Back/myproject/.env.example` 파일을 복사하여 `.env` 파일을 생성하고, 아래 주요 항목을 설정하세요.
- `SECRET_KEY`, `REFRESH_TOKEN_HASH_SECRET`: 보안을 위해 복잡한 문자열로 변경
- `DB_`: 실제 PostgreSQL 데이터베이스 정보 입력
- `GOOGLE_`: Google Cloud Console에서 발급받은 OAuth 정보 입력
- `CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`: 프론트엔드 서버 주소

### 2. Frontend 설정 (`front/.env`)
`front/.env.example` 파일을 복사하여 `.env` 파일을 생성하세요.
- `REACT_APP_WS_BASE_URL`: 백엔드 WebSocket 주소 (예: `ws://localhost:8000/ws`)

## 🚀 설치 및 실행 방법

### Backend
1. `cd Back/myproject`
2. `python -m venv venv` 후 가상환경 활성화
3. `pip install -r requirements.txt`
4. `python manage.py migrate`
5. `python manage.py runserver`

### Frontend
1. `cd front`
2. `npm install`
3. `npm start` (설정된 경우 백엔드와 동시 실행 가능)

---
*참고: 상세 코드 리뷰 및 기술 문서는 `Readme/Code_Review/` 폴더를 참조하세요.*
