import { Box, Button, HStack, Icon, Input, SimpleGrid, Spinner, Text, VStack } from "@chakra-ui/react";
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
          <BoardPageTitle title="사내 연락처" />
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
                {group.items.map((contact) => {
                  const phone = String(contact.phone_number || "").replace(/[^\d+]/g, "");
                  const canCall = /^\+?\d+$/.test(phone);
                  return (
                  <HStack
                    key={`${contact.user_name}-${contact.phone_number}`}
                    as={canCall ? "a" : "div"}
                    href={canCall ? `tel:${phone}` : undefined}
                    aria-label={canCall ? `${contact.user_name} ${contact.phone_number} 전화 걸기` : undefined}
                    p={4} borderWidth="1px" borderRadius="md"
                    cursor={canCall ? "pointer" : "default"}
                    _hover={canCall ? { bg: "blue.50", borderColor: "blue.200" } : undefined}
                    _active={canCall ? { bg: "blue.100" } : undefined}
                    _focusVisible={{ outline: "2px solid", outlineColor: "blue.500", outlineOffset: "2px" }}
                  >
                    <Text fontWeight="900">{contact.user_name}</Text>
                    <Text color="gray.600">{contact.phone_number || "등록된 번호 없음"}</Text>
                    <Box flex="1" />
                    <Icon as={FiPhone} color={canCall ? "blue.500" : "gray.300"} boxSize={5} flexShrink={0} aria-hidden="true" />
                  </HStack>
                  );
                })}
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
