import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, CheckIcon, DeleteIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { useMemo, useState } from "react";

import CommonTable from "../../../common/mytable";
import getRateColumns from "./ratecolums";
import { useWorkPlaceRate } from "../hook/useWrokPlaceRate";

const EMPTY_PLACE = "미지정";

const formatWon = (value) => {
  if (value == null || value === "" || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toLocaleString()}원`;
};

const average = (values) => {
  const valid = values.filter((value) => value !== "" && value != null);
  if (!valid.length) return null;
  return Math.round(
    valid.reduce((sum, value) => sum + Number(value), 0) / valid.length
  );
};

const notify = (toast, options) => {
  toast({
    duration: 2500,
    isClosable: true,
    position: "top-right",
    ...options,
  });
};

const toRatePayload = (values) => {
  const { isNew, user_uuid, rate_uuid, ...payload } = values;
  return payload;
};

export default function RateEditModal({
  isOpen = true,
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
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const tableData = useMemo(
    () => [...(user?.rates || []), ...tempRates],
    [user?.rates, tempRates]
  );

  const selectedId = Object.keys(checkedItems).find((id) => checkedItems[id]);
  const selectedRow = tableData.find((row) => row.rate_uuid === selectedId);

  const summary = useMemo(
    () => ({
      places: tableData.filter((row) => row.work_place && row.work_place !== EMPTY_PLACE).length,
      base: average(tableData.map((row) => row.base_hourly_wage)),
      overtime: average(tableData.map((row) => row.overtime_hourly_wage)),
      daySpecial: average(tableData.map((row) => row.special_hourly_wage)),
      nightSpecial: average(tableData.map((row) => row.overnight_hourly_wage)),
    }),
    [tableData]
  );

  const handleCheckboxChange = (rate_uuid) => {
    setCheckedItems((prev) => ({ [rate_uuid]: !prev[rate_uuid] }));
  };

  const handleAddRow = () => {
    const hasUnassigned = tableData.some(
      (row) => !row.work_place || row.work_place === EMPTY_PLACE
    );

    if (hasUnassigned) {
      notify(toast, {
        title: "미지정 근무지가 있습니다.",
        description: "먼저 근무지를 선택한 뒤 새 근무지를 추가해주세요.",
        status: "warning",
      });
      return;
    }

    if (tempRates.length > 0) {
      notify(toast, {
        title: "추가 중인 항목이 있습니다.",
        description: "현재 추가 중인 근무지를 먼저 저장해주세요.",
        status: "info",
      });
      return;
    }

    const newRow = {
      rate_uuid: `temp-${Date.now()}`,
      work_place: "",
      base_hourly_wage: "",
      overtime_hourly_wage: "",
      meal_ot_hourly_wage: "",
      special_hourly_wage: "",
      overnight_hourly_wage: "",
      overnight_ot_hourly_wage: "",
      isNew: true,
    };

    setTempRates((prev) => [...prev, newRow]);
    setEditingId(newRow.rate_uuid);
    setEditedValues(newRow);
    setCheckedItems({ [newRow.rate_uuid]: true });
    notify(toast, {
      title: "근무지 입력 행을 추가했습니다.",
      description: "근무지와 시급 정보를 입력한 뒤 저장해주세요.",
      status: "info",
    });
  };

  const handleDeleteClick = async () => {
    if (!selectedId) {
      notify(toast, {
        title: "삭제할 근무지를 선택해주세요.",
        status: "warning",
      });
      return;
    }

    if (selectedRow?.isNew) {
      setTempRates((prev) => prev.filter((row) => row.rate_uuid !== selectedId));
      setEditingId(null);
      setEditedValues({});
      setCheckedItems({});
      notify(toast, {
        title: "추가 중인 행을 취소했습니다.",
        status: "info",
      });
      return;
    }

    if (!selectedRow?.work_place || selectedRow.work_place === EMPTY_PLACE) {
      notify(toast, {
        title: "미지정 근무지는 삭제할 수 없습니다.",
        status: "warning",
      });
      return;
    }

    try {
      setDeleting(true);

      let result;
      if (tableData.length <= 1) {
        result = await handleUpdate({
          rate_uuid: selectedId,
          work_place: EMPTY_PLACE,
          base_hourly_wage: null,
          overtime_hourly_wage: null,
          meal_ot_hourly_wage: null,
          special_hourly_wage: null,
          overnight_hourly_wage: null,
          overnight_ot_hourly_wage: null,
        });
      } else {
        result = await handleDelete({ user, rate_uuid: selectedId });
      }

      if (result?.success === false) {
        throw new Error(result?.message || "근무지 삭제에 실패했습니다.");
      }

      notify(toast, {
        title: tableData.length <= 1 ? "마지막 근무지를 미지정으로 초기화했습니다." : "근무지를 삭제했습니다.",
        status: "success",
      });
      setCheckedItems({});
      onSuccess?.();
    } catch (err) {
      notify(toast, {
        title: "삭제 중 오류가 발생했습니다.",
        description: err?.message,
        status: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveClick = async () => {
    if (!editingId) {
      notify(toast, {
        title: "수정할 항목을 선택해주세요.",
        status: "warning",
      });
      return;
    }

    const nextValues = {
      ...tableData.find((row) => row.rate_uuid === editingId),
      ...editedValues,
    };

    if (!nextValues.work_place || nextValues.work_place === EMPTY_PLACE) {
      notify(toast, {
        title: "근무지를 선택해주세요.",
        status: "warning",
      });
      return;
    }

    const isNewRow = tempRates.some((row) => row.rate_uuid === editingId);

    try {
      setSaving(true);
      const result = isNewRow
        ? await handleAdd({
            user_uuid: user.user_uuid,
            ...toRatePayload(nextValues),
          })
        : await handleUpdate({
            rate_uuid: editingId,
            ...toRatePayload(nextValues),
          });

      if (result?.success === false) {
        throw new Error(result?.message || "저장에 실패했습니다.");
      }

      notify(toast, {
        title: isNewRow ? "근무지 시급을 추가했습니다." : "근무지 시급을 수정했습니다.",
        status: "success",
      });
      setEditingId(null);
      setEditedValues({});
      setTempRates([]);
      setCheckedItems({});
      onSuccess?.();
      onClose?.();
    } catch (err) {
      notify(toast, {
        title: "저장 중 오류가 발생했습니다.",
        description: err?.message,
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () =>
      getRateColumns({
        editingId,
        editedValues,
        setEditedValues,
        setEditingId,
        setTempRates,
      }),
    [editingId, editedValues]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
      <ModalContent borderRadius="2xl" overflow="hidden" maxH="92vh">
        <ModalHeader p={0}>
          <Box bg="linear-gradient(135deg, #F0FFF4 0%, #EBF8FF 100%)" px={7} py={6}>
            <Flex justify="space-between" align="flex-start" gap={4}>
              <HStack spacing={4}>
                <Avatar name={user?.user_name} size="lg" bg="green.500" color="white" />
                <Box>
                  <HStack spacing={2} mb={1}>
                    <Text fontSize="xl" fontWeight="900" color="gray.900">
                      {user?.user_name} 일급 상세
                    </Text>
                    <Badge colorScheme="green" borderRadius="full" px={3}>
                      {summary.places}개 근무지
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    근무지별 기본 시급과 잔업, 주간/야간 특근 수당을 관리합니다.
                  </Text>
                </Box>
              </HStack>
              <ModalCloseButton position="static" />
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={3} mt={5}>
              <Box bg="whiteAlpha.900" border="1px solid" borderColor="white" borderRadius="xl" p={4}>
                <Text fontSize="xs" color="gray.500" fontWeight="800">
                  평균 기본시급
                </Text>
                <Text fontSize="2xl" fontWeight="900" color="gray.900">
                  {formatWon(summary.base)}
                </Text>
              </Box>
              <Box bg="whiteAlpha.900" border="1px solid" borderColor="white" borderRadius="xl" p={4}>
                <Text fontSize="xs" color="gray.500" fontWeight="800">
                  평균 잔업시급
                </Text>
                <Text fontSize="2xl" fontWeight="900" color="green.600">
                  {formatWon(summary.overtime)}
                </Text>
              </Box>
              <Box bg="whiteAlpha.900" border="1px solid" borderColor="white" borderRadius="xl" p={4}>
                <Text fontSize="xs" color="gray.500" fontWeight="800">
                  평균 주간 특근
                </Text>
                <Text fontSize="2xl" fontWeight="900" color="orange.500">
                  {formatWon(summary.daySpecial)}
                </Text>
              </Box>
              <Box bg="whiteAlpha.900" border="1px solid" borderColor="white" borderRadius="xl" p={4}>
                <Text fontSize="xs" color="gray.500" fontWeight="800">
                  평균 야간 특근
                </Text>
                <Text fontSize="2xl" fontWeight="900" color="blue.600">
                  {formatWon(summary.nightSpecial)}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>
        </ModalHeader>

        <ModalBody bg="gray.50" px={7} py={6} overflow="auto">
          <Flex justify="space-between" align={{ base: "stretch", md: "center" }} direction={{ base: "column", md: "row" }} gap={3} mb={4}>
            <HStack color="gray.500" fontSize="sm">
              <InfoOutlineIcon />
              <Text>
                행의 수정 아이콘을 누르면 바로 입력할 수 있고, 체크한 근무지는 삭제할 수 있습니다.
              </Text>
            </HStack>

            <HStack spacing={2}>
              <Button
                size="sm"
                leftIcon={<AddIcon />}
                colorScheme="green"
                onClick={handleAddRow}
              >
                근무지 추가
              </Button>
              <Button
                size="sm"
                leftIcon={<DeleteIcon />}
                colorScheme="red"
                variant="outline"
                isLoading={deleting}
                onClick={handleDeleteClick}
              >
                선택 삭제
              </Button>
            </HStack>
          </Flex>

          <Box
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="xl"
            overflow="hidden"
            sx={{ "> div": { boxShadow: "none", borderRadius: 0 } }}
          >
            <CommonTable
              columns={columns}
              data={tableData}
              rowKey="rate_uuid"
              selectable
              checkedItems={checkedItems}
              onCheck={handleCheckboxChange}
            />
          </Box>
        </ModalBody>

        <Divider />

        <ModalFooter bg="white" px={7} py={4}>
          <Flex w="100%" justify="space-between" align="center" gap={3}>
            <Text fontSize="sm" color="gray.500">
              저장 전에는 선택한 행의 입력값을 다시 한번 확인해주세요.
            </Text>
            <HStack>
              <Button variant="ghost" onClick={onClose} isDisabled={saving || deleting}>
                닫기
              </Button>
              <Button
                leftIcon={<CheckIcon />}
                colorScheme="blue"
                onClick={handleSaveClick}
                isLoading={saving}
              >
                수정 저장
              </Button>
            </HStack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
