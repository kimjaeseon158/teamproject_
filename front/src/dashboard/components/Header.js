import { Flex, Box, Button } from "@chakra-ui/react";

export default function Header() {
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
      <Button colorScheme="teal" size="sm">
        Logout
      </Button>
    </Flex>
  );
}
