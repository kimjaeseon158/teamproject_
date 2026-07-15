import { Box } from "@chakra-ui/react";

import usePasswordChangeForm from "../../features/user/password/hook/usePasswordChangeForm";
import PasswordChangeModal from "../../features/user/password/section/PasswordChangeModal";
import CalendarPage from "./CalendarPage";

export default function PasswordChangePage() {
  const form = usePasswordChangeForm();

  return (
    <Box minH="100vh" position="relative">
      <Box
        filter="blur(2px)"
        pointerEvents="none"
        userSelect="none"
        maxH="100vh"
        overflow="hidden"
      >
        <CalendarPage />
      </Box>

      <PasswordChangeModal form={form} />
    </Box>
  );
}
