import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Collapse,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  HStack,
  Text,
  useToast,
} from "@chakra-ui/react";

import { SCHEDULE_STATUSES } from "../constants/scheduleStatus";

const emptySchedule = { status: "DAY", admin_work_place_uuid: "", work_place_detail: "" };

export default function ScheduleEditModal({ context, workPlaces, onClose, onSave, onDelete, onCreateWorkPlace }) {
  const toast = useToast();
  const [form, setForm] = useState(emptySchedule);
  const [showNewPlace, setShowNewPlace] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState("");

  useEffect(() => {
    setForm(context?.schedule ? { ...emptySchedule, ...context.schedule } : emptySchedule);
    setShowNewPlace(false);
    setNewPlaceName("");
  }, [context]);

  const status = useMemo(
    () => SCHEDULE_STATUSES.find((item) => item.value === form.status) || SCHEDULE_STATUSES[0],
    [form.status]
  );

  const submit = () => {
    if (status.requiresPlace && !form.admin_work_place_uuid) {
      toast({ title: "주간·야간 일정은 근무지를 선택해야 합니다.", status: "warning" });
      return;
    }
    if (status.requiresDetail && !form.work_place_detail.trim()) {
      toast({ title: "교육 일정은 세부내역을 입력해야 합니다.", status: "warning" });
      return;
    }
    const selectedPlace = workPlaces.find((place) =>
      place.admin_work_place_uuid === form.admin_work_place_uuid
    );
    const nextSchedule = {
      ...context.schedule,
      ...form,
      admin_work_place_uuid: status.requiresPlace ? form.admin_work_place_uuid : null,
      work_place: status.requiresPlace ? selectedPlace?.work_place || form.work_place || "" : "",
      status_label: status.label,
    };
    const currentKey = context.schedule?.schedule_uuid || context.schedule?.__client_uuid;
    const duplicated = (context.daySchedules || []).some((item) => {
      const itemKey = item.schedule_uuid || item.__client_uuid;
      return itemKey !== currentKey &&
        item.status === nextSchedule.status &&
        (item.work_place || "") === (nextSchedule.work_place || "") &&
        (item.work_place_detail || "").trim() === nextSchedule.work_place_detail.trim();
    });
    if (duplicated) {
      toast({ title: "완전히 같은 근무 일정이 이미 있습니다.", status: "warning" });
      return;
    }
    onSave(nextSchedule);
  };

  return (
    <Modal isOpen={Boolean(context)} onClose={onClose} isCentered closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>근무 일정 {context?.schedule ? "수정" : "추가"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={5} fontSize="sm" color="gray.500">
            {context?.userName} · {context?.workDate}
          </Text>
          <FormControl isRequired mb={4}>
            <FormLabel>근무 상태</FormLabel>
            <Select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
              {SCHEDULE_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </Select>
          </FormControl>
          <FormControl isRequired={status.requiresPlace} isDisabled={!status.requiresPlace} mb={4}>
            <FormLabel>근무지</FormLabel>
            <Select
              value={status.requiresPlace ? form.admin_work_place_uuid || "" : ""}
              onChange={(event) => setForm((prev) => ({ ...prev, admin_work_place_uuid: event.target.value }))}
              placeholder={status.requiresPlace ? "근무지를 선택하세요" : "이 상태는 근무지를 저장하지 않습니다"}
            >
              {workPlaces.map((place) => (
                <option key={place.admin_work_place_uuid} value={place.admin_work_place_uuid}>{place.work_place}</option>
              ))}
            </Select>
            {status.requiresPlace && (
              <Button mt={2} size="xs" variant="ghost" colorScheme="blue" onClick={() => setShowNewPlace((value) => !value)}>
                + 새 근무지 등록
              </Button>
            )}
          </FormControl>
          <Collapse in={showNewPlace && status.requiresPlace} animateOpacity>
            <HStack mb={4} align="flex-end">
              <FormControl>
                <FormLabel fontSize="sm">신규 근무지명</FormLabel>
                <Input value={newPlaceName} onChange={(event) => setNewPlaceName(event.target.value)} placeholder="예: 삼성전자(아산)" />
              </FormControl>
              <Button
                colorScheme="blue"
                variant="outline"
                onClick={async () => {
                  if (!newPlaceName.trim() || !onCreateWorkPlace) return;
                  const place = await onCreateWorkPlace(newPlaceName.trim());
                  if (place) {
                    setForm((prev) => ({ ...prev, admin_work_place_uuid: place.admin_work_place_uuid }));
                    setShowNewPlace(false);
                    setNewPlaceName("");
                  }
                }}
              >등록</Button>
            </HStack>
          </Collapse>
          <FormControl isRequired={status.requiresDetail}>
            <FormLabel>세부내역</FormLabel>
            <Input
              value={form.work_place_detail || ""}
              onChange={(event) => setForm((prev) => ({ ...prev, work_place_detail: event.target.value }))}
              placeholder={form.status === "TRAINING" ? "교육 장소와 내용을 입력하세요" : "예: P1 제조 1팀"}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter justifyContent="space-between">
          <Button
            colorScheme="red"
            variant="ghost"
            visibility={context?.schedule ? "visible" : "hidden"}
            onClick={() => onDelete(context.schedule)}
          >삭제</Button>
          <Button colorScheme="blue" onClick={submit}>변경분에 추가</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
