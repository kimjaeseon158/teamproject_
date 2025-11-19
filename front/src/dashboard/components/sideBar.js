import { Box, VStack, Link, useToast } from "@chakra-ui/react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
// ✅ 경로는 프로젝트 구조에 맞게 조정 (지금 기준: src/dashboard/components/Sidebar.jsx)
import { useUser } from "../../login/js/userContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user, loading } = useUser(); // ✅ 로그인/인증 상태

  // 현재 경로가 Total Sales 관련이면 하위 메뉴 열기
  const isTotalSalesActive = location.pathname.startsWith("/dashboard/total-sales");

  const activeStyle = (isActive) => ({
    fontWeight: isActive ? "bold" : "normal",
    color: isActive ? "teal" : "white",
  });

  // ✅ 보호된 페이지 이동 공통 처리 함수
  const handleProtectedNav = (path) => {
    // 아직 인증 확인 중이거나, user 정보가 없으면 막기
    if (loading || !user) {
      toast({
        title: "로그인 정보 확인 중입니다.",
        description: "잠시 후 다시 시도해주세요.",
        status: "info",
        duration: 2500,
        isClosable: true,
      });
      return;
    }
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
      {/* 로고/타이틀 클릭 → 대시보드 이동도 보호 */}
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
            e.preventDefault();               // NavLink 기본 이동 막고
            handleProtectedNav("/dashboard"); // 우리가 직접 처리
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

        {/* Total Sales 그룹 */}
        <Box>
          {/* 상위 Total Sales 제목 클릭 */}
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
