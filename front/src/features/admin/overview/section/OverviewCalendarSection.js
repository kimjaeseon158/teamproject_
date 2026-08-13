import { Box, HStack, IconButton, Spinner, Text } from "@chakra-ui/react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";

import CalendarView from "../../../../common/CalendarView";
import DashboardCard from "../components/DashboardCard";
import SectionHeader from "../components/SectionHeader";

export default function OverviewCalendarSection({
  currentDate,
  events,
  loading,
  onMoveMonth,
  onNavigateApproval,
  onRemove,
}) {
  return (
    <DashboardCard p={3} display="flex" flexDirection="column" overflow="hidden">
      <SectionHeader
        title="월간 승인 캘린더"
        onRemove={onRemove}
        action={
          <HStack spacing={1}>
            <IconButton
              aria-label="이전 달"
              icon={<ArrowBackIcon />}
              size="xs"
              variant="ghost"
              onClick={() => onMoveMonth(-1)}
            />
            <Text fontWeight="800" minW="86px" textAlign="center" fontSize="sm">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </Text>
            <IconButton
              aria-label="다음 달"
              icon={<ArrowForwardIcon />}
              size="xs"
              variant="ghost"
              onClick={() => onMoveMonth(1)}
            />
          </HStack>
        }
      />

      {loading && <Spinner size="sm" mb={2} />}
      <Box
        flex="1"
        minH={0}
        overflow="hidden"
        sx={{
          ".fc": { height: "100%", fontSize: "12px" },
          ".fc-view-harness": { height: "100% !important" },
          ".fc-scroller": { overflow: "hidden !important" },
          ".fc-daygrid-body": { width: "100% !important" },
          ".fc-daygrid-day-frame": { minHeight: "0", height: "100%" },
          ".fc-daygrid-day-top": { lineHeight: 1, minHeight: "18px" },
          ".fc-daygrid-day-number": { padding: "2px 4px", fontSize: "11px" },
          ".fc-daygrid-day-events": { minHeight: "16px", marginTop: "0" },
          ".fc-daygrid-event": { marginTop: "1px" },
          ".fc-event-main": { minHeight: "0" },
        }}
      >
        <CalendarView
          events={events}
          selectedDate={currentDate}
          isMobile={false}
          height="100%"
          onEventClick={onNavigateApproval}
          renderEventContent={(arg) => {
            const data = arg.event.extendedProps;
            return (
              <Box
                px={2}
                py="1px"
                bg="orange.100"
                color="orange.800"
                borderRadius="md"
                fontSize="11px"
                fontWeight="800"
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
              >
                {[data.user_name, data.work_shift || "근무"].filter(Boolean).join(" - ")}
              </Box>
            );
          }}
        />
      </Box>
    </DashboardCard>
  );
}
