import { CARRIER_OPTIONS } from "../constants/carrierConstants";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Stack,
  Select,
  Text,
  Box,
  Divider,
  HStack,
} from "@chakra-ui/react";

export default function SearchModal({
  isOpen,
  onClose,
  searchForm,
  onChange,
  onSearch,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent w={{ base: "90%", md: "100%" }} maxH="90dvh" my="5dvh" borderRadius="xl" overflow="hidden" p={{ base: 0, md: 2 }}>
        <ModalHeader fontSize="lg" fontWeight="bold">
          직원 검색
        </ModalHeader>

        <Divider mb={4} />

        <ModalBody overflowY="auto" px={{ base: 4, md: 6 }}>
          <Stack spacing={5}>
            <Box>
              <Text fontSize="sm" mb={1} color="gray.600">
                이름
              </Text>
              <Input
                name="user_name"
                value={searchForm.user_name || ""}
                onChange={onChange}
                focusBorderColor="blue.400"
              />
            </Box>

            <Box>
              <Text fontSize="sm" mb={1} color="gray.600">
                전화번호
              </Text>

              <HStack>
                <Select
                  name="mobile_carrier"
                  value={searchForm.mobile_carrier || ""}
                  onChange={onChange}
                  focusBorderColor="blue.400"
                  maxW="120px"
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
                  value={searchForm.phone_number || "010-"}
                  onChange={onChange}
                  focusBorderColor="blue.400"
                  placeholder="010-1234-5678"
                />
              </HStack>
            </Box>

            <Box>
              <Text fontSize="sm" mb={1} color="gray.600">
                주민번호
              </Text>
              <Input
                name="resident_number"
                value={searchForm.resident_number || ""}
                onChange={onChange}
                focusBorderColor="blue.400"
              />
            </Box>

          </Stack>
        </ModalBody>

        <ModalFooter flexShrink={0} px={{ base: 4, md: 6 }}>
          <Button
            mr={3}
            colorScheme="blue"
            borderRadius="lg"
            px={6}
            onClick={onSearch}
          >
            검색
          </Button>

          <Button variant="ghost" onClick={onClose}>
            닫기
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
