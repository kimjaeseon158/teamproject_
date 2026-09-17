#!/usr/bin/env bash
# Compatible with macOS Bash 3.2. Secrets stay out of command-line arguments/files.
set -euo pipefail

server_url='https://sunsafe.thenano.dev'
allow_local_http=false
while [ "$#" -gt 0 ]; do
    case "$1" in
        --server-url)
            if [ "$#" -lt 2 ]; then printf '%s\n' '--server-url 뒤에 주소를 입력하세요.' >&2; exit 1; fi
            server_url=$2; shift 2 ;;
        --allow-local-http) allow_local_http=true; shift ;;
        --help)
            printf '%s\n' '사용: bash register_admin.sh [--server-url https://서버주소] [--allow-local-http]'
            exit 0 ;;
        *) printf '%s\n' '알 수 없는 옵션입니다. --help로 사용법을 확인하세요.' >&2; exit 1 ;;
    esac
done

for tool in curl jq; do
    if ! command -v "$tool" >/dev/null 2>&1; then
        printf '%s\n' "$tool 설치가 필요합니다. README.md를 확인하세요." >&2
        exit 1
    fi
done

https_origin='^https://([A-Za-z0-9.-]+|\[[0-9A-Fa-f:]+\])(:[0-9]+)?/?$'
local_origin='^http://(localhost|127\.0\.0\.1|\[::1\])(:[0-9]+)?/?$'
protocols='=https'
if [[ "$server_url" =~ $https_origin ]]; then
    :
elif [ "$allow_local_http" = true ] && [[ "$server_url" =~ $local_origin ]]; then
    protocols='=http'
else
    printf '%s\n' 'HTTPS 서버 주소가 필요합니다. HTTP는 --allow-local-http 지정 시 루프백 주소만 허용합니다.' >&2
    exit 1
fi
server_url=${server_url%/}

if [ ! -t 0 ]; then
    printf '%s\n' '사용자 터미널에서 실행하세요.' >&2
    exit 1
fi

cleanup() {
    unset password confirmation registration_password payload response body code
}
trap cleanup EXIT
trap 'printf "\n등록이 취소되었습니다.\n" >&2; exit 130' INT
trap 'exit 143' TERM

printf '%s\n' '=== 관리자 계정 등록 ==='
IFS= read -r -p '관리자 이름: ' admin_name
IFS= read -r -p '관리자 ID: ' admin_id
IFS= read -r -s -p '비밀번호: ' password; printf '\n'
IFS= read -r -s -p '비밀번호 확인: ' confirmation; printf '\n'
IFS= read -r -s -p '등록용 공통 비밀번호: ' registration_password; printf '\n'
if [[ ! "$admin_name" =~ [^[:space:]] || ! "$admin_id" =~ [^[:space:]] || ! "$registration_password" =~ [^[:space:]] ]]; then
    printf '%s\n' '모든 항목을 입력하세요.' >&2; exit 1
fi
if [ "${#admin_name}" -gt 50 ] || [ "${#admin_id}" -gt 50 ] || [ "${#password}" -lt 8 ] || [ "${#password}" -gt 1024 ] || [ "${#registration_password}" -gt 1024 ]; then
    printf '%s\n' '이름과 ID는 50자 이하, 비밀번호는 8~1024자, 등록용 비밀번호는 1024자 이하로 입력하세요.' >&2; exit 1
fi
if [ "$password" != "$confirmation" ]; then
    printf '%s\n' '비밀번호 확인이 일치하지 않습니다.' >&2; exit 1
fi

# Encode each input using stdin, including quotes, backslashes, Korean and punctuation.
payload=$(
    {
        printf '%s' "$admin_name" | jq -Rs .
        printf '%s' "$admin_id" | jq -Rs .
        printf '%s' "$password" | jq -Rs .
        printf '%s' "$registration_password" | jq -Rs .
    } | jq -cs '{admin_name: .[0], admin_id: .[1], password: .[2], registration_password: .[3]}'
)
unset password confirmation registration_password
printf '%s\n' '서버에 등록 요청을 보내는 중...'
if ! response=$(printf '%s' "$payload" | curl -q --silent --proto "$protocols" --no-location --retry 0 \
    --connect-timeout 10 --max-time 15 --request POST \
    --header 'Content-Type: application/json; charset=utf-8' --header 'Accept: application/json' \
    --data-binary @- --write-out '\n%{http_code}' "$server_url/api/admin/register/" 2>/dev/null); then
    printf '%s\n' '연결 또는 인증서 오류입니다. 계정이 생성됐을 수 있으므로 운영자에게 계정 확인 및 인증번호 재발급을 요청하세요.' >&2
    exit 1
fi
unset payload
status=${response##*$'\n'}
body=${response%$'\n'*}
case "$status" in
    201)
        if ! code=$(printf '%s' "$body" | jq -er '.admin_code | select(type == "string") | select(test("^[A-HJ-NP-Z2-9]{4}(-[A-HJ-NP-Z2-9]{4}){3}$"))'); then
            printf '%s\n' '응답을 확인할 수 없습니다. 운영자에게 계정 확인 및 인증번호 재발급을 요청하세요.' >&2; exit 1
        fi
        if ! created_id=$(printf '%s' "$body" | jq -er '.admin_id | select(type == "string" and length > 0)'); then
            printf '%s\n' '응답을 확인할 수 없습니다. 운영자에게 계정 확인 및 인증번호 재발급을 요청하세요.' >&2; exit 1
        fi
        printf '%s\n' '[완료] 관리자 계정이 생성되었습니다.' "관리자 ID: $created_id" "로그인 인증번호: $code" \
            '인증번호를 안전한 곳에 보관하세요. 다시 조회할 수 없습니다.' "접속 주소: $server_url/"
        ;;
    400) printf '%s\n' '입력값을 확인하세요. 비밀번호는 흔하거나 숫자만인 값, ID와 유사한 값을 사용할 수 없습니다.' >&2; exit 1 ;;
    403) printf '%s\n' '등록용 공통 비밀번호가 다르거나 서버에서 등록을 비활성화했습니다.' >&2; exit 1 ;;
    409) printf '%s\n' '이미 사용 중인 ID입니다. 기존 계정은 변경되지 않았습니다.' >&2; exit 1 ;;
    429) printf '%s\n' '요청이 너무 많습니다. 1분 후 다시 시도하세요.' >&2; exit 1 ;;
    503) printf '%s\n' '서버 등록 기능이 일시적으로 사용 불가능합니다.' >&2; exit 1 ;;
    *) printf '%s\n' '서버 응답 오류입니다. 운영자에게 계정 확인 및 인증번호 재발급을 요청하세요.' >&2; exit 1 ;;
esac
