import { Box, Flex } from "@chakra-ui/react";
import Header from "../components/Header";
import Sidebar from "../components/sideBar";

export default function AdminDesktopLayout({ children, board = false }) {
  return (
    <Flex h="100dvh" overflow="hidden">
      <Box flexShrink={0}><Sidebar /></Box>
      <Flex direction="column" flex="1" minW={0}>
        <Header />
        <Box p={board ? 6 : 4} flex="1" bg="gray.50" overflow="auto" minW={0} minH={0}>{children}</Box>
      </Flex>
    </Flex>
  );
}
