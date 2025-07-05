## 1. 프로젝트 클론

```bash
git clone https://github.com/your-username/your-project.git
cd your-project
```

## 2. 백엔드(Django) 설정

### 1.가상환경 생성 및 활성화

```bash
python -m venv venv
# macOS/Linux
source venv/bin/activate
# Windows
venv\Scripts\activate
```
### 2. 패키지 설치 

```bash
pip install -r requirements.txt
```

### 3. 데이터베이스 초기화 

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4.개발 서버 실행

```bash
python manage.py runserver
```

## 3.프론트엔드(React) 설정

## 1. frontend 디렉토리로 이동

```bash
cd frontend
```

## 1. frontend 디렉토리로 이동

```bash
npm install
```

## 1. frontend 디렉토리로 이동

```bash
npm start
```
