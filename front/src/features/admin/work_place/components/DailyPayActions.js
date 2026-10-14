import { Button, HStack } from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";

export default function DailyPayActions({ loading, onResetSearch }) {
  return (
    <HStack spacing={2} justify={{ base: "flex-start", md: "flex-end" }}>
        <Button
          leftIcon={<RepeatIcon />}
          variant="outline"
          size="sm"
          onClick={onResetSearch}
          isLoading={loading}
        >
          초기화
        </Button>
      </HStack>
  );
}
