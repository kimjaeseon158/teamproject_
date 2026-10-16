import { Center, HStack } from "@chakra-ui/react";

export default function OptionSegmentedControl({
  baseShift,
  onShiftChange,
}) {
  return (
    <HStack bg="whiteAlpha.100" p={1} borderRadius="xl" w="100%">
      {["주간", "야간"].map((shift) => (
        <Center
          key={shift}
          flex={1}
          py={2}
          borderRadius="lg"
          bg={baseShift === shift ? "blue.500" : "transparent"}
          color={baseShift === shift ? "white" : "gray.400"}
          fontWeight="bold"
          fontSize="sm"
          cursor="pointer"
          onClick={() => onShiftChange(shift)}
          transition="all 0.2s"
        >
          {shift}
        </Center>
      ))}
    </HStack>
  );
}
