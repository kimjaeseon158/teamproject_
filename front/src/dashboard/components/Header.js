import { Flex, Box, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../login/js/userContext";
import { clearAccessToken } from "../../api/token";
import { Alarm } from "../../aralm";

export default function Header() {
  const navigate = useNavigate();
  const { userUuid } = useUser();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin_logout/", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_uuid: userUuid,
        }),
      });
    } catch (err) {
      console.error("logout error", err);
    } finally {
      clearAccessToken();
      navigate("/");
    }
  };

  return (
    <Flex
      as="header"
      px="4"
      h="60px"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      align="center"
      justify="space-between"
    >
      {/* 왼쪽 */}
      <Box fontWeight="bold" fontSize="lg">
        Dashboard
      </Box>

      {/* 오른쪽 */}
      <Flex align="center" gap="3">
        <Alarm />
        <Button
          colorScheme="teal"
          size="sm"
          onClick={handleLogout}
          isDisabled={!userUuid}
        >
          Logout
        </Button>
      </Flex>
    </Flex>
  );
}
