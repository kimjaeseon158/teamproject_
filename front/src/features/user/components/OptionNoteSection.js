import { HStack, Text, Textarea, VStack } from "@chakra-ui/react";

export default function OptionNoteSection({ note, onChange, isMobile = false }) {
  return (
    <VStack align="stretch" spacing={2}>
      <HStack justify="space-between" px={1}>
        <Text
          fontSize={isMobile ? "sm" : "xs"}
          fontWeight="bold"
          color={isMobile ? "white" : "gray.500"}
        >
          비고
        </Text>
        <Text fontSize="xs" color="gray.500">
          선택 사항 · {note.length}/200
        </Text>
      </HStack>
      <Textarea
        value={note}
        onChange={(event) => onChange(event.target.value.slice(0, 200))}
        placeholder="준비물, 집결 시간 등 전달 사항"
        minH="88px"
        resize="none"
        bg="whiteAlpha.100"
        borderColor="whiteAlpha.100"
        borderRadius="16px"
        color="white"
        _placeholder={{ color: "gray.500" }}
        _hover={{ borderColor: "whiteAlpha.200" }}
        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #63b3ed" }}
      />
    </VStack>
  );
}
