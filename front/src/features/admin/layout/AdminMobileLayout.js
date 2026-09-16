import { Box, Flex } from "@chakra-ui/react";
import Header from "../components/Header";
import AdminMobileNavigation from "../components/AdminMobileNavigation";

export default function AdminMobileLayout({ children, board = false }) {
  return (
    <Flex h="100dvh" overflow="hidden" direction="column" bg="gray.50">
      <Header />
      <Box flex="1" minW={0} minH={0} overflow="auto" p={board ? 4 : 0}>
        {children}
      </Box>
      <AdminMobileNavigation />
    </Flex>
  );
}
