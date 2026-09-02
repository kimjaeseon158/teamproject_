import { Box, Button, HStack, IconButton, Input, SimpleGrid, Spinner, Text, Tooltip, VStack } from "@chakra-ui/react";
import { FiPhone, FiSearch } from "react-icons/fi";

import useBoardContacts from "../../features/board/contacts/hook/useBoardContacts";
import BoardPageTitle from "../../features/board/components/BoardPageTitle";
import BoardLayout from "../../features/board/layout/BoardLayout";

export default function BoardContactsPage(props) {
  const contacts = useBoardContacts();

  return (
    <BoardLayout activeSection="contacts" {...props}>
      <VStack align="stretch" spacing={5}>
        <HStack justify="space-between" align={{ base: "stretch", md: "flex-start" }} flexDirection={{ base: "column", md: "row" }}>
          <BoardPageTitle
            title="사내 연락처"
            description={`이름을 검색하거나 초성별로 찾아보세요. · 총 ${contacts.contacts.length}명`}
          />
          <HStack>
            <HStack bg="white" borderWidth="1px" borderRadius="md" px={3}>
              <FiSearch color="#A0AEC0" />
              <Input
                border="0"
                placeholder="이름 검색"
                value={contacts.keyword}
                onChange={(event) => contacts.setKeyword(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && contacts.search()}
              />
            </HStack>
            <Button colorScheme="blue" onClick={contacts.search} isLoading={contacts.loading}>조회</Button>
          </HStack>
        </HStack>
        <Box bg="white" borderWidth="1px" borderRadius="lg" overflow="hidden">
          {contacts.loading && !contacts.contacts.length ? (
            <HStack justify="center" py={20}><Spinner color="blue.500" /><Text color="gray.500">연락처를 불러오는 중입니다.</Text></HStack>
          ) : contacts.groups.length ? contacts.groups.map((group) => (
            <Box key={group.initial} p={5} borderBottomWidth="1px" _last={{ borderBottomWidth: 0 }}>
              <Text mb={4} color="blue.600" fontWeight="900">{group.initial}</Text>
              <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={3}>
                {group.items.map((contact) => (
                  <HStack key={`${contact.user_name}-${contact.phone_number}`} p={4} borderWidth="1px" borderRadius="md">
                    <Text fontWeight="900">{contact.user_name}</Text>
                    <Text color="gray.600">{contact.phone_number || "등록된 번호 없음"}</Text>
                    <Box flex="1" />
                    <Tooltip label={contact.phone_number ? "전화번호 복사" : "등록된 번호 없음"}>
                      <IconButton
                        aria-label={`${contact.user_name} 전화번호 복사`}
                        icon={<FiPhone />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        isDisabled={!contact.phone_number}
                        onClick={() => contacts.copyPhoneNumber(contact.phone_number)}
                      />
                    </Tooltip>
                  </HStack>
                ))}
              </SimpleGrid>
            </Box>
          )) : (
            <Text py={20} textAlign="center" color="gray.500">조회된 연락처가 없습니다.</Text>
          )}
        </Box>
      </VStack>
    </BoardLayout>
  );
}
