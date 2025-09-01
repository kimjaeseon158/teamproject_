import { Box, VStack, Link } from "@chakra-ui/react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로가 Total Sales 관련이면 하위 메뉴 열기
  const isTotalSalesActive = location.pathname.startsWith("/dashboard/total-sales");

  const activeStyle = (isActive) => ({
    fontWeight: isActive ? "bold" : "normal",
    color: isActive ? "teal" : "white",
  });

  return (
    <Box w="250px" bg="gray.800" color="white" p="4" display="flex" flexDirection="column">
      <Box
        cursor="pointer"
        fontSize="2xl"
        fontWeight="bold"
        mb="8"
        onClick={() => navigate("/dashboard")}
      >
        Dashboard
      </Box>

      <VStack align="stretch" spacing={4}>
        <Link as={NavLink} to="/dashboard" end style={({ isActive }) => activeStyle(isActive)}>
          Home
        </Link>

        <Link as={NavLink} to="/dashboard/admin" style={({ isActive }) => activeStyle(isActive)}>
          Admin Page
        </Link>

        <Link as={NavLink} to="/dashboard/approval" style={({ isActive }) => activeStyle(isActive)}>
          Approval
        </Link>

        <Link as={NavLink} to="/dashboard/daily-pay" style={({ isActive }) => activeStyle(isActive)}>
          Daily Pay
        </Link>

        {/* Total Sales */}
        <Box>
          <Box
            cursor="pointer"
            fontWeight={isTotalSalesActive ? "bold" : "normal"}
            color={isTotalSalesActive ? "teal" : "white"}
            onClick={() => navigate("/dashboard/total-sales")}
          >
            Total Sales
          </Box>

          {isTotalSalesActive && (
            <VStack pl={4} align="stretch" spacing={2} mt={2}>
              <Link
                as={NavLink}
                to="/dashboard/total-sales"
                end
                style={({ isActive }) => activeStyle(isActive)}
              >
                Total page
              </Link>
              <Link
                as={NavLink}
                to="/dashboard/total-sales/edit"
                style={({ isActive }) => activeStyle(isActive)}
              >
                Edit
              </Link>
            </VStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
}
