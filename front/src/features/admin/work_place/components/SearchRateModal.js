import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";

export default function SearchRateModal({
  isOpen,
  onClose,
  onSearch,
}) {
  const [userName, setUserName] = useState("");
  const [workPlace, setWorkPlace] = useState("");

  const handleSearch = () => {
    onSearch({
      user_name: userName,
      work_place: workPlace,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>검색</ModalHeader>
        <ModalBody>
          <Input
            placeholder="이름"
            mb={3}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Input
            placeholder="근무지"
            value={workPlace}
            onChange={(e) => setWorkPlace(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            취소
          </Button>
          <Button colorScheme="blue" onClick={handleSearch}>
            검색
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}