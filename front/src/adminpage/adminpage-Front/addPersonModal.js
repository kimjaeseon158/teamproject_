import React from "react";
import { useAddPersonLogic } from "../js/useAddPersonLogic";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, FormControl, FormLabel,
  Input, Select, Flex
} from "@chakra-ui/react";

const AddPersonModal = ({ isOpen, onClose, onSave, existingEmployees }) => {
  const { formData, handleChange, handleSubmitBase, setFormData } =
    useAddPersonLogic(existingEmployees, onSave, onClose);

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const fullAddress = data.address;
        setFormData((prev) => ({
          ...prev,
          address: fullAddress,
        }));
      },
    }).open();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSubmitBase(e);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="lg" p={5} maxW="lg">
        <ModalHeader fontSize="xl" fontWeight="bold" color="teal.500">
          새 사람 추가
        </ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>사원번호</FormLabel>
              <Input value={formData.employee_Number || ""} isReadOnly />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>이름</FormLabel>
              <Input
                name="people"
                value={formData.people || ""}
                onChange={handleChange}
                placeholder="ex) 홍길동"
                maxLength={8}
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>주민등록번호</FormLabel>
              <Input
                name="resident_Number"
                value={formData.masked_Resident_Number || ""}
                onChange={handleChange}
                placeholder="ex)000000-0******"
              />
            </FormControl>

            {/* 통신사 + 전화번호 한 줄 */}
            <FormControl mb={3}>
              <FormLabel>전화번호</FormLabel>
              <Flex gap={2}>
                <Select
                  name="carrier"
                  value={formData.carrier || ""}
                  onChange={handleChange}
                  w="40%"
                >
                  <option value="">통신사</option>
                  <option value="SKT">SKT</option>
                  <option value="KT">KT</option>
                  <option value="LGU+">LG U+</option>
                  <option value="알뜰폰">알뜰폰</option>
                </Select>
                <Input
                  name="phone_Number"
                  value={formData.phone_Number || ""}
                  onChange={handleChange}
                  placeholder="010-1234-5678"
                  maxLength={13}
                  w="60%"
                />
              </Flex>
            </FormControl>

            {/* 주소 검색 버튼 + 주소 입력 한 줄 */}
            <FormControl mb={3}>
              <FormLabel>주소</FormLabel>
              <Flex gap={2}>
                <Input
                  name="address"
                  value={formData.address || ""}
                  placeholder="충청남도 OO시 OO군..."
                  isReadOnly
                  flex="1"
                />
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={handleAddressSearch}
                  whiteSpace="nowrap"
                >
                  주소 검색
                </Button>
              </Flex>
              <Input
                mt={2}
                name="address_Detail"
                value={formData.address_Detail || ""}
                onChange={handleChange}
                placeholder="상세 주소"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>ID</FormLabel>
              <Input
                name="id"
                value={formData.id || ""}
                onChange={handleChange}
                placeholder="ex) hong123"
                maxLength={12}
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>비밀번호</FormLabel>
              <Input
                type="password"
                name="pw"
                value={formData.pw || ""}
                onChange={handleChange}
                placeholder="ex) 1234"
                maxLength={16}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button type="submit" colorScheme="teal" w="full" mr={2}>
              저장
            </Button>
            <Button variant="ghost" w="full" onClick={onClose}>
              취소
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddPersonModal;
