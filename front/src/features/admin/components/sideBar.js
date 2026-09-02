import {
  Box,
  Divider,
  Collapse,
  HStack,
  Icon,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiCalendar,
  FiChevronDown,
  FiDollarSign,
  FiHome,
  FiMessageSquare,
  FiTrendingDown,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { useUser } from "../../auth/userContext";

const navItems = [
  { label: "홈", path: "/dashboard", icon: FiHome, exact: true },
  { label: "직원 관리", path: "/dashboard/admin", icon: FiUsers },
  { label: "승인 관리", path: "/dashboard/approval", icon: FiCalendar },
  { label: "일급 관리", path: "/dashboard/daily-pay", icon: FiDollarSign },
  { label: "근무표 관리", path: "/dashboard/work-schedules", icon: FiCalendar },
  { label: "공지사항", path: "/note", icon: FiMessageSquare },
];

const totalMenuItems = [
  { label: "수입", path: "/dashboard/total-sales/company", icon: FiTrendingUp },
  { label: "지출", path: "/dashboard/total-sales/expense", icon: FiTrendingDown },
  { label: "급여", path: "/dashboard/total-sales/salary", icon: FiDollarSign },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { userUuid, loading } = useUser();
  const isTotalPath = location.pathname.startsWith("/dashboard/total-sales");
  const [isTotalOpen, setIsTotalOpen] = useState(isTotalPath);

  useEffect(() => {
    if (isTotalPath) setIsTotalOpen(true);
  }, [isTotalPath]);

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

        <Box>
          <HStack
            as="button"
            type="button"
            spacing={3}
            w="100%"
            px={3}
            py={3}
            borderRadius="md"
            textAlign="left"
            bg={isTotalPath ? "whiteAlpha.100" : "transparent"}
            color={isTotalPath ? "white" : "gray.300"}
            fontWeight={isTotalPath ? "800" : "600"}
            _hover={{ bg: "whiteAlpha.100", color: "white" }}
            onClick={() => {
              setIsTotalOpen(true);
              handleProtectedNav("/dashboard/total-sales");
            }}
            aria-expanded={isTotalOpen}
          >
            <Icon as={FiBarChart2} boxSize={4} color={isTotalPath ? "blue.300" : "gray.400"} />
            <Text fontSize="sm" flex="1">
              총 매출 관리
            </Text>
            <Box
              as="span"
              role="button"
              aria-label={isTotalOpen ? "통합 메뉴 접기" : "통합 메뉴 펼치기"}
              p={1}
              m={-1}
              onClick={(event) => {
                event.stopPropagation();
                setIsTotalOpen((open) => !open);
              }}
            >
              <Icon
                as={FiChevronDown}
                boxSize={4}
                color="gray.400"
                transform={isTotalOpen ? "rotate(180deg)" : "rotate(0deg)"}
                transition="transform 0.2s ease"
              />
            </Box>
          </HStack>

          <Collapse in={isTotalOpen} animateOpacity>
            <VStack align="stretch" spacing={1} mt={1} pl={6}>
              {totalMenuItems.map((item) => {
                const active = isActive(item);

                return (
                  <HStack
                    key={item.path}
                    as="button"
                    type="button"
                    spacing={3}
                    w="100%"
                    px={3}
                    py={2.5}
                    borderRadius="md"
                    textAlign="left"
                    bg={active ? "whiteAlpha.100" : "transparent"}
                    color={active ? "white" : "gray.400"}
                    fontWeight={active ? "800" : "600"}
                    _hover={{ bg: "whiteAlpha.100", color: "white" }}
                    onClick={() => handleProtectedNav(item.path)}
                  >
                    <Icon as={item.icon} boxSize={3.5} color={active ? "blue.300" : "gray.500"} />
                    <Text fontSize="sm">{item.label}</Text>
                  </HStack>
                );
              })}
            </VStack>
          </Collapse>
        </Box>
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
