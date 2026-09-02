import { Badge, Box, HStack, Input, Select, Table, Tbody, Td, Th, Thead, Tr, VStack } from "@chakra-ui/react";

import BoardPageTitle from "../../features/board/components/BoardPageTitle";
import BoardLayout from "../../features/board/layout/BoardLayout";

export default function BoardNoticePage(props) {
  return (
    <BoardLayout activeSection="notice" {...props}>
      <VStack align="stretch" spacing={5}>
        <HStack justify="space-between" align="flex-start">
          <BoardPageTitle title="공지사항" description="중요한 소식과 안내를 확인하세요." />
          <HStack><Select bg="white" maxW="120px"><option>전체</option></Select><Input bg="white" maxW="260px" placeholder="제목 검색" /></HStack>
        </HStack>
        <Box bg="white" borderWidth="1px" borderRadius="lg" overflow="hidden">
          <Table><Thead bg="gray.50"><Tr><Th w="100px">번호</Th><Th>제목</Th><Th w="140px">작성자</Th><Th w="160px">등록일</Th><Th w="100px">조회</Th></Tr></Thead>
            <Tbody><Tr><Td>1</Td><Td><Badge mr={2} colorScheme="red">중요</Badge>공지사항 데이터 연결 예정</Td><Td>관리자</Td><Td>-</Td><Td>0</Td></Tr></Tbody>
          </Table>
        </Box>
      </VStack>
    </BoardLayout>
  );
}
