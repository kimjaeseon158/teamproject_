import { useBreakpointValue } from "@chakra-ui/react";
import { useLogin } from "../hook/useLogin";
import LoginMobileLayout from "../layout/LoginMobileLayout";
import LoginDesktopLayout from "../layout/LoginDesktopLayout";

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
