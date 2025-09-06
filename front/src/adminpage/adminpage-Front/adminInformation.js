import React from "react";
import AdminPanel from "../adminpage-Front/admnsButon";
import { useAdminInformationLogic } from "../js/useAdminInformationLogic";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  FormControl, FormLabel, Input, Select, Button, VStack, HStack
} from "@chakra-ui/react";

const AdminInformation = ({ person, onClose, onSave }) => {
  const {
    formData,
    showPanel,
    handleChange,
    handleSubmit,
    handleShowPanel,
    handleBackFromPanel,
    locationsList,
  } = useAdminInformationLogic(person, onClose, onSave);

  // 일급 패널 보여주는 경우
  if (showPanel) {
    return (
      <Modal isOpen={showPanel} onClose={handleBackFromPanel} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="lg" p={5}>
          <ModalHeader fontSize="xl" fontWeight="bold" color="teal.500">
            일급 관리
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AdminPanel onClose={handleBackFromPanel} locations={locationsList} />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  // 일반 정보 수정 모달
  return (
    <Modal isOpen={!!person} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="lg" p={5}>
        <ModalHeader fontSize="xl" fontWeight="bold" color="teal.500">
          정보 수정
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>사원 번호</FormLabel>
                <Input value={formData.employee_number || ""} isReadOnly />
              </FormControl>

              <FormControl>
                <FormLabel>이름</FormLabel>
                <Input
                  name="user_name"
                  value={formData.user_name || ""}
                  onChange={handleChange}
                  placeholder="이름 입력"
                />
              </FormControl>

              <FormControl>
                <FormLabel>주민등록번호</FormLabel>
                <Input
                  name="resident_number"
                  value={formData.resident_number || ""}
                  onChange={handleChange}
                  placeholder="000000-0000000"
                />
              </FormControl>

              <FormControl>
                <FormLabel>주소</FormLabel>
                <Input
                  name="address"
                  value={formData.address || ""}
                  onChange={handleChange}
                  placeholder="주소 입력"
                />
              </FormControl>

              <FormControl>
                <FormLabel>전화번호</FormLabel>
                <HStack spacing={2}>
                  <Select
                    name="mobile_carrier"
                    value={formData.mobile_carrier || ""}
                    onChange={handleChange}
                    w="120px"
                  >
                    <option value="">통신사 선택</option>
                    <option value="SKT">SKT</option>
                    <option value="KT">KT</option>
                    <option value="LGU+">LG U+</option>
                    <option value="알뜰폰">알뜰폰</option>
                  </Select>
                  <Input
                    name="phone_number"
                    value={formData.phone_number || ""}
                    onChange={handleChange}
                    placeholder="010-1234-5678"
                  />
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={2} w="full">
              <Button type="submit" colorScheme="teal" w="full">
                저장
              </Button>
              <Button variant="ghost" w="full" onClick={onClose}>
                취소
              </Button>
              {/* <Button colorScheme="blue" w="full" onClick={handleShowPanel}>
                일급
              </Button> */}
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AdminInformation;
