import { Flex, Box, Text, VStack, Icon, Heading } from "@chakra-ui/react";
import { FiClock, FiCheckCircle, FiTrendingUp } from "react-icons/fi";
import RoleTabs from "../components/RoleTable";
import LoginForm from "../components/LoginForm";

const LoginDesktopLayout = ({ login }) => {
  return (
    <Flex
      minH="100vh"
      bg="#f8fafc"
      align="center"
      justify="center"
      p={6}
    >
      <Flex
        w="100%"
        maxW="1000px"
        h="650px"
        bg="white"
        borderRadius="3xl"
        boxShadow="2xl"
        overflow="hidden"
      >
        {/* 왼쪽 섹션: 브랜딩 및 안내 */}
        <Box
          flex="1"
          bg="blue.600"
          p={12}
          color="white"
          display={{ base: "none", lg: "flex" }}
          flexDirection="column"
          justifyContent="center"
          position="relative"
          overflow="hidden"
        >
          {/* 장식용 배경 요소 */}
          <Box
            position="absolute"
            top="-10%"
            right="-10%"
            w="300px"
            h="300px"
            bg="blue.500"
            borderRadius="full"
            opacity="0.3"
          />
          <Box
            position="absolute"
            bottom="-5%"
            left="-5%"
            w="200px"
            h="200px"
            bg="blue.400"
            borderRadius="full"
            opacity="0.2"
          />

          <VStack align="start" spacing={10} position="relative" zIndex={1}>
            <Box>
              <Heading size="xl" mb={2} letterSpacing="tight">
                출결 및 급여 관리 시스템
              </Heading>
            </Box>

            <VStack align="start" spacing={6}>
              <Flex align="center" gap={4}>
                <Icon as={FiClock} boxSize={6} />
                <Text fontSize="lg">정확한 근무 시간 기록 및 자동화</Text>
              </Flex>
              <Flex align="center" gap={4}>
                <Icon as={FiCheckCircle} boxSize={6} />
                <Text fontSize="lg">간편한 결재 승인 및 관리</Text>
              </Flex>
              <Flex align="center" gap={4}>
                <Icon as={FiTrendingUp} boxSize={6} />
                <Text fontSize="lg">실시간 통계 및 투명한 급여 확인</Text>
              </Flex>
            </VStack>

            <Box pt={10}>
              <Text fontSize="sm" opacity="0.7">
                © 2026 Attendance Management System. All rights reserved.
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* 오른쪽 섹션: 로그인 폼 */}
        <Box
          flex="1"
          p={{ base: 8, md: 16 }}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Box w="100%" maxW="380px" mx="auto">
            {/* 상단 탭 */}
            <Box mb={10} border="1px solid" borderColor="gray.100" borderRadius="xl">
                <RoleTabs role={login.role} setRole={login.setRole} />
            </Box>

            {/* 폼 영역 */}
            <LoginForm
                role={login.role}
                values={login.values}
                errors={login.errors}
                onChange={login.onChange}
                onSubmit={login.handleSubmit}
                isLoading={login.isLoading}
                rememberId={login.rememberId}
                onRememberIdChange={login.onRememberIdChange}
            />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default LoginDesktopLayout;
