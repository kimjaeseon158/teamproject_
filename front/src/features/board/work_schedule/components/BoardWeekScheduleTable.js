import { useEffect, useMemo, useState } from "react";
import { Badge, Box, Button, HStack, SimpleGrid, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";

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

export default function BoardWeekScheduleTable({ dates = [], users = [], today }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const visibleUsers = useMemo(
    () => users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, users]
  );

  useEffect(() => setPage(1), [users]);
  useEffect(() => setPage((current) => Math.min(current, totalPages)), [totalPages]);

  return (
    <Box bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="lg" overflow="hidden">
      <Box overflowX="auto">
        <Table size="sm" minW="1180px" sx={{ tableLayout: "fixed" }}>
          <Thead bg="gray.100">
            <Tr>
              <Th w="140px">직원</Th>
              {dates.map((date) => {
                const meta = dayMeta(date, today);
                const selected = date === today;
                return (
                  <Th
                    key={date}
                    textAlign="center"
                    bg={selected ? "cyan.50" : undefined}
                    color={selected ? "cyan.700" : meta.day === 0 ? "red.500" : meta.day === 6 ? "blue.500" : "gray.700"}
                    borderTopWidth={selected ? "3px" : undefined}
                    borderLeftWidth={selected ? "2px" : undefined}
                    borderRightWidth={selected ? "2px" : undefined}
                    borderColor={selected ? "cyan.400" : undefined}
                  >
                    {meta.label}
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
                  const selected = date === today;
                  return (
                    <Td
                      key={date}
                      h="72px"
                      p={1.5}
                      bg={selected ? "cyan.50" : "white"}
                      borderLeftWidth={selected ? "2px" : undefined}
                      borderRightWidth={selected ? "2px" : undefined}
                      borderColor={selected ? "cyan.300" : undefined}
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

      {!visibleUsers.length && <Text py={16} textAlign="center" color="gray.500">조회된 근무 일정이 없습니다.</Text>}

      <HStack position="relative" minH="62px" justify="center" borderTopWidth="1px" borderColor="gray.100">
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
