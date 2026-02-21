import { useBreakpointValue } from "@chakra-ui/react";
import { useLogin } from "../../feactures/login/hook/useLogin";
import LoginMobileLayout from "../../feactures/login/layout/LoginMobileLayout";
import LoginDesktopLayout from "../../feactures/login/layout/LoginDesktopLayout";

const LoginPage = () => {
  const login = useLogin();

  const isMobile = useBreakpointValue({
    base: true,
    md: false,
  });

  return isMobile ? (
    <LoginMobileLayout login={login} />
  ) : (
    <LoginDesktopLayout login={login} />
  );
};

export default LoginPage;
