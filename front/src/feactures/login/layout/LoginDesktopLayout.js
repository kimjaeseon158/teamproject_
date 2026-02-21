import { Flex, Box } from "@chakra-ui/react";
import RoleTabs from "../components/RoleTable";
import LoginForm from "../components/LoginFrom";

const LoginDesktopLayout = ({ login }) => {
  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%)"
      px={6}
    >
      <Box
        w="100%"
        maxW="460px"
        bg="white"
        borderRadius="2xl"
        boxShadow="0 20px 45px rgba(0,0,0,0.08)"
        overflow="hidden"
      >
        {/* 상단 탭 */}
        <RoleTabs role={login.role} setRole={login.setRole} />

        {/* 폼 영역 */}
        <Box p={8}>
          <LoginForm
            role={login.role}
            values={login.values}
            errors={login.errors}
            onChange={login.onChange}
            onSubmit={login.handleSubmit}
          />
        </Box>
      </Box>
    </Flex>
  );
};

export default LoginDesktopLayout;
