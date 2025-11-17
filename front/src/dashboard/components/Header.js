import { Flex, Box, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin_logout/', {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logout: true }), // 👉 JSON 형태로 요청
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      navigate("/"); // 👉 로그아웃 후 로그인 페이지로 이동
    } catch (error) {
      console.error(error);
      alert("Logout error");
    }
  };

  return (
    <Flex
      as="header"
      p="4"
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      justify="space-between"
      align="center"
    >
      <Box fontWeight="bold" fontSize="lg">
        Welcome, Admin
      </Box>
      <Button colorScheme="teal" size="sm" onClick={handleLogout}>
        Logout
      </Button>
    </Flex>
  );
}
