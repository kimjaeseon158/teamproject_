import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { login } from "../api/google/googleAuth";
import useGoogleLinkStatus from "../api/google/useGoogleLinkStatus";
import { formatDateForInput } from "../utils/CalendarUtils";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

export default function CalendarSection({ onSelectEvent }) {
  const google = useGoogleLinkStatus();
  const events = google.events || [];

  return (
    <Box mb={4} border="1px solid #ddd" borderRadius="8px" p={4}>
      <Flex justify="space-between" align="center" mb={3}>
        {!google.loading && !google.linked && (
          <Box>
            <Button
              colorScheme="blue"
              onClick={() => {
                sessionStorage.setItem("oauthInFlight", "1");
                login();
              }}
            >
              구글 로그인하기
            </Button>

            {google.reason && (
              <Text fontSize="sm" color="gray.600" mt={1}>
                구글 연동 상태를 확인할 수 없습니다. 다시 시도해주세요.
              </Text>
            )}
          </Box>
        )}
      </Flex>

      <Flex>
        <Box flex="3" pr={4}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 400 }}
            views={["month", "week", "day"]}
            defaultView="month"
            selectable
            onSelectEvent={(event) =>
              onSelectEvent({
                ...event,
                start: formatDateForInput(event.start),
                end: formatDateForInput(event.end),
              })
            }
          />
        </Box>

        <Box flex="1" borderLeft="1px solid #ddd" pl={4} maxH={400} overflowY="auto">
          <Text fontWeight="bold">일정 목록</Text>
          {events.length ? (
            events.map((e, i) => (
              <Box key={i} mt={3}>
                <Text fontWeight="600">{e.title}</Text>
                <Text fontSize="sm">
                  {e.start.toLocaleString()} ~ {e.end.toLocaleString()}
                </Text>
              </Box>
            ))
          ) : (
            <Text mt={3}>등록된 일정이 없습니다.</Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
