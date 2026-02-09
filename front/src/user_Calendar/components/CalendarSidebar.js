import { Box } from "@chakra-ui/react";
import Option from "../components/option";

export default function CalendarSidebar({ userName, selectedDate }) {
  return (
    <Box
      width="350px"
      bg="#1c1c1e"
      color="white"
      p="20px"
      display="flex"
      flexDirection="column"
      gap="20px"
    >
      <Box fontSize="24px" fontWeight="800">
        {userName}님
      </Box>

      <Box bg="#2c2c2e" p="14px" borderRadius="10px">
        <Option selectedDate={selectedDate} />
      </Box>
    </Box>
  );
}
