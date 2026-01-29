// src/dashboard/components/Sidebar.jsx
import { Box, VStack, Link, useToast } from "@chakra-ui/react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../login/js/userContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // 🔑 인증 기준: userUuid
  const { userUuid, loading } = useUser();

  // Total Sales 하위 메뉴 열림 여부
  const isTotalSalesActive = location.pathname.startsWith(
    "/dashboard/total-sales"
  );

  const activeStyle = (isActive) => ({
    fontWeight: isActive ? "bold" : "normal",
    color: isActive ? "teal" : "white",
  });

  // ✅ 보호된 이동 처리 (최종 정답)
  const handleProtectedNav = (path) => {
    // 1️⃣ 아직 부트스트랩 중
    if (loading) {
      toast({
        title: "로그인 정보 확인 중입니다.",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    // 2️⃣ 인증 안 됨
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

    // 3️⃣ 통과
    navigate(path);
  };

  return (
    <Box
      w="250px"
      bg="gray.800"
      color="white"
      p="4"
      display="flex"
      flexDirection="column"
    >
      {/* 로고 */}
      <Box
        cursor="pointer"
        fontSize="2xl"
        fontWeight="bold"
        mb="8"
        onClick={() => handleProtectedNav("/dashboard")}
      >
        Dashboard
      </Box>

      <VStack align="stretch" spacing={4}>
        {/* Home */}
        <Link
          as={NavLink}
          to="/dashboard"
          end
          onClick={(e) => {
            e.preventDefault();
            handleProtectedNav("/dashboard");
          }}
          style={({ isActive }) => activeStyle(isActive)}
        >
          Home
        </Link>

        {/* Admin Page */}
        <Link
          as={NavLink}
          to="/dashboard/admin"
          onClick={(e) => {
            e.preventDefault();
            handleProtectedNav("/dashboard/admin");
          }}
          style={({ isActive }) => activeStyle(isActive)}
        >
          Admin Page
        </Link>

        {/* Approval */}
        <Link
          as={NavLink}
          to="/dashboard/approval"
          onClick={(e) => {
            e.preventDefault();
            handleProtectedNav("/dashboard/approval");
          }}
          style={({ isActive }) => activeStyle(isActive)}
        >
          Approval
        </Link>

        {/* Daily Pay */}
        <Link
          as={NavLink}
          to="/dashboard/daily-pay"
          onClick={(e) => {
            e.preventDefault();
            handleProtectedNav("/dashboard/daily-pay");
          }}
          style={({ isActive }) => activeStyle(isActive)}
        >
          Daily Pay
        </Link>

        {/* Total Sales */}
        <Box>
          <Box
            cursor="pointer"
            fontWeight={isTotalSalesActive ? "bold" : "normal"}
            color={isTotalSalesActive ? "teal" : "white"}
            onClick={() => handleProtectedNav("/dashboard/total-sales")}
          >
            Total Sales
          </Box>

          {isTotalSalesActive && (
            <VStack pl={4} align="stretch" spacing={2} mt={2}>
              <Link
                as={NavLink}
                to="/dashboard/total-sales"
                end
                onClick={(e) => {
                  e.preventDefault();
                  handleProtectedNav("/dashboard/total-sales");
                }}
                style={({ isActive }) => activeStyle(isActive)}
              >
                Total page
              </Link>

              <Link
                as={NavLink}
                to="/dashboard/total-sales/company"
                onClick={(e) => {
                  e.preventDefault();
                  handleProtectedNav("/dashboard/total-sales/company");
                }}
                style={({ isActive }) => activeStyle(isActive)}
              >
                total_company
              </Link>

              <Link
                as={NavLink}
                to="/dashboard/total-sales/expense"
                onClick={(e) => {
                  e.preventDefault();
                  handleProtectedNav("/dashboard/total-sales/expense");
                }}
                style={({ isActive }) => activeStyle(isActive)}
              >
                total_expense
              </Link>
            </VStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
