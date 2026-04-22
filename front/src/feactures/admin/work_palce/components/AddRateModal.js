import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";

import CommonTable from "../../../common/mytable";
import getRateColumns from "./ratecolums";
import { useWorkPlaceRate } from "../hook/useWrokPlaceRate";

export default function RateEditModal({
  user,
  onClose,
  onSuccess,
}) {
  const toast = useToast();
  const { handleAdd, handleUpdate, handleDelete } = useWorkPlaceRate(toast);

  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [tempRates, setTempRates] = useState([]);

  /* ======================
     테이블 데이터
  ====================== */
  const tableData = [...(user?.rates || []), ...tempRates];

  /* ======================
     체크박스
  ====================== */
  const handleCheckboxChange = (rate_uuid) => {
    setCheckedItems({ [rate_uuid]: !checkedItems[rate_uuid] });
  };

  const selectedId = Object.keys(checkedItems)
    .find(id => checkedItems[id]);

  const selectedRow = tableData.find(
    row => row.rate_uuid === selectedId
  );

  /* ======================
     Row 추가
  ====================== */
  const handleAddRow = () => {

    const hasUnassigned = tableData.some(
      row => row.work_place === "미지정"
    );

    if (hasUnassigned) {
      toast({
        title: "미지정 근무지가 존재합니다.",
        description: "먼저 근무지를 설정한 후 추가해주세요.",
        status: "warning",
      });
      return;
    }

    if (tempRates.length > 0) {
      toast({
        title: "추가 중인 행을 먼저 저장하세요.",
        status: "info",
      });
      return;
    }

    const newRow = {
      rate_uuid: "temp-" + Date.now(),
      work_place: "",
      base_hourly_wage: "",
      overtime_hourly_wage: "",
      meal_ot_hourly_wage: "",
      special_hourly_wage: "",
      overnight_hourly_wage: "",
      overnight_ot_hourly_wage: "",
      isNew: true,
    };

    setTempRates(prev => [...prev, newRow]);
    setEditingId(newRow.rate_uuid);
    setEditedValues(newRow);
  };

  /* ======================
     삭제
  ====================== */
  const handleDeleteClick = async () => {

    if (!selectedId) return;

    // 🔥 미지정 삭제 방지
    if (selectedRow?.work_place === "미지정") {
      toast({
        title: "미지정 근무지는 삭제할 수 없습니다.",
        status: "warning",
      });
      return;
    }

    const totalCount = tableData.length;

    // 마지막 1개면 삭제 대신 초기화
    if (totalCount <= 1) {
      await handleUpdate({
        rate_uuid: selectedId,
        work_place: "미지정",
        base_hourly_wage: null,
        overtime_hourly_wage: null,
        meal_ot_hourly_wage: null,
        special_hourly_wage: null,
        overnight_hourly_wage: null,
        overnight_ot_hourly_wage: null,
      });

      toast({
        title: "마지막 근무지는 미지정으로 초기화되었습니다.",
        status: "info",
      });

      onSuccess?.();
      onClose?.();
      return;
    }

    await handleDelete({
      user,
      rate_uuid: selectedId,
    });

    toast({ title: "삭제 완료", status: "success" });
    onSuccess?.();
  };

  /* ======================
     저장
  ====================== */
  const handleSaveClick = async () => {

    if (!editingId) return;

    const hasUnassigned = tableData.some(row => {
      if (row.rate_uuid === editingId) {
        return !editedValues.work_place || editedValues.work_place === "미지정";
      }
      return !row.work_place || row.work_place === "미지정";
    });

    if (hasUnassigned) {
      toast({
        title: "미지정 근무지가 존재합니다.",
        status: "warning",
      });
      return;
    }

    const isNewRow = tempRates.some(
      r => r.rate_uuid === editingId
    );

    try {
      let result;
      if (isNewRow) {
        result = await handleAdd({
          user_uuid: user.user_uuid,
          ...editedValues,
        });
      } else {
        result = await handleUpdate({
          rate_uuid: editingId,
          ...editedValues,
        });
      }

    if(result && result.success){
      toast({ title: "저장 완료", status: "success" });
      onSuccess?.();
      onClose?.();
      } else {
        toast({
          title: "저장 중 오류 발생",
          status: "error",
        });
      }

    } catch {
      toast({
        title: "저장 중 오류 발생",
        status: "error",
      });
    }
  };

  /* ======================
     컬럼
  ====================== */
  const columns = useMemo(() =>
    getRateColumns({
      editingId,
      editedValues,
      setEditedValues,
      setEditingId,
      setTempRates,
    }),
  [editingId, editedValues]);

  /* ======================
     렌더
  ====================== */
  return (
    <Modal isOpen onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent maxW="60vw" maxH="90vh" borderRadius="16px">
        <ModalHeader>{user.user_name} 일급 상세</ModalHeader>
        <ModalCloseButton />

        <ModalBody overflow="auto">

          <Flex justify="flex-end" gap={2} mb={4}>
            <Button
              size="sm"
              colorScheme="green"
              onClick={handleAddRow}
            >
              추가
            </Button>

            <Button
              size="sm"
              colorScheme="red"
              isDisabled={
                !selectedId ||
                selectedRow?.work_place === "미지정"
              }
              onClick={handleDeleteClick}
            >
              삭제
            </Button>
          </Flex>

          <CommonTable
            columns={columns}
            data={tableData}
            rowKey="rate_uuid"
            selectable
            checkedItems={checkedItems}
            onCheck={handleCheckboxChange}
          />

          <Flex justify="flex-end" mt={6}>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={handleSaveClick}
            >
              수정 / 저장
            </Button>
          </Flex>

        </ModalBody>
      </ModalContent>
    </Modal>
  );
}