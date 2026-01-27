import { Flex, Box, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../login/js/userContext";

export default function Header() {
  const navigate = useNavigate();
  const { user } = useUser(); // 여기서 user.admin_id 가 "admin" 이런 값이라고 가정

  const handleLogout = async () => {
    const body = {
      admin_id: user, // 🔥 로그인한 관리자 아이디만 담기
    };


    try {
      const response = await fetch("/api/admin_logout/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      navigate("/");
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
        Welcome, {user?.admin_id || "Admin"}
      </Box>

      <Button colorScheme="teal" size="sm" onClick={handleLogout}>
        Logout
      </Button>
    </Flex>
  );
}
