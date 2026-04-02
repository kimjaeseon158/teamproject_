import { Box, Flex, Text, Container, VStack } from "@chakra-ui/react";
import RoleTabs from "../components/RoleTable";
import LoginForm from "../components/LoginFrom";

const LoginMobileLayout = ({ login }) => {
    return (
        <Flex
            direction="column"
            minH="100vh"
            bg="linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)"
            justify="center"
            align="center"
            p={4}
        >
            <Container maxW="md">
                <VStack spacing={8} align="stretch">
                    <Box
                        bg="white"
                        borderRadius="2xl"
                        boxShadow="xl"
                        overflow="hidden"
                    >
                        {/* 역할 선택 탭 */}
                        <RoleTabs role={login.role} setRole={login.setRole} />

                        {/* 로그인 폼 영역 */}
                        <Box p={8}>
                            <LoginForm
                                role={login.role}
                                values={login.values}
                                errors={login.errors}
                                onChange={login.onChange}
                                onSubmit={login.handleSubmit}
                                isLoading={login.isLoading}
                            />
                        </Box>
                    </Box>

                    {/* 하단 정보 */}
                    <Box textAlign="center">
                        <Text fontSize="xs" color="gray.500">
                            © 2026 Attendance Management System. All rights reserved.
                        </Text>
                    </Box>
                </VStack>
            </Container>
        </Flex>
    );
};

export default LoginMobileLayout;
