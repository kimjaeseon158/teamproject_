import { useEffect, useState } from "react";
import { Badge, Box, Button, Heading, HStack, Text, useToast } from "@chakra-ui/react";
import { FiCalendar, FiRefreshCw, FiSave } from "react-icons/fi";

import { getAdminWorkPlaceList } from "../../features/admin/work_place/api/adminWorkPlace";
import AdminWeekScheduleTable from "../../features/admin/work_schedule/components/AdminWeekScheduleTable";
import useAdminWorkSchedules from "../../features/admin/work_schedule/hook/useAdminWorkSchedules";

export default function WorkScheduleManagementPage() {
  const schedule = useAdminWorkSchedules();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const dateChangeDisabled = editing || schedule.changeCount > 0 || schedule.loading || schedule.saving || schedule.copying;
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


  return (
    <Box minH="100%" bg="gray.50" p={{ base: 1, md: 2 }}>
      <HStack justify="space-between" align="center" mb={3} flexWrap="wrap" spacing={3}>
        <HStack spacing={3} flexWrap="wrap">
          <FiCalendar /><Heading size="md">주간 근무표 관리</Heading>
          {schedule.data.week_start && <Text fontSize="sm" fontWeight="600" color="gray.600" borderLeftWidth="1px" pl={3}>{schedule.data.week_start.slice(5).replace("-", ".")} – {schedule.data.week_end?.slice(5).replace("-", ".")}</Text>}
        </HStack>
        <HStack flexWrap="wrap" justify={{ base: "flex-start", lg: "flex-end" }}>
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            leftIcon={<FiRefreshCw />}
            title="이번 주의 직원별 최근 과거 근무를 작업 날짜에 덮어쓰기"
            onClick={() => schedule.copyPreviousDay("replace")}
            isLoading={schedule.copying}
            isDisabled={dateChangeDisabled || !schedule.canCopyRecent}
          >
            최근 근무 덮어쓰기
          </Button>
          {schedule.changeCount > 0 && (
            <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={schedule.reload} isDisabled={schedule.saving || editing}>
              변경 취소
            </Button>
          )}
          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<FiSave />}
            onClick={schedule.save}
            isLoading={schedule.saving}
            isDisabled={!schedule.changeCount || editing || schedule.loading || schedule.copying}
          >
            일괄 저장 {schedule.changeCount > 0 && <Badge ml={2}>{schedule.changeCount}</Badge>}
          </Button>
        </HStack>      </HStack>

      <AdminWeekScheduleTable
        data={schedule.data}
        selectedDate={schedule.date}
        onDateChange={schedule.setDate}
        onEditingChange={setEditing}
        dateChangeDisabled={dateChangeDisabled}
        isBusy={schedule.loading || schedule.saving || schedule.copying}
        workPlaces={workPlaces}
        onApplyRows={handleApplyRows}
      />
    </Box>
  );
}
