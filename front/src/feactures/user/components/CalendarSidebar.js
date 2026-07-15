import { Box, IconButton } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import Option from "../components/option";

export default function CalendarSidebar({
  userName,
  selectedDate,
  onClose,
}) {
  return (
    <Box
      w="100%"
      h="100%"
      bg="#1c1c1e"
      color="white"
      p="20px"
      display="flex"
      flexDirection="column"
      gap="20px"
    >
      {/* 🔥 상단 헤더 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box fontSize="20px" fontWeight="800">
          {userName}님
        </Box>

        <IconButton
          icon={<CloseIcon />}
          size="sm"
          variant="ghost"
          color="white"
          _hover={{ bg: "whiteAlpha.200" }}
          onClick={onClose}
        />
      </Box>

      {/* 🔥 날짜 상세 */}
      <Box bg="#2c2c2e" p="14px" borderRadius="12px">
        <Option selectedDate={selectedDate} />
      </Box>
    </Box>
  );
}
