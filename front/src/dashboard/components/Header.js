import { Flex, Box, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

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
      <Button
        colorScheme="teal"
        size="sm"
        onClick={() => navigate("/")} // 👉 로그인 페이지로 이동
      >
        Logout
      </Button>
    </Flex>
  );
}
