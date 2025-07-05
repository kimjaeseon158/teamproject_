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

### 3-0. Node.js 설치 확인

```bash
node --version
npm --version
```
- 만약 설치되어 있지 않거나 명령어가 인식되지 않는다면,  
  [Node.js 공식 사이트](https://nodejs.org/)에서 Node.js (v18 이상 권장)를 다운로드 및 설치하세요.

### 3-1. 필수 모듈 설치 

```bash
npm install
```
- `package.json`에 명시된 라이브러리들이 설치됩니다.

### 3-2. concurrently 설치
```bash
npm install concurrently --save-dev
```

- `concurrently`는 여러개의 명령어를 동시에 실행 하게 지원을 해주는 라이브러리 입니다
- 이를 사용하면 `npm start` 명령어 하나로 두 서버를 같이 실행할 수 있어 개발이 편리해집니다.

### 3-3. concurrently 사용 예시 ( 파일명 : package.json )
```js
{
  "scripts": {
    "start-server": "cd ../back/myproject && python manage.py runserver",
    "start-client": "react-scripts start",
    "start": "concurrently \"npm run start-server\" \"npm run start-client\""
  }
}
```

### 3-4. 설치 확인 및 실행 테스트
```bash
npm start
```
- 명령어 실행 후 브라우저가 자동으로 열리며,
`http://localhost:3000`에서 React 앱이 정상적으로 표시되면 설치가 성공적으로 완료된 것입니다.
