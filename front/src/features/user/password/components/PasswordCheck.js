import { Flex, Icon, Text } from "@chakra-ui/react";
import { FiCheck } from "react-icons/fi";

export default function PasswordCheck({ isValid, children }) {
  return (
    <Flex align="center" gap={2} color={isValid ? "green.600" : "gray.400"}>
      <Flex
        align="center"
        justify="center"
        w="18px"
        h="18px"
        borderRadius="full"
        bg={isValid ? "green.100" : "gray.200"}
        flex="0 0 auto"
      >
        <Icon as={FiCheck} boxSize={3} />
      </Flex>
      <Text fontSize="sm">{children}</Text>
    </Flex>
  );
}
