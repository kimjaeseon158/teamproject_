import { Box, VStack, Link } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <Box w="250px" bg="gray.800" color="white" p="4" display="flex" flexDirection="column">
      <Box fontSize="2xl" fontWeight="bold" mb="8">Dashboard</Box>
      <VStack align="stretch" spacing={4}>
        <Link as={NavLink} to="/dashboard" _hover={{ color: "teal.300" }} end>
          Home
        </Link>
        <Link as={NavLink} to="/dashboard/admin" _hover={{ color: "teal.300" }}>
          Admin Page
        </Link>
        <Link as={NavLink} to="/dashboard/approval" _hover={{ color: "teal.300" }}>
          Approval
        </Link>
        <Link as={NavLink} to="/dashboard/daily-pay" _hover={{ color: "teal.300" }}>
          Daily Pay
        </Link>
        <Link as={NavLink} to="/dashboard/total-sales" _hover={{ color: "teal.300" }}>
          Total Sales
        </Link>
      </VStack>
    </Box>
  );
}
