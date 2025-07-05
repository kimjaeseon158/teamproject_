# 로그인 컴포넌트 개요

이 로그인 컴포넌트는 사원과 관리자 두 사용자 유형을 지원하며, 역할에 따라 다른 입력 폼을 보여주고, 
유효성 검사 후 로그인 요청을 처리합니다. 사용자 유형에 따라 다른 대시보드로 라우팅되며, 
UX 향상을 위해 애니메이션 효과와 세션 저장 기능을 포함하고 있습니다.


- 역할에 따라 입력 필드를 전환합니다.
- 입력값 유효성 검사를 수행합니다.
- 로그인 후 사용자 역할에 맞는 페이지로 라우팅합니다.
- 애니메이션 효과로 부드러운 UX를 제공합니다.

---

##  다른 코드 리뷰 및 소개 보기

- [프로젝트 소개 컴포넌트 리뷰](/README.md)
- [캘린더 컴포넌트 리뷰](./calender.md)
- [어드민페이지 컴포넌트 리뷰](./adminPage.md)

---

## 요약 테이블

| 항목     | 설명                                        |
|----------|---------------------------------------------|
| 역할 전환 |`framer-motion`으로 관리자/사원 폼 전환 처리  |
| 입력 관리 | switch-case로 역할별 입력 필드 구분 처리      |
| 유효성 검사 | 외부 모듈을 통해 정규식 기반 검사 수행            |
| 로그인 처리 | 역할에 따라 세션 저장 및 라우팅 구분             |
| UX       | 로그인 성공 시 페이드아웃 효과로 사용자 경험 개선 |

---

## 역할 전환 UI 처리

역할에 따라 입력 폼을 동적으로 전환하며, 부드러운 애니메이션으로 UX를 향상합니다.

```jsx
// 역할 상태를 저장하는 state (초기값: 'admin')
// 'admin' 또는 'staff' 값에 따라 로그인 폼이 전환됨
const [role, setRole] = useState("admin");

<motion.div
  // 역할에 따라 슬라이딩 애니메이션 위치 조정
  // admin이면 왼쪽(0%), staff이면 오른쪽(100%)으로 이동
  animate={{ x: role === "admin" ? "0%" : "100%" }}

  // ... 생략된 나머지 props (transition, initial 등 포함 가능)
  ...
/>
```

- 관리자와 사원 버튼을 클릭하면 `role` 상태가 변경되며, 입력 폼이 애니메이션과 함께 전환됩니다.
- `framer-motion`의 `animate` 기능을 통해 부드러운 시각 전환을 구현했습니다.

---

## 입력 필드 관리

입력 이벤트를 switch-case로 분기하여, 역할에 따라 알맞은 상태 업데이트를 수행합니다.

```js
// 역할에 따라 입력 상태 업데이트
const handleChange = (e) => {
  const { id, value } = e.target;

  switch (id) {
    // ID 입력
    case "adminId":
    case "staffId":
      setId(value);
      break;

    // 비밀번호 입력
    case "adminPassword":
    case "staffPw":
      setPassword(value);
      break;

    // 관리자 OTP (숫자만 허용)
    case "adminOtp":
      if (/^\d*$/.test(value)) {
        setadmin_code(value);
      }
      break;

    default:
      console.log("값이 입력되지 않음");
  }
};

```

- 역할별로 `id`와 `password` 필드의 `id` 값이 다르기 때문에 switch-case 문으로 분기 처리합니다.
- OTP는 숫자만 입력되도록 정규식을 적용했습니다.

---

## 유효성 검사 (`validation` 모듈)

입력된 값이 정해진 정규식에 맞는지 외부 모듈에서 검사하며, 검사 결과에 따라 오류 메시지를 출력합니다.

```js
// 입력값 유효성 검사 실행
const isValid = await validation({
  id,             // 사용자 ID
  setId,          // ID 상태 업데이트 함수
  password,       // 비밀번호
  setPassword,    // 비밀번호 상태 업데이트 함수
  admin_code,     // 관리자 OTP 코드
  setadmin_code,  // OTP 상태 업데이트 함수
  role,           // 현재 역할(admin or staff)
  rgxCnd,         // 정규식 조건 모음
  setErrors       // 에러 상태 업데이트 함수
});
```

- 외부 `validation` 함수를 호출하여 입력값의 유효성을 검사합니다.
- 검사 결과가 실패하면 `setErrors`로 에러 메시지를 출력합니다.

---

## 로그인 성공 처리 및 라우팅

로그인 성공 시, 사용자 정보를 세션에 저장하고 일정 시간 후 각 역할에 맞는 대시보드 페이지로 이동시킵니다.

```js
// ✅ DB 요청완료후 페이지 전환
if (loginsuccess.success === "admin") {
  setFadeOut(true);
  setUser("admin");
  setUserData(loginsuccess.user_Data)
  sessionStorage.setItem("userRole", "admin");
  sessionStorage.setItem("userData", JSON.stringify(loginsuccess.user_Data));
  setTimeout(() => {
    navigate('/adminPage');
  }, 500);
}
```

- 로그인 성공 여부와 역할에 따라 세션 정보를 저장합니다.
- 이후 관리자 또는 사원 페이지로 이동합니다.
- 관리자 또는 사원 페이지 이동시 정보가 한번에 넘어오는것을 방지하기 위해 시간 간격을 둔후 페이지 이동을 합니다.
- 세션 정보는 `sessionStorage`를 통해 앱 전체에서 접근 가능하게 유지됩니다.

---

## 로그인 정보 검사(`validation` 모듈) 함수 설명

역할에 따라 정규식을 분기하여 유효성 검사를 수행하고, 조건을 만족하지 않으면 오류 메시지를 상태에 반영합니다.

```js
// ✅ 핵심 정규식 분기 처리만 남긴 예시
const idRegex = role === "admin" ? rgxCnd.adminId : rgxCnd.staffId;
const passwordRegex = role === "admin" ? rgxCnd.adminPassword : rgxCnd.staffPw;

const newErrors = {
  idError: idRegex.test(id) ? "" : "아이디 오류",
  passwordError: passwordRegex.test(password) ? "" : "비밀번호 오류",
};

// 관리자일 경우 OTP 유효성도 검사
if (role === "admin") {
  if (!admin_code || admin_code.length !== 6) {
    newErrors.admin_codeError = "6자리 숫자여야 합니다.";
  }
}
```
- 역할(role)에 따라 아이디, 비밀번호, 인증코드(OTP)의 유효성 검사 수행
- 오류 메시지를 setErrors를 통해 상태에 반영
- 모든 검사 통과 시 로그인 타입(dataType) 정보를 반환
- 검사 실패 시 false 반환

---


- ##  개선사항

| 개선 항목                | 설명                                                      |
|------------------------|---------------------------------------------------------|
| 세션 스토리지 정리       | 로그인시 `sessionStorage` 에 사용자의 정보 저장 삭제|
| DB 연결 재설정           | 로그인시 사용자의 정보를  `sessionStorage` 에 저장을 하지않고 실시간 검증후 연결  |
| 상태 관리 추상화         | 로그인 로직과 상태 관리를 커스텀 훅(`useLogin`) 등으로 분리하면 재사용성과 테스트 용이성 증가 |



