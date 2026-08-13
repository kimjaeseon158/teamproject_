import { useEffect, useState } from "react";
import { Badge, Box, Button, Heading, HStack, Input, Spinner, Text, useToast } from "@chakra-ui/react";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiRefreshCw, FiSave } from "react-icons/fi";

import { getAdminWorkPlaceList } from "../../features/admin/work_place/api/adminWorkPlace";
import AdminWeekScheduleTable from "../../features/admin/work_schedule/components/AdminWeekScheduleTable";
import useAdminWorkSchedules from "../../features/admin/work_schedule/hook/useAdminWorkSchedules";
import { addDaysToDateValue } from "../../features/common/utils/dateValue";

export default function WorkScheduleManagementPage() {
  const schedule = useAdminWorkSchedules();
  const toast = useToast();
  const [workPlaces, setWorkPlaces] = useState([]);

  useEffect(() => {
    getAdminWorkPlaceList().then(setWorkPlaces).catch(() => setWorkPlaces([]));
  }, []);

  const handleApplyRows = (rows, dates) => {
    const invalid = rows.flatMap(({ draftDays }) => dates.flatMap((date) => draftDays[date] || [])).find((item) => {
      if (["DAY", "NIGHT"].includes(item.status) && !item.admin_work_place_uuid) return true;
      return false;
    });
    if (invalid) {
      toast({ title: "필수 입력값을 확인해주세요.", description: "주간·야간 일정은 근무지가 필요합니다.", status: "warning" });
      return false;
    }

    rows.forEach(({ user, draftDays }) => {
      dates.forEach((workDate) => {
        const original = user.days?.[workDate] || [];
        const draft = draftDays[workDate] || [];
        const itemKey = (item) => item.schedule_uuid || item.__client_uuid || item.__draft_id;
        const draftKeys = new Set(draft.map(itemKey).filter(Boolean));

        original.filter((item) => !draftKeys.has(itemKey(item))).forEach((item) => {
          schedule.removeSchedule({ userUuid: user.user_uuid, workDate, schedule: item });
        });

        draft.forEach((item) => {
          const source = original.find((current) => itemKey(current) === itemKey(item));
          const changed = !source || ["status", "admin_work_place_uuid", "work_place_detail"].some(
            (key) => (source[key] || "") !== (item[key] || "")
          );
          if (changed) schedule.upsertSchedule({ userUuid: user.user_uuid, workDate, schedule: item });
        });
      });
    });
    return true;
  };

  const previousDate = addDaysToDateValue(schedule.date, -1);
  const nextDate = addDaysToDateValue(schedule.date, 1);

  return (
    <Box minH="100%" bg="gray.50" p={{ base: 1, md: 2 }}>
      <HStack align={{ base: "stretch", md: "center" }} mb={4} flexDirection={{ base: "column", md: "row" }}>
        <Box>
          <HStack><FiCalendar /><Heading size="lg">주간 근무표 관리</Heading></HStack>
          <Text mt={1} color="gray.500" fontSize="sm">직원별 일정을 편집하고 한 주 변경분을 한 번에 저장합니다.</Text>
        </Box>
      </HStack>

      <HStack
        mb={4}
        px={4}
        py={3}
        justify="space-between"
        align={{ base: "stretch", lg: "center" }}
        flexDirection={{ base: "column", lg: "row" }}
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="xl"
        boxShadow="sm"
      >
        <HStack spacing={3} flexWrap="wrap">
          <Badge colorScheme="cyan" px={3} py={1.5} borderRadius="full">기준일 {schedule.date}</Badge>
          <Text color="gray.600" fontSize="sm">표시 범위 {schedule.data.week_start || "-"} ~ {schedule.data.week_end || "-"}</Text>
          {schedule.loading && <Spinner size="sm" />}
        </HStack>

        <HStack flexWrap="wrap" justify={{ base: "flex-start", lg: "flex-end" }}>
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            leftIcon={<FiRefreshCw />}
            title={`${previousDate} 근무를 ${schedule.date}에 자동 덮어쓰기`}
            onClick={() => schedule.copyPreviousDay("replace")}
            isLoading={schedule.copying}
            isDisabled={schedule.changeCount > 0}
          >
            전날 근무 덮어쓰기
          </Button>
          <Button
            aria-label="이전 날짜"
            size="sm"
            variant="outline"
            onClick={() => schedule.setDate(previousDate)}
            isDisabled={schedule.changeCount > 0}
          ><FiChevronLeft /></Button>
          <Input
            type="date"
            value={schedule.date}
            onChange={(event) => schedule.setDate(event.target.value)}
            maxW="170px"
            size="sm"
            bg="white"
            isDisabled={schedule.changeCount > 0 || schedule.saving}
          />
          <Button
            aria-label="다음 날짜"
            size="sm"
            variant="outline"
            onClick={() => schedule.setDate(nextDate)}
            isDisabled={schedule.changeCount > 0}
          ><FiChevronRight /></Button>
          {schedule.changeCount > 0 && (
            <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={schedule.reload} isDisabled={schedule.saving}>
              변경 취소
            </Button>
          )}
          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<FiSave />}
            onClick={schedule.save}
            isLoading={schedule.saving}
            isDisabled={!schedule.changeCount}
          >
            일괄 저장 {schedule.changeCount > 0 && <Badge ml={2}>{schedule.changeCount}</Badge>}
          </Button>
        </HStack>
      </HStack>

      <AdminWeekScheduleTable
        data={schedule.data}
        selectedDate={schedule.date}
        workPlaces={workPlaces}
        onApplyRows={handleApplyRows}
      />
    </Box>
  );
}
