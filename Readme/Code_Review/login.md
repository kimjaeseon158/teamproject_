# 로그인 컴포넌트 개요

이 컴포넌트는 **관리자(Admin)** 와 **사원(Staff)** 로그인을 처리합니다.

- 역할에 따라 입력 필드를 전환합니다.
- 입력값 유효성 검사를 수행합니다.
- 로그인 후 사용자 역할에 맞는 페이지로 라우팅합니다.
- 애니메이션 효과로 부드러운 UX를 제공합니다.

---

## 역할 전환 UI 처리

```jsx
const [role, setRole] = useState("admin");

<motion.div
  animate={{ x: role === "admin" ? "0%" : "100%" }}
  ...
/>
```

- 관리자와 사원 버튼을 클릭하면 `role` 상태가 변경되며, 입력 폼이 애니메이션과 함께 전환됩니다.
- `framer-motion`의 `animate` 기능을 통해 부드러운 시각 전환을 구현했습니다.

---

## 입력 필드 관리

```js
const handleChange = (e) => {
  const { id, value } = e.target;
  switch (id) {
    case "adminId":
    case "staffId":
      setId(value);
      break;
    case "adminPassword":
    case "staffPw":
      setPassword(value);
      break;
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

```js
const isValid = await validation({
  id,
  setId,
  password,
  setPassword,
  admin_code,
  setadmin_code,
  role,
  rgxCnd,
  setErrors
});

```

- 외부 `validation` 함수를 호출하여 입력값의 유효성을 검사합니다.
- 검사 결과가 실패하면 `setErrors`로 에러 메시지를 출력합니다.

---

## 로그인 처리 및 라우팅

```js
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

## DB & 백엔드 연결 함수 설명

```js
export const HandleLogin = async (id, password, dataType, admin_code) => {
    try {
        const loginData = dataType === "check_admin_login"
            ? { id, password, admin_code }
            : { id, password };

        const response = await fetch("http://127.0.0.1:8000/api/items/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                data_type: dataType,
                data: loginData
            })
        });
        const data = await response.json();
        console.log("로그인 응답 데이터:", data.data.user_data);

        if (data.message === "check_user_login 처리 완료!") {
            return { 
                success: "user", 
                message: data.message, 
                employee_number: data.data.employee_number,  
                name: data.data.user_name  
            };
        } else if (data.message === "check_admin_login 처리 완료!") {
            return { 
                success: "admin", 
                message: data.message, 
                user_Data: data.data.user_data 
            };
        } else {
            return { success: false, message: data.message }; 
        }
    } catch (error) {
        console.error("서버 통신 오류:", error);
        return false;
    }
};
```
- dataType에 따라 관리자 로그인과 일반 사용자 로그인 데이터 구분 처리

- fetch를 통해 백엔드 API에 POST 요청

- 성공 시 사용자 역할(user 또는 admin)과 관련 데이터를 반환

- 실패 시 success: false 반환 및 에러 콘솔 출력

---

## 로그인 정보 검사(`validation` 모듈) 함수 설명

```js
export const validation = async ({ id, password, admin_code, role, rgxCnd, setErrors }) => {
    const idRegex = role === "admin" ? rgxCnd.adminId : rgxCnd.staffId;
    const passwordRegex = role === "admin" ? rgxCnd.adminPassword : rgxCnd.staffPw;
    const otpRegex = role === "admin" ? rgxCnd.adminOtp : null;

    const newErrors = {
        idError: idRegex.test(id) ? "" : "아이디를 잘못 입력하셨습니다",
        passwordError: passwordRegex.test(password) ? "" : "비밀번호를 잘못 입력하셨습니다",
        admin_codeError: ""
    };

    if (role === "admin") {
        if (!admin_code || admin_code.length !== 6) {
            newErrors.admin_codeError = "인증코드는 6자리 숫자여야 합니다.";
        } else if (!otpRegex.test(admin_code)) {
            newErrors.admin_codeError = "인증코드 형식이 올바르지 않습니다.";
        }
    }

    setErrors(newErrors);

    if (newErrors.idError || newErrors.passwordError || newErrors.admin_codeError) {
        return false;
    }

    return {
        success: true,
        dataType: role === "admin" ? "check_admin_login" : "check_user_login"
    };
};
```
- 역할(role)에 따라 아이디, 비밀번호, 인증코드(OTP)의 유효성 검사 수행

- 오류 메시지를 setErrors를 통해 상태에 반영

- 모든 검사 통과 시 로그인 타입(dataType) 정보를 반환

- 검사 실패 시 false 반환

---

## 요약 테이블

| 항목     | 설명                                        |
|----------|---------------------------------------------|
| 역할 전환 | `framer-motion`으로 관리자/사원 폼 전환 처리  |
| 입력 관리 | switch-case로 역할별 입력 필드 구분 처리      |
| 유효성 검사 | 외부 모듈을 통해 정규식 기반 검사 수행            |
| 로그인 처리 | 역할에 따라 세션 저장 및 라우팅 구분             |
| UX       | 로그인 성공 시 페이드아웃 효과로 사용자 경험 개선 |

---

- ##  개선사항

| 개선 항목                | 설명                                                      |
|------------------------|---------------------------------------------------------|
| 세션 스토리지 정리       | 로그인시 `sessionStorage` 에 사용자의 정보 저장 삭제|
| DB 연결 재설정           | 로그인시 사용자의 정보를  `sessionStorage` 에 저장을 하지않고 실시간 검증후 연결  |
| 상태 관리 추상화         | 로그인 로직과 상태 관리를 커스텀 훅(`useLogin`) 등으로 분리하면 재사용성과 테스트 용이성 증가 |

