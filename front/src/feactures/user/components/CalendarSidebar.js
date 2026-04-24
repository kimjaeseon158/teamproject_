import { Box, IconButton, HStack, Text, VStack, useBreakpointValue, Badge, Divider, Button } from "@chakra-ui/react";
import { CloseIcon, TimeIcon, InfoIcon } from "@chakra-ui/icons";
import { useEffect, useRef } from "react";
import Option from "../components/option";

export default function CalendarSidebar({
  userName,
  selectedDate,
  onClose,
  onRefresh,
  onDateChange,
  events = [],
}) {
  const scrollRef = useRef(null);
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // 현재 선택된 날짜에 이미 등록된 이벤트가 있는지 확인
  const existingEvent = events.find(e => e.start === selectedDate.formatted);

  useEffect(() => {
    if (isMobile && scrollRef.current) {
      const selectedItem = scrollRef.current.querySelector(".selected-date-item");
      if (selectedItem) {
        selectedItem.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [selectedDate, isMobile]);

  const getDaysInMonth = (year, month) => {
    const date = new Date(year, month - 1, 1);
    const days = [];
    while (date.getMonth() === month - 1) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = getDaysInMonth(selectedDate.year, selectedDate.month);
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  // 🔥 기록 상세 뷰 컴포넌트
  const DetailView = ({ event }) => {
    const data = event.extendedProps;
    const statusText = data.is_approved === true ? "승인 완료" : data.is_approved === false ? "반려됨" : "승인 대기중";
    const statusColor = data.is_approved === true ? "green" : data.is_approved === false ? "red" : "orange";

    return (
      <VStack align="stretch" spacing={5} py={2} color="white">
        <HStack justify="space-between" align="center">
          <Badge colorScheme={statusColor} p="2px 12px" borderRadius="full" fontSize="xs">
            {statusText}
          </Badge>
          <Text fontSize="sm" color="gray.400" fontWeight="600">{data.work_shift}</Text>
        </HStack>

        <Box>
          <Text fontSize="xs" color="gray.500" fontWeight="700" mb={1} textTransform="uppercase">근무지 정보</Text>
          <Text fontSize="2xl" fontWeight="900" letterSpacing="-0.5px">{data.work_place}</Text>
        </Box>

        <Divider borderColor="whiteAlpha.200" />

        <HStack spacing={10}>
          <Box flex={1}>
            <Text fontSize="xs" color="gray.500" fontWeight="700" mb={1} textTransform="uppercase">일급 합계</Text>
            <Text fontSize="2xl" fontWeight="900" color="blue.300">{data.amount?.toLocaleString()}원</Text>
          </Box>
        </HStack>

        {data.is_approved === false && data.rejection_reason && (
          <Box bg="red.900" bgOpacity="0.2" p={4} borderRadius="24px" border="1px solid" borderColor="red.900">
            <HStack mb={1}>
              <InfoIcon w={3} h={3} color="red.300" />
              <Text fontSize="xs" fontWeight="800" color="red.300">반려 사유</Text>
            </HStack>
            <Text fontSize="sm" color="gray.200">{data.rejection_reason}</Text>
          </Box>
        )}
      </VStack>
    );
  };

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
      
          <Text fontSize="xl" fontWeight="800" letterSpacing="-0.5px">
            {userName}님
          </Text>
        </VStack>
        <IconButton
          icon={<CloseIcon w={3} h={3} />}
          size="md"
          variant="ghost"
          bg="whiteAlpha.100"
          borderRadius="full"
          color="white"
          onClick={onClose}
        />
      </HStack>

      {isMobile && (
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
            {days.map((d, i) => {
              const dayNum = d.getDate();
              const weekDay = weekDays[d.getDay()];
              const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const isSelected = selectedDate.formatted === dateStr;
              const hasData = events.some(e => e.start === dateStr);

              return (
                <VStack
                  key={i}
                  spacing={1}
                  minW="62px"
                  py={isSelected ? "14px" : "12px"}
                  borderRadius="24px"
                  bg={isSelected ? "linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%)" : "whiteAlpha.50"}
                  boxShadow={isSelected ? "0 8px 20px -4px rgba(49, 130, 206, 0.6)" : "none"}
                  color={isSelected ? "white" : "gray.400"}
                  cursor="pointer"
                  className={isSelected ? "selected-date-item" : ""}
                  onClick={() => onDateChange?.(dateStr)}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  border="1px solid"
                  borderColor={isSelected ? "blue.400" : "whiteAlpha.100"}
                  transform={isSelected ? "scale(1.05)" : "scale(1)"}
                >
                  <Text fontSize="11px" fontWeight="700" opacity={isSelected ? 1 : 0.7}>{weekDay}</Text>
                  <Text fontSize="18px" fontWeight="800" mt="-2px">{dayNum}</Text>
                  {hasData && !isSelected && <Box w="4px" h="4px" bg="blue.400" borderRadius="full" mt={1} />}
                  {isSelected && <Box w="4px" h="4px" bg="white" borderRadius="full" mt={1} />}
                </VStack>
              );
            })}
          </HStack>
        </Box>
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
            <DetailView event={existingEvent} />
          ) : (
            <Option selectedDate={selectedDate} onRefresh={onRefresh} onClose={onClose} />
          )}
        </Box>
      </Box>
    </Box>
  );
}
