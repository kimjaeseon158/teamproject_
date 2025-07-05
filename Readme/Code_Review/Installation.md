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

## 3-0. frontend 디렉토리로 이동

```bash
cd front
```

## 3-1. node.js 설치 확인

```bash
node --version
npm --version
```

## 3-2. node.js 설치

- [Node.js (v18 이상 권장)](https://nodejs.org/) ( 설치하면 `npm`도 자동으로 같이 설치됩니다. )

## 3-3. 필수 모듈 설치 

```bash
npm install
```

## 3-4. 설치 확인 및 실행 테스트
```bash
npm start
```

- `http://localhost:3000`에서 앱이 열리면 설치 성공

## 3-5. concurrently 설치
```bash
npm install concurrently
```

- `concurrently`는 여러개의 명령어를 동시에 실행 하게 지원을 해주는 라이브러리 입니다

## 사용 예시
```bash
"scripts": {
  "start-server": "cd ../back/myproject && python manage.py runserver",
  "start-client": "react-scripts start",
  "start": "concurrently \"npm run start-server\" \"npm run start-client\""
}
```
