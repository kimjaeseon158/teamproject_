import { Box, Button, Flex } from "@chakra-ui/react";
import { login } from "../../api/google/googleAuth";
import CalendarView from "../../../../common/CalendarView";
import useGoogleLinkStatus from "../../api/google/useGoogleLinkStatus";
import { formatDateForInput } from "../../utils/CalendarUtils";
import "react-big-calendar/lib/css/react-big-calendar.css";

export default function CalendarSection({ onSelectEvent }) {
  const google = useGoogleLinkStatus();
  const events = google.events || [];

  return (
    <Box
      height="100%"
      display="flex"
      flexDirection="column"
      border="1px solid #ddd"
      borderRadius="8px"
      p={4}
    >
      <Flex justify="space-between" align="center" mb={3}>
        {!google.loading && !google.linked && (
          <Button
            colorScheme="blue"
            onClick={() => {
              sessionStorage.setItem("oauthInFlight", "1");
              login();
            }}
          >
            구글 로그인하기
          </Button>
        )}
      </Flex>

      <Flex flex="1" overflow="hidden">
        <Box flex="1" height="100%">
          <CalendarView
            events={events}
            onSelectEvent={(event) =>
              onSelectEvent({
                ...event,
                start: formatDateForInput(event.start),
                end: formatDateForInput(event.end),
              })
            }
          />
        </Box>
      </Flex>
    </Box>
  );
}