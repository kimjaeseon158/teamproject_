param([string]$ServerUrl = 'https://sunsafe.thenano.dev', [switch]$AllowLocalHttp)

$ErrorActionPreference = 'Stop'

function Read-HiddenText {
    param([string]$Prompt)
    $secureValue = Read-Host $Prompt -AsSecureString
    $valuePointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($valuePointer) }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($valuePointer)
        $secureValue.Dispose()
    }
}

function Invoke-AdminRegistration {
    param([string]$BaseUrl, [hashtable]$Payload, [switch]$AllowLocalHttp)
    $uri = [Uri]$BaseUrl
    $localHttp = $AllowLocalHttp -and $uri.Scheme -eq 'http' -and $uri.Host -in @('localhost', '127.0.0.1', '[::1]', '::1')
    if (-not $uri.IsAbsoluteUri -or ($uri.Scheme -ne 'https' -and -not $localHttp) -or $uri.UserInfo -or $uri.Query -or $uri.Fragment -or $uri.AbsolutePath -ne '/') {
        throw 'ServerUrl must be an HTTPS origin, for example https://sunsafe.thenano.dev'
    }
    $body = ConvertTo-Json -InputObject $Payload -Compress
    try {
        # UTF-8 bytes preserve Korean names in Windows PowerShell 5.1.
        return Invoke-RestMethod -Uri ($BaseUrl.TrimEnd('/') + '/api/admin/register/') -Method Post `
            -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($body)) `
            -TimeoutSec 15 -MaximumRedirection 0 -ErrorAction Stop
    } finally { $body = $null }
}

function Start-AdminRegistration {
    param([string]$BaseUrl, [switch]$AllowLocalHttp)
    $payload = @{}
    $password = $confirmation = $registrationPassword = $response = $null
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
        Write-Host '=== 관리자 계정 등록 ==='
        $name = (Read-Host '관리자 이름').Trim()
        $adminId = (Read-Host '관리자 ID').Trim()
        $password = Read-HiddenText '비밀번호'
        $confirmation = Read-HiddenText '비밀번호 확인'
        $registrationPassword = Read-HiddenText '등록용 공통 비밀번호'
        if (-not $name -or -not $adminId -or [string]::IsNullOrWhiteSpace($registrationPassword)) {
            Write-Host '이름, ID, 등록용 비밀번호를 입력하세요.' -ForegroundColor Yellow
            return
        }
        if ($name.Length -gt 50 -or $adminId.Length -gt 50 -or $password.Length -lt 8 -or $password.Length -gt 1024 -or $registrationPassword.Length -gt 1024) {
            Write-Host '이름과 ID는 50자 이하, 비밀번호는 8~1024자, 등록용 비밀번호는 1024자 이하로 입력하세요.' -ForegroundColor Yellow
            return
        }
        if ($password -cne $confirmation) {
            Write-Host '비밀번호 확인이 일치하지 않습니다.' -ForegroundColor Yellow
            return
        }
        $payload = @{ admin_name = $name; admin_id = $adminId; password = $password; registration_password = $registrationPassword }
        Write-Host '서버에 등록 요청을 보내는 중...'
        $response = Invoke-AdminRegistration $BaseUrl $payload -AllowLocalHttp:$AllowLocalHttp
        if (-not $response.admin_id -or -not $response.admin_code) {
            Write-Host '결과를 확인할 수 없습니다. 운영자에게 계정 확인 및 인증번호 재발급을 요청하세요.' -ForegroundColor Yellow
            return
        }
        Write-Host '[완료] 관리자 계정이 생성되었습니다.' -ForegroundColor Green
        Write-Host ('관리자 ID: ' + $response.admin_id)
        Write-Host ('로그인 인증번호: ' + $response.admin_code) -ForegroundColor Yellow
        Write-Host '인증번호를 안전한 곳에 보관하세요. 창을 닫으면 다시 조회할 수 없습니다.' -ForegroundColor Yellow
        Write-Host ('로그인 주소: ' + $BaseUrl.TrimEnd('/') + '/')
    } catch {
        $statusCode = 0
        if ($_.Exception.Response) { $statusCode = [int]$_.Exception.Response.StatusCode }
        switch ($statusCode) {
            400 { Write-Host '입력값을 확인하세요. 흔한 비밀번호, 숫자만인 비밀번호, ID와 유사한 비밀번호는 사용할 수 없습니다.' }
            403 { Write-Host '등록용 공통 비밀번호가 다르거나 서버에서 등록을 비활성화했습니다.' }
            409 { Write-Host '이미 사용 중인 ID입니다. 기존 계정은 변경되지 않았습니다.' }
            429 { Write-Host '요청이 너무 많습니다. 1분 후 다시 시도하세요.' }
            503 { Write-Host '서버 등록 기능이 일시적으로 사용 불가능합니다.' }
            default { Write-Host '연결 또는 서버 응답 오류입니다. 결과가 불명확하므로 운영자에게 계정 확인 및 인증번호 재발급을 요청하세요.' }
        }
        # Do not print exception bodies, request payloads or credentials.
    } finally {
        $payload.Clear()
        $password = $confirmation = $registrationPassword = $response = $null
    }
}

# Dot-sourcing exposes functions for offline tests without prompting or making requests.
if ($MyInvocation.InvocationName -ne '.') {
    Start-AdminRegistration $ServerUrl -AllowLocalHttp:$AllowLocalHttp
    [void](Read-Host '창을 닫으려면 Enter를 누르세요')
}
