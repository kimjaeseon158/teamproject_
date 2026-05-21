import {
  Box,
  Divider,
  HStack,
  Icon,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiCalendar,
  FiDollarSign,
  FiHome,
  FiUsers,
} from "react-icons/fi";
import { useUser } from "../../auth/userContext";

const navItems = [
  { label: "Overview", path: "/dashboard", icon: FiHome, exact: true },
  { label: "직원 관리", path: "/dashboard/admin", icon: FiUsers },
  { label: "승인 관리", path: "/dashboard/approval", icon: FiCalendar },
  { label: "일급 관리", path: "/dashboard/daily-pay", icon: FiDollarSign },
  { label: "급여 현황", path: "/dashboard/total-sales", icon: FiBarChart2 },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { userUuid, loading } = useUser();

  const handleProtectedNav = (path) => {
    if (loading) {
      toast({
        title: "로그인 정보를 확인 중입니다.",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    if (!userUuid) {
      toast({
        title: "로그인이 필요합니다.",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      navigate("/");
      return;
    }

    navigate(path);
  };

  const isActive = (item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

  return (
    <Box
      w="250px"
      bg="#111827"
      color="white"
      px={4}
      py={5}
      display="flex"
      flexDirection="column"
      borderRight="1px solid"
      borderColor="blackAlpha.300"
    >
      <Box mb={6} cursor="pointer" onClick={() => handleProtectedNav("/dashboard")}>
        <Text fontSize="xl" fontWeight="900" letterSpacing="-0.3px">
          Dashboard
        </Text>
        <Text fontSize="xs" color="gray.400" mt={1}>
          Admin workspace
        </Text>
      </Box>

      <VStack align="stretch" spacing={1}>
        {navItems.map((item) => {
          const active = isActive(item);

          return (
            <HStack
              key={item.path}
              as="button"
              type="button"
              spacing={3}
              w="100%"
              px={3}
              py={3}
              borderRadius="md"
              textAlign="left"
              position="relative"
              bg={active ? "whiteAlpha.100" : "transparent"}
              color={active ? "white" : "gray.300"}
              fontWeight={active ? "800" : "600"}
              _hover={{ bg: "whiteAlpha.100", color: "white" }}
              onClick={() => handleProtectedNav(item.path)}
            >
              {active && (
                <Box
                  position="absolute"
                  left={0}
                  top="10px"
                  bottom="10px"
                  w="3px"
                  bg="blue.400"
                  borderRightRadius="full"
                />
              )}
              <Icon as={item.icon} boxSize={4} color={active ? "blue.300" : "gray.400"} />
              <Text fontSize="sm">{item.label}</Text>
            </HStack>
          );
        })}
      </VStack>

      <Box mt="auto">
        <Divider borderColor="whiteAlpha.200" mb={4} />
        <HStack px={3} py={2} borderRadius="md" bg="whiteAlpha.50">
          <Box w="8px" h="8px" borderRadius="full" bg={userUuid ? "green.400" : "gray.500"} />
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="800">
              관리자
            </Text>
            <Text fontSize="xs" color="gray.400" noOfLines={1}>
              {userUuid ? "접속 중" : "로그인 필요"}
            </Text>
          </Box>
        </HStack>
      </Box>
    </Box>
  );
}
