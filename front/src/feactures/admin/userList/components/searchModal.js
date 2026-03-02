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
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" p={2}>
        <ModalHeader fontSize="lg" fontWeight="bold">
           직원 검색
        </ModalHeader>

        <Divider mb={4} />

        <ModalBody>
          <Stack spacing={5}>

            {/* 이름 + 정렬 */}
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



            {/* 전화번호 + 통신사 한 줄 */}
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
                  <option value="SKT">SKT</option>
                  <option value="KT">KT</option>
                  <option value="LG">LG</option>
                </Select>
                <Input
                  name="phone_number"
                  value={searchForm.phone_number || ""}
                  onChange={onChange}
                  focusBorderColor="blue.400"
                />
              </HStack>
            </Box>

            {/* 주민번호 */}
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

          

            <Divider />
            <HStack mt={3}>
                <Select
                  placeholder="정렬 필드"
                  name="sorting"
                  onChange={onChange}
                >
                  <option value="user_name">이름</option>
                  <option value="phone_number">전화번호</option>
                </Select>

                <Select
                  placeholder="정렬 방향"
                  name="direction"
                  onChange={onChange}
                >
                  <option value="asc">오름차순</option>
                  <option value="desc">내림차순</option>
                </Select>
            </HStack>
            </Stack>
        </ModalBody>

        <ModalFooter>
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