import { AddIcon } from "@chakra-ui/icons";
import { Button, HStack, Text } from "@chakra-ui/react";

export default function WidgetRestoreBar({ hiddenWidgets, onShow }) {
  if (hiddenWidgets.length === 0) return null;

  return (
    <HStack spacing={2} wrap="wrap">
      <Text fontSize="xs" color="gray.500" fontWeight="800">
        숨긴 영역
      </Text>
      {hiddenWidgets.map(([key, label]) => (
        <Button
          key={key}
          leftIcon={<AddIcon />}
          size="xs"
          variant="outline"
          colorScheme="blue"
          onClick={() => onShow(key)}
        >
          {label}
        </Button>
      ))}
    </HStack>
  );
}
