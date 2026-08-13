import { Flex, Text } from "@chakra-ui/react";

import { formatWon } from "../utils/totalPayFormat";

export default function PayDetailRow({ item }) {
  return (
    <Flex
      justify="space-between"
      align="center"
      py={3}
      borderBottom="1px solid"
      borderColor="gray.100"
    >
      <Text fontWeight="700" color="gray.700">
        {item.name}
      </Text>
      <Text fontWeight="900">{formatWon(item.amount)}</Text>
    </Flex>
  );
}
