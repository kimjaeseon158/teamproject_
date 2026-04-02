# GEMINI.md

## 🚀 Project Overview
**Daily Pay & Work Record Management System**
A full-stack application designed to simplify daily work record management and automatic salary calculation for employees and administrators.

- **Frontend:** React 19 (Chakra UI, FullCalendar, Recharts, Framer Motion)
- **Backend:** Django 4.2 (DRF, PostgreSQL, Redis, Django Channels, Google OAuth)
- **Architecture:** Decoupled React frontend and Django REST API.

---

## 🛠 Building and Running

### ⚙️ Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Redis (for Caching and WebSockets)

### 🐍 Backend Setup (Django)
1. Navigate to the backend directory:
   ```bash
   cd Back/myproject
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables in `.env` (see Configuration below).
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Start the development server:
   ```bash
   python manage.py runserver
   ```

### ⚛️ Frontend Setup (React)
1. Navigate to the frontend directory:
   ```bash
   cd front
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```

> **Note:** The `front/package.json` contains a `start` script that uses `concurrently` to run both backend and frontend. However, verify the case sensitivity of the path (e.g., `cd ../back/myproject` vs `cd ../Back/myproject`).

---

## 🔧 Configuration (.env)

### 🐍 Backend (`Back/myproject/.env`)
Required keys (based on `settings.py`):
- `SECRET_KEY`: Django secret key.
- `REFRESH_TOKEN_HASH_SECRET`: Secret for hashing refresh tokens.
- `DEBUG`: `True` or `False`.
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts.
- `CORS_ALLOWED_ORIGINS`: Origins allowed for CORS.
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`: PostgreSQL credentials.
- `UPSTASH_REDIS_REST_URL`: Redis connection URL (used for cache and channels).
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`: For Google OAuth.
- `FRONTEND_URL`: URL for the React frontend.

### ⚛️ Frontend (`front/.env`)
- `REACT_APP_WS_BASE_URL`: WebSocket endpoint (e.g., `ws://localhost:8000/ws`).

---

## 📚 Development Conventions

### 🎨 Backend (Django)
- **App Structure:** Core logic resides in `myapp`.
- **Formatting:** Use `black` for Python code formatting.
- **Authentication:** Custom JWT-based authentication using `AdminRefreshToken` and `UserRefreshToken` models.
- **Real-time:** Uses Django Channels (WebSocket) for live notifications.
- **Scheduling:** `django-apscheduler` is used for background tasks.

### ⚛️ Frontend (React)
- **Styling:** Prefers **Chakra UI** for components and **Vanilla CSS** for specific layout needs.
- **API Calls:** Use `fetchWithAuth` (in `src/services/api/`) which automatically handles JWT refresh on 401/403 errors.
- **Routing:** Managed via `AppRoutes.js` with `RequireAuth` wrapper for protected routes.
- **State Management:** Uses React Context (`UserProvider`, `AlarmProvider`).

### 📂 Key Directories
- `Back/myproject/myapp/`: Main backend application logic (models, views, serializers).
- `front/src/feactures/`: Domain-specific components and logic (auth, admin, alarm).
- `front/src/pages/`: Main application pages.
- `Readme/Code_Review/`: Detailed documentation and post-mortems of specific modules.

---

## 🛡️ Security & Authentication
- **JWT:** Access tokens are short-lived (30 min); Refresh tokens are stored in the database (`AdminRefreshToken`/`UserRefreshToken`) and delivered via cookies or handled in the frontend logic.
- **Role-based Access:** Differentiates between `user` (employee) and `admin` login types.
- **Password Hashing:** Uses Django's `make_password` in model `save()` methods.
