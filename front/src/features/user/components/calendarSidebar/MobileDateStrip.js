import { Box, HStack, Text, VStack } from "@chakra-ui/react";

import { weekDays } from "../../utils/calendarSidebarUtils";

export default function MobileDateStrip({
  days,
  events,
  onDateChange,
  scrollRef,
  selectedDate,
}) {
  return (
    <Box
      ref={scrollRef}
      overflowX="auto"
      whiteSpace="nowrap"
      py={4}
      css={{
        "&::-webkit-scrollbar": { display: "none" },
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      <HStack spacing={4} px="24px">
        {days.map((date) => {
          const dayNum = date.getDate();
          const weekDay = weekDays[date.getDay()];
          const dateStr = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const isSelected = selectedDate.formatted === dateStr;
          const hasData = events.some((event) => event.start === dateStr);

          return (
            <VStack
              key={dateStr}
              spacing={1}
              minW="62px"
              py={isSelected ? "14px" : "12px"}
              borderRadius="24px"
              bg={
                isSelected
                  ? "linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)"
                  : "whiteAlpha.50"
              }
              boxShadow={
                isSelected ? "0 8px 20px -4px rgba(49, 130, 206, 0.6)" : "none"
              }
              color={isSelected ? "white" : "gray.400"}
              cursor="pointer"
              className={isSelected ? "selected-date-item" : ""}
              onClick={() => onDateChange?.(dateStr)}
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              border="1px solid"
              borderColor={isSelected ? "blue.400" : "whiteAlpha.100"}
              transform={isSelected ? "scale(1.05)" : "scale(1)"}
            >
              <Text fontSize="11px" fontWeight="700" opacity={isSelected ? 1 : 0.7}>
                {weekDay}
              </Text>
              <Text fontSize="18px" fontWeight="800" mt="-2px">
                {dayNum}
              </Text>
              {hasData && !isSelected && (
                <Box w="4px" h="4px" bg="blue.400" borderRadius="full" mt={1} />
              )}
              {isSelected && (
                <Box w="4px" h="4px" bg="white" borderRadius="full" mt={1} />
              )}
            </VStack>
          );
        })}
      </HStack>
    </Box>
  );
}
