import { Flex, Icon, Text } from "@chakra-ui/react";
import { FiAlertCircle } from "react-icons/fi";

export default function InputWarning({ children }) {
  return (
    <Flex align="center" gap={2} color="orange.600">
      <Icon as={FiAlertCircle} boxSize={4} />
      <Text fontSize="sm" fontWeight="semibold">
        {children}
      </Text>
    </Flex>
  );
}
