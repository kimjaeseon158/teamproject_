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
  Select,
} from "@chakra-ui/react";

import { useAddPersonLogic } from "../hook/useAddPersonLogic";

const AddPersonModal = ({ isOpen, onClose, onSave }) => {
  const {
    formData,
    handleChange,
    handleSubmitBase,
    setFormData, 
  } = useAddPersonLogic(onSave, onClose);


  const openAddressSearch = () => {
    if (!window.daum) {
      alert("주소 검색 스크립트가 로드되지 않았습니다.");
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
              <FormControl>
                <FormLabel>이름</FormLabel>
                <Input
                  name="people"
                  value={formData.people}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>주민등록번호</FormLabel>
                <Input
                  name="resident_Number"
                  value={formData.resident_Number}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>전화번호</FormLabel>
                <Input
                  name="phone_Number"
                  value={formData.phone_Number}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>통신사</FormLabel>
                <Select
                  name="carrier"
                  value={formData.carrier}
                  onChange={handleChange}
                >
                  <option value="">선택</option>
                  <option value="SKT">SKT</option>
                  <option value="KT">KT</option>
                  <option value="LGU">LG U+</option>
                </Select>
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
                  name="address_Detail"
                  value={formData.address_Detail}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>아이디</FormLabel>
                <Input
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>비밀번호</FormLabel>
                <Input
                  type="password"
                  name="pw"
                  value={formData.pw}
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
