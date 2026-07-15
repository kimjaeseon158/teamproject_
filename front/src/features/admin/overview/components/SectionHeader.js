import { Flex, Heading, HStack, IconButton } from "@chakra-ui/react";
import { MinusIcon } from "@chakra-ui/icons";

export default function SectionHeader({ title, action, onRemove }) {
  return (
    <Flex justify="space-between" align="center" mb={3}>
      <Heading size="sm" color="gray.800">
        {title}
      </Heading>
      <HStack spacing={1}>
        {action}
        {onRemove && (
          <IconButton
            aria-label={`${title} 숨기기`}
            icon={<MinusIcon />}
            size="xs"
            variant="ghost"
            onClick={onRemove}
          />
        )}
      </HStack>
    </Flex>
  );
}
