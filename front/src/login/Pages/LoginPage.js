import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import RoleTabs from "../components/RoleTable";
import LoginForm from "../components/LoginFrom";
import LoginError from "../components/LoginError";
import { useLogin } from "../hook/useLogin";

const LoginPage = () => {
  const login = useLogin();

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="gray.50"
      px={4}
    >
      <Box
        w="100%"
        maxW="420px"
        bg="white"
        borderRadius="xl"
        boxShadow="lg"
        overflow="hidden"          // 🔥 슬라이드 핵심
      >
        {/* 상단 탭 */}
        <RoleTabs role={login.role} setRole={login.setRole} />

        {/* 슬라이드 영역 */}
        <Box
          display="flex"
          w="200%"                  // 🔥 두 화면
          transform={
            login.role === "admin"
              ? "translateX(0%)"
              : "translateX(-50%)"
          }
          transition="transform 0.35s ease"
        >
          {/* 관리자 */}
          <Box w="50%" p={6}>
            <LoginForm
              role="admin"
              values={login.values}
              errors={login.errors}
              onChange={login.onChange}
              onSubmit={login.handleSubmit}
            />
          </Box>

          {/* 사원 */}
          <Box w="50%" p={6}>
            <LoginForm
              role="user"
              values={login.values}
              errors={login.errors}
              onChange={login.onChange}
              onSubmit={login.handleSubmit}
            />
          </Box>
        </Box>

        <LoginError message={login.errorMessage} />
      </Box>
    </Flex>
  );
};

export default LoginPage;
