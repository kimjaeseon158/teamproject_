import { useBreakpointValue } from "@chakra-ui/react";
import { useLogin } from "../../features/login/hook/useLogin";
import LoginMobileLayout from "../../features/login/layout/LoginMobileLayout";
import LoginDesktopLayout from "../../features/login/layout/LoginDesktopLayout";

const LoginPage = () => {
  const login = useLogin();
  
  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  });

  //인증 확인 중(loading)일 때는 아무것도 렌더링하지 않거나 로딩 인디케이터를 보여줍니다.
  if (login.loading) {
    return null;
  }

  return isMobile ? (
    <LoginMobileLayout login={login} />
  ) : (
    <LoginDesktopLayout login={login} />
  );
};

export default LoginPage;
