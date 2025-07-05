# 프론트엔드-백엔드 통신 로직

프론트엔드와 백엔드 간 로그인 데이터 통신을 담당하는 함수의 개요입니다.
이 함수는 사용자 입력을 기반으로 API 요청을 만들고, 서버로부터 받은 결과에 따라 역할 정보를 반환합니다.

---

# Login API 통신 함수 개요

사용자가 입력한 로그인 정보를 백엔드로 전달하고, 응답 결과에 따라 로그인 성공 여부 및 사용자 역할을 판별합니다.

```js
// ✅ 역할에 따라 전송 데이터 구조 설정
const loginData = dataType === "check_admin_login"
  ? { id, password, admin_code }
  : { id, password };

// ✅ fetch로 Django 백엔드에 요청
const response = await fetch("http://127.0.0.1:8000/api/items/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    data_type: dataType,
    data: loginData
  })
});

const data = await response.json();

// ✅ 사용자 유형에 따른 분기 처리
if (data.message.includes("check_user_login")) {
  return { success: "user", ... };
} else if (data.message.includes("check_admin_login")) {
  return { success: "admin", ... };
}

return { success: false };
}
```
- dataType에 따라 관리자 로그인과 일반 사용자 로그인 데이터 구분 처리
- fetch를 통해 백엔드 API에 POST 요청
- 성공 시 사용자 역할(user 또는 admin)과 관련 데이터를 반환
- 실패 시 success: false 반환 및 에러 콘솔 출력

👉 [로그인 컴포넌트 보기](./login.md)

---

# Calender API 통신 함수 

서버에 근무 정보를 POST 방식으로 전송하고, 응답 데이터를 JSON 형태로 반환하는 함수입니다.

```js
// 서버에 근무 정보 전송 함수
const sendWorkInfoToServer = async (workData) => {
  const response = await fetch("http://127.0.0.1:8000/api/items/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workData),
  });
  return await response.json();
};

// submitWorkInfo 내부에서 호출
const submitWorkInfo = async (params) => {
  // ... 데이터 준비 코드

  const newRecord = { /* ... */ };

  const data = await sendWorkInfoToServer(newRecord);

  return { data, newRecord };
};
```

- `sendWorkInfoToServer` 함수는 API 엔드포인트에 JSON 형식으로 근무 정보를 보내는 역할을 합니다.
- 비동기 함수로, 서버의 응답을 받아 JSON으로 파싱해 반환합니다.
- `submitWorkInfo` 함수 내에서 호출되어, 사용자 입력 데이터를 준비한 뒤 서버에 전송합니다.
- 이런 구조는 네트워크 통신 코드를 분리해 재사용성과 유지보수성을 높이는 데 유리합니다.
- 오류 처리 및 응답 확인은 호출부에서 별도로 관리할 수 있습니다.

👉 [캘린더 컴포넌트 보기](./calender.md)

---
