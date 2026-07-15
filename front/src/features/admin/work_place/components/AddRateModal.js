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
import { useMemo } from "react";

import CommonTable from "../../../common/mytable";
import getRateColumns from "./rateColumns";
import RateEditModalHeader from "./RateEditModalHeader";
import RateEditToolbar from "./RateEditToolbar";
import useRateEditModal from "../hook/useRateEditModal";

export default function RateEditModal({
  isOpen = true,
  user,
  onClose,
  onSuccess,
  initialAdminWorkPlaces = [],
}) {
  const toast = useToast();
  const modal = useRateEditModal({
    isOpen,
    user,
    onClose,
    onSuccess,
    initialAdminWorkPlaces,
    toast,
  });

  const columns = useMemo(
    () =>
      getRateColumns({
        editingId: modal.editingId,
        editedValues: modal.editedValues,
        setEditedValues: modal.setEditedValues,
        setEditingId: modal.setEditingId,
        setTempRates: modal.setTempRates,
        adminWorkPlaces: modal.adminWorkPlaces,
      }),
    [modal]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
      <ModalContent borderRadius="2xl" overflow="hidden" maxH="92vh">
        <ModalHeader p={0}>
          <RateEditModalHeader summary={modal.summary} user={user} />
        </ModalHeader>

        <ModalBody bg="gray.50" px={7} py={6} overflow="auto">
          <RateEditToolbar
            deleting={modal.deleting}
            onAddRow={modal.handleAddRow}
            onDelete={modal.handleDeleteClick}
          />

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
              data={modal.tableData}
              rowKey="rate_uuid"
              selectable
              checkedItems={modal.checkedItems}
              onCheck={modal.handleCheckboxChange}
            />
          </Box>
        </ModalBody>

        <Divider />

        <ModalFooter bg="white" px={7} py={4}>
          <Flex w="100%" justify="space-between" align="center" gap={3}>
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
