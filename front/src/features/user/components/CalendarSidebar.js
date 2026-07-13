import { Box, HStack, IconButton, Text, VStack, useBreakpointValue } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useEffect, useRef } from "react";

import DesktopWorkSummary from "./calendarSidebar/DesktopWorkSummary";
import MobileDateStrip from "./calendarSidebar/MobileDateStrip";
import Option from "./option";
import WorkDetailView from "./calendarSidebar/WorkDetailView";
import { getDaysInMonth } from "../utils/calendarSidebarUtils";

export default function CalendarSidebar({
  userName,
  selectedDate,
  onClose,
  onRefresh,
  onDateChange,
  events = [],
  isMobileLayout,
}) {
  const scrollRef = useRef(null);
  const responsiveIsMobile = useBreakpointValue({ base: true, lg: false });
  const isMobile = isMobileLayout ?? responsiveIsMobile;
  const existingEvent = events.find((event) => event.start === selectedDate.formatted);
  const days = getDaysInMonth(selectedDate.year, selectedDate.month);

  useEffect(() => {
    if (isMobile && scrollRef.current) {
      const selectedItem = scrollRef.current.querySelector(".selected-date-item");
      selectedItem?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedDate, isMobile]);

  return (
    <Box
      w="100%"
      h="100%"
      bg="#1c1c1e"
      color="white"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <HStack px="24px" pt="16px" pb="12px" justify="space-between" align="center">
        <VStack align="start" spacing={0}>
          <Text fontSize="xl" fontWeight="800" letterSpacing="0">
            {userName}님
          </Text>
        </VStack>
        {isMobile && (
          <IconButton
            aria-label="닫기"
            icon={<CloseIcon w={3} h={3} />}
            size="md"
            variant="ghost"
            bg="whiteAlpha.100"
            borderRadius="full"
            color="white"
            onClick={onClose}
          />
        )}
      </HStack>

      {isMobile && (
        <MobileDateStrip
          days={days}
          events={events}
          onDateChange={onDateChange}
          scrollRef={scrollRef}
          selectedDate={selectedDate}
        />
      )}

      <Box
        flex="1"
        overflowY="auto"
        px="20px"
        pb="20px"
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
      >
        <Box
          bg="whiteAlpha.50"
          p="24px"
          borderRadius="32px"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          {existingEvent ? (
            isMobile ? (
              <WorkDetailView
                event={existingEvent}
                isMobile={isMobile}
                onClose={onClose}
                onRefresh={onRefresh}
                selectedDate={selectedDate}
              />
            ) : (
              <>
                <Option
                  selectedDate={selectedDate}
                  onRefresh={onRefresh}
                  onClose={onClose}
                  isMobile={isMobile}
                />
                <DesktopWorkSummary event={existingEvent} />
              </>
            )
          ) : (
            <Option
              selectedDate={selectedDate}
              onRefresh={onRefresh}
              onClose={onClose}
              isMobile={isMobile}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
