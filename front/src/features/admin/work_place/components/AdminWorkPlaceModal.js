import {
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
  Text,
  useToast,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";

import AdminWorkPlaceFormPanel from "./AdminWorkPlaceFormPanel";
import AdminWorkPlaceListPanel from "./AdminWorkPlaceListPanel";
import useAdminWorkPlaceModal from "../hook/useAdminWorkPlaceModal";

export default function AdminWorkPlaceModal({
  isOpen,
  onClose,
  onSuccess,
  workPlaceCount = 0,
  workPlaces = [],
}) {
  const toast = useToast();
  const modal = useAdminWorkPlaceModal({
    isOpen,
    onClose,
    onSuccess,
    toast,
    workPlaces,
  });

  return (
    <Modal isOpen={isOpen} onClose={modal.handleClose} isCentered size="6xl">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
      <ModalContent borderRadius="2xl" overflow="hidden" maxH="92vh" mx={4}>
        <ModalHeader p={0}>
          <Box bg="linear-gradient(135deg, #F0FFF4 0%, #EBF8FF 100%)" px={7} py={6}>
            <Flex justify="space-between" align="flex-start" gap={4}>
              <Box>
                <HStack spacing={2} mb={1}>
                  <Text fontSize="xl" fontWeight="900" color="gray.900">
                    관리자 근무지 관리
                  </Text>
                  <Badge colorScheme="green" borderRadius="full" px={3}>
                    현재 {workPlaceCount.toLocaleString()}곳
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  전체 근무지 목록을 추가, 수정, 삭제하고 기본 시급 값을 관리합니다.
                </Text>
              </Box>
              <ModalCloseButton position="static" />
            </Flex>
          </Box>
        </ModalHeader>

        <ModalBody bg="gray.50" px={7} py={6} overflow="auto">
          <Flex direction={{ base: "column", lg: "row" }} gap={5} align="stretch">
            <AdminWorkPlaceListPanel
              form={modal.form}
              onNew={modal.handleNew}
              onSearchChange={modal.setSearch}
              onSelect={modal.handleSelect}
              search={modal.search}
              workPlaces={modal.filteredWorkPlaces}
            />
            <AdminWorkPlaceFormPanel
              deleting={modal.deleting}
              form={modal.form}
              isEditMode={modal.isEditMode}
              onChange={modal.handleChange}
              onDelete={modal.handleDelete}
            />
          </Flex>
        </ModalBody>

        <Divider />

        <ModalFooter bg="white" px={7} py={4}>
          <Flex w="100%" justify="space-between" align="center" gap={3}>
            <Text fontSize="sm" color="gray.500">
              삭제 전 해당 근무지와 연결된 직원 시급이 있는지 확인해주세요.
            </Text>
            <HStack>
              <Button
                variant="ghost"
                onClick={modal.handleClose}
                isDisabled={modal.saving || modal.deleting}
              >
                닫기
              </Button>
              <Button
                leftIcon={<CheckIcon />}
                colorScheme="blue"
                onClick={modal.handleSubmit}
                isLoading={modal.saving}
                isDisabled={modal.deleting}
              >
                {modal.isEditMode ? "수정" : "추가"}
              </Button>
            </HStack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
