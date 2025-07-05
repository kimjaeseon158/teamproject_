## 1. 프로젝트 클론

```bash
git clone https://github.com/your-username/your-project.git
cd your-project
```

## 2. 백엔드(Django) 설정

### 2-0.Python 및 pip 설치 확인
```bash
python --version
```
```bash
python3 --version
```
-> 버전 확인 후 python이 없을 시  https://www.python.org에서 Python 3.x 버전을 설치

```bash
pip --version
```
-> 버전 확인 후 없으면 Python 설치 시 "Add Python to PATH"를 체크했는지 확인하고, Python을 먼저 설치 완료한 경우 python -m ensurepip로 설치 가능
```bash
python -m ensurepip
```

### 2-1.Django 설치
```bash
pip install django
```
설치 확인
```bash
python -m django --version
```

### 2-2.개발 서버 실행 동작 확인
```bash
python manage.py runserver
```
-> 최종적으로 Django가 실행이 정상적 동작이 확인 되면 추후 서버 실행은 npm start시 같이 실행이 되도록 코드 작성이 되어 있음

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
