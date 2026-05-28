import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  HStack,
  Select,
} from "@chakra-ui/react";

import { useAddPersonLogic } from "../hook/useAddPersonLogic";
import { CARRIER_OPTIONS } from "../constants/carrierConstants";

const AddPersonModal = ({ isOpen, onClose, onSave, toast }) => {
  const {
    formData,
    handleChange,
    handleSubmitBase,
    setFormData, 
  } = useAddPersonLogic(onSave, onClose, toast);


  const openAddressSearch = () => {
    if (!window.daum) {
      toast?.({
        title: "주소 검색 사용 불가",
        description: "주소 검색 스크립트가 로드되지 않았습니다.",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data) => {
        setFormData((prev) => ({
          ...prev,
          address: data.roadAddress || data.jibunAddress,
        }));
      },
    }).open();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>사원 추가</ModalHeader>
        <ModalCloseButton />

        <form onSubmit={handleSubmitBase}>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>이름</FormLabel>
                <Input
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>주민등록번호</FormLabel>
                <Input
                  name="resident_number"
                  value={formData.resident_number}
                  onChange={handleChange}
                  placeholder="000000-0000000"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>통신사 / 전화번호</FormLabel>
                <HStack spacing={2}>
                  <Select
                    name="mobile_carrier"
                    value={formData.mobile_carrier}
                    onChange={handleChange}
                    w="120px"
                  >
                    <option value="">통신사</option>
                    {CARRIER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                  <Input
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="010-1234-5678"
                  />
                </HStack>
              </FormControl>

              {/* 주소 검색 */}
              <FormControl>
                <FormLabel>주소</FormLabel>
                <Button
                  size="sm"
                  mb={2}
                  onClick={openAddressSearch}
                  type="button"
                >
                  주소 검색
                </Button>
                <Input
                  name="address"
                  value={formData.address}
                  isReadOnly
                  placeholder="도로명 주소"
                />
              </FormControl>

              <FormControl>
                <FormLabel>상세주소</FormLabel>
                <Input
                  name="address_detail"
                  value={formData.address_detail}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>아이디</FormLabel>
                <Input
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>비밀번호</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button type="submit" colorScheme="teal">
              저장
            </Button>
            <Button ml={2} onClick={onClose}>
              취소
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddPersonModal;
