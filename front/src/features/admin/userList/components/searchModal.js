import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormControl,
  FormLabel,
  SimpleGrid,
} from "@chakra-ui/react";

export default function SearchModal({
  isOpen,
  onClose,
  searchForm,
  onChange,
  onSearch,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent
        w={{ base: "calc(100% - 32px)", md: "100%" }}
        borderRadius="2xl"
        overflow="hidden"
      >
        <ModalHeader px={{ base: 5, md: 6 }} pt={6} pb={1} fontSize="xl" fontWeight="800">
          직원 검색
        </ModalHeader>
        <ModalCloseButton top={5} right={5} />

        <ModalBody px={{ base: 5, md: 6 }} py={5}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel mb={2} fontSize="sm" color="gray.700">
                이름
              </FormLabel>
              <Input
                name="user_name"
                value={searchForm.user_name || ""}
                onChange={onChange}
                onKeyDown={(event) => event.key === "Enter" && onSearch()}
                placeholder="직원 이름"
                focusBorderColor="blue.400"
                autoFocus
              />
            </FormControl>

            <FormControl>
              <FormLabel mb={2} fontSize="sm" color="gray.700">
                주민등록번호
              </FormLabel>
              <Input
                name="resident_number"
                value={searchForm.resident_number || ""}
                onChange={onChange}
                onKeyDown={(event) => event.key === "Enter" && onSearch()}
                placeholder="000000-0000000"
                focusBorderColor="blue.400"
                inputMode="numeric"
              />
            </FormControl>
          </SimpleGrid>
        </ModalBody>

        <ModalFooter px={{ base: 5, md: 6 }} pb={6} pt={1} gap={2}>
          <Button variant="ghost" onClick={onClose}>
            취소
          </Button>
          <Button
            colorScheme="blue"
            borderRadius="lg"
            px={6}
            onClick={onSearch}
          >
            검색
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
