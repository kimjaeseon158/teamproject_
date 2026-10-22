import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { useMemo, useState } from "react";

import getRateColumns from "./rateColumns";
import RateEditTable from "./RateEditTable";
import RateEditModalHeader from "./RateEditModalHeader";
import RateEditToolbar from "./RateEditToolbar";
import useRateEditModal from "../hook/useRateEditModal";
import { EMPTY_PLACE } from "../constants/rateFields";
import {
  isCurrentRateHistory,
  isEndedRateHistory,
} from "../utils/rateHistory";

export default function RateEditModal({
  isOpen = true,
  user,
  onClose,
  onSuccess,
  initialAdminWorkPlaces = [],
}) {
  const toast = useToast();
  const [rateView, setRateView] = useState("current");
  const modal = useRateEditModal({
    isOpen,
    user,
    onClose,
    onSuccess,
    initialAdminWorkPlaces,
    toast,
  });

  const columns = useMemo(
    () => {
      const rateColumns = getRateColumns({
        editingId: modal.editingId,
        editedValues: modal.editedValues,
        setEditedValues: modal.setEditedValues,
        setEditingId: modal.setEditingId,
        setTempRates: modal.setTempRates,
        updateTempRate: modal.updateTempRate,
        adminWorkPlaces: modal.adminWorkPlaces,
        checkedItems: modal.checkedItems,
      });

      return rateView === "ended"
        ? rateColumns.filter((column) => column.key !== "manage")
        : rateColumns;
    },
    [modal, rateView]
  );
  const visibleRates = useMemo(() => {
    const filteredRates = modal.tableData.filter((rate) =>
        rateView === "ended"
          ? isEndedRateHistory(rate)
          : rate.isNew || isCurrentRateHistory(rate)
      );

    if (rateView === "current" && filteredRates.length === 0) {
      return [{
        rate_uuid: `unassigned-${user.user_uuid}`,
        work_place: EMPTY_PLACE,
        effective_start_date: "",
        effective_end_date: null,
        isPlaceholder: true,
      }];
    }

    return filteredRates;
  }, [modal.tableData, rateView, user.user_uuid]);

  const handleRateViewChange = (nextView) => {
    modal.setCheckedItems({});
    setRateView(nextView);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(7px)" />
      <ModalContent
        borderRadius="2xl"
        overflow="hidden"
        maxH="92vh"
        w="1680px"
        maxW="calc(100vw - 32px)"
        boxShadow="0 24px 70px rgba(15, 23, 42, 0.28)"
      >
        <ModalHeader p={0}>
          <RateEditModalHeader summary={modal.summary} user={user} />
        </ModalHeader>

        <ModalBody
          bg="gray.50"
          px={0}
          py={6}
          overflow="auto"
        >
          <Box px={{ base: 4, md: 7 }}>
            <RateEditToolbar
              canAddRow={modal.canAddRow}
              deleting={modal.deleting}
              onAddRow={modal.handleAddRow}
              onDelete={modal.handleDeleteClick}
              rateView={rateView}
              onRateViewChange={handleRateViewChange}
            />
          </Box>

          <Box
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="xl"
            overflow="hidden"
            boxShadow="sm"
            mx={{ base: 4, md: 7 }}
            sx={{ "> div": { boxShadow: "none", borderRadius: 0 } }}
          >
            <RateEditTable
              columns={columns}
              data={visibleRates}
              checkedItems={modal.checkedItems}
              onCheck={modal.handleCheckboxChange}
            />
          </Box>
        </ModalBody>

        <Divider />

        <ModalFooter bg="white" px={{ base: 4, md: 7 }} py={4}>
          <Flex
            w="100%"
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={3}
          >
            <Text fontSize="sm" color="gray.500">
              저장 전에 선택한 행의 입력값을 다시 한 번 확인해주세요.
            </Text>
            <HStack>
              <Button variant="ghost" onClick={onClose} isDisabled={modal.saving || modal.deleting}>
                닫기
              </Button>
              <Button
                leftIcon={<CheckIcon />}
                colorScheme="blue"
                onClick={modal.handleSaveClick}
                isLoading={modal.saving}
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
