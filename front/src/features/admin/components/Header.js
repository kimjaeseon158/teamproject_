import { Flex, Box, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../auth/userContext";
import { Alarm } from "../../alarm";
import { fetchWithAuth } from "../../../services/api/fetchWithAuth";

export default function Header() {
  const navigate = useNavigate();
  const { userUuid, logout } = useUser();

  const handleLogout = async () => {
    try {
      await fetchWithAuth("/api/admin-logout/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_uuid: userUuid }),
      });
    } catch (err) {
      console.error("logout error", err);
    } finally {
      logout({ skipRefresh: true });
      navigate("/", { replace: true });
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
      <Box fontWeight="bold" fontSize="lg">
        Dashboard
      </Box>

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
