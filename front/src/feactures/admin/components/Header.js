import { Flex, Box, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../auth/userContext";
import { getAccessToken, clearAccessToken } from "../../../services/api/token";
import { Alarm } from "../../alarm";

export default function Header() {
  const navigate = useNavigate();
  const { userUuid, logout } = useUser();

  const handleLogout = async () => {
    const token = getAccessToken();
    try {
      await fetch("/api/admin-logout/", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_uuid: userUuid }),
      });
    } catch (err) {
      console.error("error");
    } finally {
      // ?”¥ ?´ë¼?´ì–¸???íƒœ ?•ë¦¬ (?„ì—­ ?íƒœ ë°?? í°)
      logout();
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
      {/* ?¼ìª½ */}
      <Box fontWeight="bold" fontSize="lg">
        Dashboard
      </Box>

      {/* ?¤ë¥¸ìª?*/}
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
  