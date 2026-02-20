import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { getWorkaddPlaceList } from "../api/work_place/userWorkplace_addList";

export default function AddRateModal({ isOpen, onClose, onSuccess }) {
  const toast = useToast();

  const [form, setForm] = useState({
    user: "",
    work_place: "",
    base_hourly_wage: "",
    overtime_hourly_wage: "",
    meal_ot_hourly_wage: "",
    special_hourly_wage: "",
    overnight_hourly_wage: "",
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      data: [
        {
          rate_uuid: "0ab0617e-5170-4345-a56b-97edfde949d7", // 🔥 하드코딩 적용
          user: form.user,
          work_place: form.work_place,
          base_hourly_wage: form.base_hourly_wage,
          overtime_hourly_wage: form.overtime_hourly_wage,
          meal_ot_hourly_wage: form.meal_ot_hourly_wage,
          special_hourly_wage: form.special_hourly_wage,
          overnight_hourly_wage: form.overnight_hourly_wage,
        },
      ],
    };

    console.log("전송 payload:", payload); // 🔎 확인용

    const res = await getWorkaddPlaceList(payload, toast);

    if (res?.success === "true") {
      toast({
        title: "등록 성공",
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      onSuccess && onSuccess();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>시급 등록</ModalHeader>

        <ModalBody>
          <Stack spacing={3}>
            <Input
              placeholder="user"
              value={form.user}
              onChange={e => handleChange("user", e.target.value)}
            />

            <Input
              placeholder="work_place"
              value={form.work_place}
              onChange={e => handleChange("work_place", e.target.value)}
            />

            <Input
              placeholder="기본 시급"
              type="number"
              value={form.base_hourly_wage}
              onChange={e => handleChange("base_hourly_wage", e.target.value)}
            />

            <Input
              placeholder="연장 시급"
              type="number"
              value={form.overtime_hourly_wage}
              onChange={e => handleChange("overtime_hourly_wage", e.target.value)}
            />

            <Input
              placeholder="식사 연장 시급"
              type="number"
              value={form.meal_ot_hourly_wage}
              onChange={e => handleChange("meal_ot_hourly_wage", e.target.value)}
            />

            <Input
              placeholder="특근 시급"
              type="number"
              value={form.special_hourly_wage}
              onChange={e => handleChange("special_hourly_wage", e.target.value)}
            />

            <Input
              placeholder="야간 시급"
              type="number"
              value={form.overnight_hourly_wage}
              onChange={e => handleChange("overnight_hourly_wage", e.target.value)}
            />
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            취소
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            저장
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
