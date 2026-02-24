// RateEditModal.js

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

import CommonTable from "../../common/mytable";
import getRateColumns from "./ratecolums";
import { useWorkPlaceRate } from "../hook/useWrokPlaceRate";

export default function RateEditModal({ user, onClose, onRefresh }) {

  const toast = useToast();
  const { handleAdd, handleUpdate, handleDelete } = useWorkPlaceRate(toast);

  const [editingId, setEditingId] = useState(null);
  const [editedValues, setEditedValues] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [tempRates, setTempRates] = useState([]);

  /* ======================
     체크박스
  ====================== */
  const handleCheckboxChange = (rate_uuid) => {
    setCheckedItems({ [rate_uuid]: !checkedItems[rate_uuid] });
  };

  const selectedId = Object.keys(checkedItems)
    .find(id => checkedItems[id]);

  /* ======================
     빈 Row 추가
  ====================== */
  const handleAddRow = () => {

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

    await handleDelete({
      user,
      rate_uuid: selectedId,
    });

    toast({ title: "삭제 완료", status: "success" });
    onRefresh?.();
  };

  /* ======================
     저장 (add / update 자동 분기)
  ====================== */
const handleSaveClick = async () => {

  if (!editingId) return;

  const isNewRow = tempRates.some(
    r => r.rate_uuid === editingId
  );

  if (isNewRow) {

    await handleAdd({
      user_uuid: user.user_uuid,
      ...editedValues,  // ⭐ row 말고 editedValues 사용
    });

  } else {

    await handleUpdate({
      rate_uuid: editingId,
      ...editedValues,
    });
  }

  toast({ title: "저장 완료", status: "success" });

  setTempRates([]);
  setEditingId(null);
  setEditedValues({});
  onRefresh?.();
};

  const tableData = [...user.rates, ...tempRates];

  const columns = useMemo(() =>
    getRateColumns({
      editingId,
      editedValues,
      setEditedValues,
      setEditingId,
    }),
  [editingId, editedValues]);

  return (
    <Modal isOpen onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{user.user_name} 일급 상세</ModalHeader>
        <ModalCloseButton />

        <ModalBody>

          <Flex justify="flex-end" gap={2} mb={4}>
            <Button size="sm" colorScheme="green" onClick={handleAddRow}>
              추가
            </Button>

            <Button
              size="sm"
              colorScheme="red"
              isDisabled={!selectedId}
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