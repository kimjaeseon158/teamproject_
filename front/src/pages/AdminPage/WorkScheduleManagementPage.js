import { useEffect, useState } from "react";
import { Badge, Box, Button, Heading, HStack, Input, Radio, RadioGroup, Spinner, Text, useToast } from "@chakra-ui/react";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiRefreshCw, FiSave } from "react-icons/fi";

import { createAdminWorkPlace, getAdminWorkPlaceList } from "../../features/admin/work_place/api/adminWorkPlace";
import { RATE_FIELDS } from "../../features/admin/work_place/constants/rateFields";
import AdminWeekScheduleTable from "../../features/admin/work_schedule/components/AdminWeekScheduleTable";
import ScheduleEditModal from "../../features/admin/work_schedule/components/ScheduleEditModal";
import useAdminWorkSchedules from "../../features/admin/work_schedule/hook/useAdminWorkSchedules";
import { addDaysToDateValue } from "../../features/common/utils/dateValue";

export default function WorkScheduleManagementPage() {
  const schedule = useAdminWorkSchedules();
  const toast = useToast();
  const [workPlaces, setWorkPlaces] = useState([]);
  const [editContext, setEditContext] = useState(null);
  const [copyMode, setCopyMode] = useState("keep");

  useEffect(() => {
    getAdminWorkPlaceList().then(setWorkPlaces).catch(() => setWorkPlaces([]));
  }, []);

  const handleSaveSchedule = (nextSchedule) => {
    schedule.upsertSchedule({
      userUuid: editContext.userUuid,
      workDate: editContext.workDate,
      schedule: nextSchedule,
    });
    setEditContext(null);
  };

  const handleDeleteSchedule = (targetSchedule) => {
    schedule.removeSchedule({
      userUuid: editContext.userUuid,
      workDate: editContext.workDate,
      schedule: targetSchedule,
    });
    setEditContext(null);
  };

  const handleCreateWorkPlace = async (name) => {
    try {
      await createAdminWorkPlace({
        work_place: name,
        ...Object.fromEntries(RATE_FIELDS.map(({ key }) => [key, null])),
      }, toast);
      const places = await getAdminWorkPlaceList(toast);
      setWorkPlaces(places);
      toast({ title: "새 근무지를 등록했습니다.", status: "success" });
      return places.find((place) => place.work_place === name);
    } catch (error) {
      toast({ title: "근무지 등록에 실패했습니다.", description: error.message, status: "error" });
      return null;
    }
  };

  const previousDate = addDaysToDateValue(schedule.date, -1);

  return (
    <Box minH="100%" bg="gray.50" p={{ base: 1, md: 2 }}>
      <HStack justify="space-between" align={{ base: "stretch", md: "center" }} mb={6} flexDirection={{ base: "column", md: "row" }}>
        <Box>
          <HStack><FiCalendar /><Heading size="lg">주간 근무표 관리</Heading></HStack>
          <Text mt={1} color="gray.500" fontSize="sm">직원별 일정을 편집하고 한 주 변경분을 한 번에 저장합니다.</Text>
        </Box>
        <HStack flexWrap="wrap">
          <Button
            aria-label="이전 날짜"
            variant="outline"
            onClick={() => schedule.setDate(previousDate)}
            isDisabled={schedule.changeCount > 0}
          ><FiChevronLeft /></Button>
          <Input
            type="date"
            value={schedule.date}
            onChange={(event) => schedule.setDate(event.target.value)}
            maxW="170px"
            bg="white"
            isDisabled={schedule.changeCount > 0 || schedule.saving}
          />
          <Button
            aria-label="다음 날짜"
            variant="outline"
            onClick={() => schedule.setDate(addDaysToDateValue(schedule.date, 1))}
            isDisabled={schedule.changeCount > 0}
          ><FiChevronRight /></Button>
          {schedule.changeCount > 0 && (
            <Button leftIcon={<FiRefreshCw />} variant="outline" onClick={schedule.reload} isDisabled={schedule.saving}>
              변경 취소
            </Button>
          )}
          <Button
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

      <Box mb={4} p={4} borderWidth="1px" borderColor="blue.200" borderRadius="xl" bg="blue.50">
        <HStack justify="space-between" align={{ base: "stretch", md: "center" }} flexDirection={{ base: "column", md: "row" }} gap={4}>
          <Box>
            <Text fontWeight="900">{previousDate} 근무 → {schedule.date}로 불러오기</Text>
            <Text mt={1} fontSize="sm" color="gray.600">전날 근무지와 세부내역을 복사한 뒤 직원별로 수정할 수 있습니다.</Text>
          </Box>
          <RadioGroup value={copyMode} onChange={setCopyMode}>
            <HStack spacing={5}><Radio value="keep">기존 일정 유지</Radio><Radio value="replace">덮어쓰기</Radio></HStack>
          </RadioGroup>
          <Button colorScheme="blue" variant="outline" leftIcon={<FiRefreshCw />} onClick={() => schedule.copyPreviousDay(copyMode)} isLoading={schedule.copying}>
            전날 근무 불러오기
          </Button>
        </HStack>
      </Box>

      <HStack mb={3} color="gray.600" fontSize="sm">
        <Text>조회 주간 {schedule.data.week_start || "-"} ~ {schedule.data.week_end || "-"}</Text>
        {schedule.loading && <Spinner size="sm" />}
      </HStack>

      <AdminWeekScheduleTable
        data={schedule.data}
        selectedDate={schedule.date}
        previousDate={previousDate}
        onEdit={setEditContext}
        onCopyEmployee={schedule.copyEmployeePrevious}
      />
      <ScheduleEditModal
        context={editContext}
        workPlaces={workPlaces}
        onClose={() => setEditContext(null)}
        onSave={handleSaveSchedule}
        onDelete={handleDeleteSchedule}
        onCreateWorkPlace={handleCreateWorkPlace}
      />
    </Box>
  );
}
