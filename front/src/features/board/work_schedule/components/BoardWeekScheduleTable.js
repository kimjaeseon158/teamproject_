import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Button, HStack, SimpleGrid, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { getAutomaticSpecialDay } from "../../../../common/holidayCalendar";
import { getScheduleStatus } from "../../../admin/work_schedule/constants/scheduleStatus";

const PAGE_SIZE = 8;
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const dayMeta = (date) => {
  const day = new Date(`${date}T00:00:00`).getDay();
  const holiday = getAutomaticSpecialDay(date);
  return {
    day,
    label: `${DAY_LABELS[day]} ${date.slice(5).replace("-", "/")}`,
    holiday,
  };
};

function ScheduleItems({ items }) {
  if (!items.length) return <Text textAlign="center" color="gray.400">–</Text>;
  return (
    <SimpleGrid columns={items.length > 1 ? 2 : 1} spacing={1}>
      {items.map((item, index) => {
        const status = getScheduleStatus(item.status);
        const color = status.colorScheme;
        return (
          <Box key={`${item.schedule_uuid || item.status}-${index}`} minW={0} minH="54px" p={1.5} bg={`${color}.50`} borderWidth="1px" borderLeftWidth="3px" borderColor={`${color}.300`} borderRadius="md">
            <Badge colorScheme={color} fontSize="10px">{item.status_label || status.label}</Badge>
            {item.work_place && <Text mt={0.5} fontSize="xs" fontWeight="700" noOfLines={1}>{item.work_place}</Text>}
            {item.work_place_detail && <Text fontSize="10px" color="gray.600" noOfLines={1}>{item.work_place_detail}</Text>}
          </Box>
        );
      })}
    </SimpleGrid>
  );
}

export default function BoardWeekScheduleTable({ dates = [], users = [], today, loading = false }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const visibleUsers = useMemo(
    () => users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, users]
  );

  useEffect(() => setPage(1), [users]);
  useEffect(() => setPage((current) => Math.min(current, totalPages)), [totalPages]);

  return (
    <Box flex="1" minH={0} display="flex" flexDirection="column" position="relative" aria-busy={loading} bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" overflow="hidden">
      <Box flex="1" minH={0} overflow="auto">
        <Table size="sm" minW="880px" h={visibleUsers.length === PAGE_SIZE ? "100%" : undefined} sx={{ tableLayout: "fixed" }}>
          <Thead position="sticky" top={0} zIndex={3} bg="gray.50" h="60px">
            <Tr>
              <Th w="120px" h="60px" px={3} py={4} position="sticky" left={0} zIndex={4} bg="gray.50" boxShadow="2px 0 0 #E2E8F0">직원</Th>
              {dates.map((date) => {
                const meta = dayMeta(date);
                const selected = date === today;
                return (
                  <Th
                    key={date}
                    textAlign="center"
                    scope="col"
                    h="60px"
                    py={4}
                    px={2}
                    bg={selected ? "gray.700" : undefined}
                    color={selected ? "white" : meta.holiday.isHoliday || meta.day === 0 ? "red.500" : meta.day === 6 ? "blue.500" : "gray.700"}
                    borderLeftWidth={selected ? "1px" : undefined}
                    borderRightWidth={selected ? "1px" : undefined}
                    borderColor={selected ? "gray.500" : undefined}
                    title={meta.holiday.name || undefined}
                    aria-label={`${meta.label}${meta.holiday.isHoliday ? `, ${meta.holiday.name || "공휴일"}` : ""}${selected ? ", 오늘" : ""}`}
                  >
                    <HStack spacing={1.5} justify="center" flexWrap="wrap">
                      <Text as="span" fontSize="xs" fontWeight={selected ? "800" : "700"}>{meta.label}</Text>
                      {selected && <Badge bg="whiteAlpha.300" color="white" borderRadius="full" px={1.5} fontSize="9px">오늘</Badge>}
                    </HStack>
                  </Th>
                );
              })}
            </Tr>
          </Thead>
          <Tbody>
            {visibleUsers.map((user, index) => (
              <Tr key={user.user_uuid || `${user.user_name}-${index}`} _hover={{ bg: "gray.50" }}>
                <Td h="max(68px, calc((100dvh - 350px) / 8))" px={3} py={3} fontWeight="900" position="sticky" left={0} zIndex={2} bg="white" boxShadow="2px 0 0 #E2E8F0">{user.user_name}</Td>
                {dates.map((date) => {
                  return (
                    <Td
                      key={date}
                      h="max(68px, calc((100dvh - 350px) / 8))"
                      px={2}
                      py={2}
                    >
                      <ScheduleItems items={user.days?.[date] || []} />
                    </Td>
                  );
                })}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {loading && <Box position="absolute" inset={0} zIndex={2} bg="whiteAlpha.800" display="flex" alignItems="center" justifyContent="center" role="status"><Spinner mr={3} color="blue.500" /><Text>근무표를 불러오는 중입니다.</Text></Box>}
      {!visibleUsers.length && <Text py={16} textAlign="center" color="gray.500">조회된 근무 일정이 없습니다.</Text>}

      <HStack flexShrink={0} position="relative" minH="52px" justify="center" borderTopWidth="1px" borderColor="gray.100">
        <Text position="absolute" left={5} fontSize="sm" color="gray.500">
          {users.length ? `${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, users.length)}` : "0"} / {users.length}명
        </Text>
        <Button size="sm" variant="ghost" isDisabled={page === 1} onClick={() => setPage((current) => current - 1)}>이전</Button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
          <Button key={number} size="sm" minW="34px" px={2} colorScheme="blue" variant={number === page ? "solid" : "ghost"} onClick={() => setPage(number)}>{number}</Button>
        ))}
        <Button size="sm" variant="ghost" isDisabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>다음</Button>
      </HStack>
    </Box>
  );
}
