import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Button, HStack, SimpleGrid, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";

const PAGE_SIZE = 8;
const STATUS_COLORS = { DAY: "green", NIGHT: "blue", OFF: "gray", TRAINING: "orange" };
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const dayMeta = (date, today) => {
  const day = new Date(`${date}T00:00:00`).getDay();
  return {
    day,
    label: `${date === today ? "오늘 · " : ""}${DAY_LABELS[day]} ${date.slice(5).replace("-", "/")}`,
  };
};

function ScheduleItems({ items }) {
  if (!items.length) return <Text textAlign="center" color="gray.300">-</Text>;
  return (
    <SimpleGrid columns={items.length > 1 ? 2 : 1} spacing={1}>
      {items.map((item, index) => {
        const color = STATUS_COLORS[item.status] || "gray";
        return (
          <Box key={`${item.schedule_uuid || item.status}-${index}`} p={2} bg={`${color}.50`} borderLeftWidth="3px" borderColor={`${color}.300`} borderRadius="md">
            <Badge colorScheme={color} fontSize="9px">{item.status_label || item.status}</Badge>
            {item.work_place && <Text mt={1} fontSize="xs" fontWeight="800" noOfLines={1}>{item.work_place}</Text>}
            {item.work_place_detail && <Text fontSize="10px" color="gray.600" noOfLines={1}>{item.work_place_detail}</Text>}
          </Box>
        );
      })}
    </SimpleGrid>
  );
}

export default function BoardWeekScheduleTable({ dates = [], users = [], today, selectedDate = today, loading = false }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const visibleUsers = useMemo(
    () => users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, users]
  );

  useEffect(() => setPage(1), [users]);
  useEffect(() => setPage((current) => Math.min(current, totalPages)), [totalPages]);

  return (
    <Box flex="1" minH={0} display="flex" flexDirection="column" position="relative" aria-busy={loading} bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="lg" overflow="hidden">
      <Box flex="1" minH={0} overflow="auto">
        <Table size="sm" minW="880px" h={visibleUsers.length === PAGE_SIZE ? "100%" : undefined} sx={{ tableLayout: "fixed" }}>
          <Thead position="sticky" top={0} zIndex={1} bg="gray.100">
            <Tr>
              <Th w="120px">직원</Th>
              {dates.map((date) => {
                const meta = dayMeta(date, today);
                const selected = date === selectedDate;
                return (
                  <Th
                    key={date}
                    textAlign="center"
                    scope="col"
                    py={3}
                    px={1}
                    bg={selected ? "blue.600" : undefined}
                    color={selected ? "white" : meta.day === 0 ? "red.500" : meta.day === 6 ? "blue.500" : "gray.700"}
                    borderBottomColor={selected ? "blue.600" : "gray.200"}
                    aria-label={`${meta.label}${selected ? ", 선택한 날짜" : ""}`}
                  >
                    <HStack spacing={1.5} justify="center" flexWrap="wrap">
                      <Text as="span" fontSize="xs" fontWeight={selected ? "800" : "700"}>{meta.label}</Text>
                      {selected && <Badge bg="whiteAlpha.300" color="white" borderRadius="full" px={1.5} fontSize="9px">선택</Badge>}
                    </HStack>
                  </Th>
                );
              })}
            </Tr>
          </Thead>
          <Tbody>
            {visibleUsers.map((user, index) => (
              <Tr key={user.user_uuid || `${user.user_name}-${index}`}>
                <Td fontWeight="900">{user.user_name}</Td>
                {dates.map((date) => {
                  const selected = date === selectedDate;
                  return (
                    <Td
                      key={date}
                      h="64px"
                      p={1.5}
                      bg={selected ? "blue.50" : "white"}
                      boxShadow={selected ? "inset 1px 0 0 var(--chakra-colors-blue-100), inset -1px 0 0 var(--chakra-colors-blue-100)" : undefined}
                      borderBottomColor={selected ? "blue.100" : "gray.100"}
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
