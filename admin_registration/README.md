# 관리자 등록 스크립트

## 사용자 실행

Python 설치 없이 Windows PowerShell 5.1 또는 PowerShell 7에서 실행합니다.
ZIP을 압축 해제하고 `RegisterAdmin.cmd`를 더블클릭하면 PowerShell이 열리고
등록 스크립트가 바로 실행됩니다. CMD와 PS1 파일은 같은 폴더에 두세요.
파일을 받은 후 PowerShell에서 해당 폴더로 이동하고 다음을 실행하세요.

```powershell
powershell -ExecutionPolicy Bypass -File .\register_admin.ps1
```

이름, ID, 비밀번호와 확인, 운영자에게 별도로 받은 **등록용 공통 비밀번호**를 입력합니다.
서버가 인증번호를 생성하며, 등록 성공 시 화면에 표시됩니다.
인증번호를 안전하게 보관한 후 Enter를 누르세요.
https://sunsafe.thenano.dev/ 에서 ID·비밀번호·발급된 인증번호로 로그인합니다.
통신 오류로 결과를 받지 못했다면 운영자에게 계정 확인과 인증번호 재발급을 요청하세요.
스크립트는 요청을 자동 재시도하거나 인증번호를 파일에 저장하지 않습니다.
PowerShell Transcript 등 화면 기록 기능은 사용하지 마세요.

## Linux·macOS에서 실행

Bash, curl, jq가 필요합니다. macOS 기본 Bash 3.2에서도 사용할 수 있도록 작성했습니다.
도구가 없는 경우 설치 후 ZIP을 압축 해제한 폴더에서 실행하세요.

```bash
# macOS: Homebrew가 설치되어 있을 때
brew install jq

# Ubuntu / Debian
sudo apt-get update
sudo apt-get install curl jq

# 등록 실행
bash register_admin.sh
```

비밀번호와 등록용 비밀번호는 입력 중 표시되지 않습니다.
성공하면 발급된 인증번호를 화면에 표시합니다. 입력값과 인증번호는 파일에 저장하지 않습니다.
`bash -x`나 터미널 화면 기록 기능은 사용하지 마세요.
서버 주소를 변경하려면 `bash register_admin.sh --server-url https://서버주소`로 실행합니다.
로컬 테스트에서는 아래 명령을 사용합니다.

```bash
bash register_admin.sh --server-url http://127.0.0.1:8000 --allow-local-http
```

로컬 로그인 화면은 별도로 실행한 React의 http://localhost:3000/ 입니다.

## 운영 서버 준비

### 로컬 테스트

백엔드 `.env`의 DB 설정은 반드시 테스트용 PostgreSQL DB를 가리키도록 하고,
Redis 연결과 `ADMIN_REGISTRATION_PASSWORD`를 설정하세요.
`DEBUG=True`, `ALLOWED_HOSTS=127.0.0.1,localhost`, `SECURE_SSL_REDIRECT=False`로 설정합니다.
백엔드 폴더에서 `python manage.py migrate` 후 `python manage.py runserver`를 실행합니다.
다른 터미널의 프로젝트 루트에서 실행하세요.

```powershell
powershell -ExecutionPolicy Bypass -File .\admin_registration\register_admin.ps1 -ServerUrl http://127.0.0.1:8000 -AllowLocalHttp
```

`-AllowLocalHttp`는 명시적으로 지정할 때 localhost 및 루프백 주소의 HTTP만 허용합니다.
기본 CMD 실행은 운영 서버에 연결하므로 로컬 테스트에는 위 명령을 사용하세요.
React는 `front` 폴더에서 `npm.cmd run start-client`로 실행하고 localhost:3000에서 로그인합니다.
서버가 로컬이어도 DB 설정이 운영 DB를 가리키면 운영 계정이 생성되므로 확인하세요.

등록 API를 배포하고 서버 `.env`에 아래 값을 설정한 뒤 Django를 재시작합니다.

```env
ADMIN_REGISTRATION_PASSWORD=충분히_긴_무작위_등록용_비밀번호
```

이 값이 없거나 비어 있으면 등록이 차단됩니다.
공통 비밀번호는 배포 ZIP에 넣지 말고 사용자에게 별도로 전달하세요.
등록 API는 `POST /api/admin/register/`이며 이름·ID·비밀번호·registration_password를 받습니다.
사용자가 인증번호를 지정할 수 없습니다. 서버는 보안 난수로 19자 코드를 생성합니다.
인증번호는 요청대로 DB에 **평문 저장**하며 기존 로그인 비교 방식을 유지합니다.
비밀번호만 PBKDF2 해시로 저장합니다. DB 마이그레이션은 필요하지 않습니다.
성공 응답(201)에 admin_id와 admin_code가 포함되며 Cache-Control: no-store를 적용합니다.
기존 ID에 재요청하면 409로 거부하며 기존 인증번호를 반환하지 않습니다.

IP당 첫 요청부터 60초 동안 최대 5회로 제한합니다. 공유 Redis 캐시가 필요합니다.
캐시 장애 시 등록을 차단합니다. 신뢰하는 프록시/웹서버에서 Django REMOTE_ADDR을
실제 클라이언트 IP로 설정하세요. 외부 X-Forwarded-For를 API가 직접 신뢰하지 않습니다.
프록시 IP만 보이면 같은 프록시를 사용하는 사용자의 제한이 합산됩니다.
운영은 DEBUG=False로 실행하고 프록시/APM의 요청·응답 본문 기록을 끄세요.

인증번호 분실 또는 등록 응답 유실 시 **백엔드 서버 터미널**에서 실행합니다.

```bash
python manage.py reissue_admin_code 관리자ID
```

새 인증번호가 출력되고 이전 번호는 즉시 무효화됩니다. 결과를 안전하게 전달하세요.

## 전달 ZIP 만들기

```powershell
Compress-Archive -LiteralPath .\RegisterAdmin.cmd, .\register_admin.ps1, .\register_admin.sh, .\README.md -DestinationPath .\AdminRegistration.zip -Force
```

스크립트와 안내서만 포함하고 실제 .env나 DB 정보는 전달하지 않습니다.
사용자는 HTTPS 443으로 외부 서버에 연결하며 Python이나 DB 직접 연결은 필요 없습니다.
회사 보안 정책에 따라 스크립트 실행이나 외부 연결이 차단될 수 있습니다.
서버 API 배포 후 실제 등록과 기존 로그인을 확인하세요.

## 개발 검증

```powershell
python admin_registration/test_server.py
powershell -ExecutionPolicy Bypass -File .\admin_registration\test_powershell.ps1
```

프로젝트 루트에서 실행합니다. 서버 테스트는 운영 .env 대신 메모리 SQLite와
로컬 캐시를 사용하며, PowerShell 테스트는 통신과 입력을 대체해 오프라인으로 실행합니다.
DB 중복 충돌 처리는 모의 IntegrityError로 검증합니다.
운영 PostgreSQL·Redis에서의 동시 등록과 실제 통신은 배포 후 별도 검증이 필요합니다.
