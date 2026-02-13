import { Box, Flex, Text } from "@chakra-ui/react";
import RoleTabs from "../components/RoleTable";
import LoginForm from "../components/LoginFrom";

const LoginMobileLayout = ({ login }) => {
    return (
        <Flex
            direction="column"
            minH="100vh"
            bg="white"
            px={6}
            py={10}
            justify="space-around"
        >
            <Box
                h="120px"                // 🔥 로고 영역 높이
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px solid #333"
                borderRadius="xl"
            >
                <Text fontSize="2xl" fontWeight="bold">
                    LOGO
                </Text>
            </Box>

            {/* 중앙 영역 */}
            <Box>
                <RoleTabs role={login.role} setRole={login.setRole} />

                <Box mt={8}>
                <LoginForm
                    role={login.role}
                    values={login.values}
                    errors={login.errors}
                    onChange={login.onChange}
                    onSubmit={login.handleSubmit}
                />
                </Box>
            </Box>

            {/* 하단 영역 */}
            <Box textAlign="center">
                <Text fontSize="sm" color="gray.500">
                로그인 후 서비스를 이용하세요
                </Text>
            </Box>
        </Flex>
    );
};

export default LoginMobileLayout;
