import {
  Badge,
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { FiPlus, FiRotateCcw } from "react-icons/fi";

import { getScheduleStatus } from "../constants/scheduleStatus";

function ScheduleCard({ schedule, editable, onClick }) {
  const status = getScheduleStatus(schedule.status);
  return (
    <Button
      h="auto"
      w="100%"
      p={3}
      variant="outline"
      borderColor={`${status.colorScheme}.200`}
      bg={`${status.colorScheme}.50`}
      whiteSpace="normal"
      cursor={editable ? "pointer" : "default"}
      onClick={editable ? onClick : undefined}
      _hover={editable ? { borderColor: `${status.colorScheme}.400` } : {}}
    >
      <Box textAlign="left" w="100%">
        <Badge colorScheme={status.colorScheme}>{status.label}</Badge>
        <Text mt={2} fontSize="sm" fontWeight="800">{schedule.work_place || "근무지 없음"}</Text>
        {schedule.work_place_detail && <Text mt={1} fontSize="xs" color="gray.600">{schedule.work_place_detail}</Text>}
      </Box>
    </Button>
  );
}

export default function AdminWeekScheduleTable({ data, selectedDate, previousDate, onEdit, onCopyEmployee }) {
  return (
    <Box bg="white" borderWidth="1px" borderRadius="xl" overflowX="auto">
      <Table size="sm" minW="900px">
        <Thead bg="gray.50">
          <Tr>
            <Th minW="150px">직원</Th>
            <Th minW="240px">이전 근무 ({previousDate.slice(5).replace("-", "/")})</Th>
            <Th minW="260px" bg="blue.50">선택일 편성 ({selectedDate.slice(5).replace("-", "/")})</Th>
            <Th minW="190px" textAlign="center">근무지 배정</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.users.map((user) => {
            const previousSchedules = user.days?.[previousDate] || [];
            const currentSchedules = user.days?.[selectedDate] || [];
            return (
              <Tr key={user.user_uuid}>
                <Td verticalAlign="top" py={4}>
                  <Text fontWeight="900">{user.user_name}</Text>
                  <Text mt={1} fontSize="xs" color="gray.500">{currentSchedules.length}건 편성</Text>
                </Td>
                <Td verticalAlign="top" p={3}>
                  <VStack align="stretch" spacing={2}>
                    {previousSchedules.map((item, index) => <ScheduleCard key={item.schedule_uuid || index} schedule={item} />)}
                    {!previousSchedules.length && <Text py={4} textAlign="center" fontSize="xs" color="gray.400">전날 일정 없음</Text>}
                  </VStack>
                </Td>
                <Td verticalAlign="top" p={3} bg="blue.50">
                  <VStack align="stretch" spacing={2}>
                    {currentSchedules.map((schedule) => (
                      <ScheduleCard
                        key={schedule.schedule_uuid || schedule.__client_uuid}
                        schedule={schedule}
                        editable
                        onClick={() => onEdit({
                          userUuid: user.user_uuid,
                          userName: user.user_name,
                          workDate: selectedDate,
                          schedule,
                          daySchedules: currentSchedules,
                        })}
                      />
                    ))}
                    {!currentSchedules.length && <Text py={4} textAlign="center" fontSize="xs" color="gray.400">편성된 일정 없음</Text>}
                  </VStack>
                </Td>
                <Td verticalAlign="top" p={3}>
                  <VStack>
                    <Button
                      w="100%"
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      leftIcon={<FiRotateCcw />}
                      isDisabled={!previousSchedules.length}
                      onClick={() => onCopyEmployee(user.user_uuid, previousSchedules)}
                    >이전 근무 적용</Button>
                    <Button
                      w="100%"
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      leftIcon={<FiPlus />}
                      onClick={() => onEdit({
                        userUuid: user.user_uuid,
                        userName: user.user_name,
                        workDate: selectedDate,
                        daySchedules: currentSchedules,
                      })}
                    >새 일정</Button>
                  </VStack>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      {!data.users.length && <Text py={14} textAlign="center" color="gray.500">조회된 직원이 없습니다.</Text>}
    </Box>
  );
}
