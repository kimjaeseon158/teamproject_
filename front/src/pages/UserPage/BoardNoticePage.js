import { Box, Button, Center, HStack, Input, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import BoardPageTitle from "../../features/board/components/BoardPageTitle";
import BoardLayout from "../../features/board/layout/BoardLayout";
import useBoardNotices from "../../features/board/notices/hook/useBoardNotices";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("ko-KR");
};

export default function BoardNoticePage(props) {
  const navigate = useNavigate();
  const { results, count, error, filters, loading, page, search, setFilters, setPage, totalPages } = useBoardNotices();
  const updateFilter = (key) => (event) => setFilters((current) => ({ ...current, [key]: event.target.value }));
  const submitSearch = (event) => { event.preventDefault(); search(); };

  return (
    <BoardLayout activeSection="notice" {...props}>
      <VStack align="stretch" spacing={5}>
        <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3}>
          <BoardPageTitle title="공지사항" description="중요한 소식과 안내를 확인하세요." />
          <Button colorScheme="blue" onClick={() => navigate("/note/notices/new")}>공지 작성</Button>
        </HStack>
        <HStack as="form" onSubmit={submitSearch} spacing={2} flexWrap="wrap">
          <Input bg="white" maxW="260px" placeholder="제목 검색" value={filters.title} onChange={updateFilter("title")} />
          <Input bg="white" maxW="220px" placeholder="작성자 검색" value={filters.author} onChange={updateFilter("author")} />
          <Button type="submit" colorScheme="teal">검색</Button>
        </HStack>
        <Box bg="white" borderWidth="1px" borderRadius="lg" overflowX="auto">
          {loading ? <Center minH="220px"><Spinner size="lg" /></Center>
            : error ? <Center minH="220px"><Text color="red.500">공지사항 조회에 실패했습니다.</Text></Center>
            : results.length === 0 ? <Center minH="220px"><Text color="gray.500">등록된 공지사항이 없습니다.</Text></Center>
            : <Table><Thead bg="gray.50"><Tr><Th w="100px">번호</Th><Th>제목</Th><Th w="160px">작성자</Th><Th w="180px">등록일</Th></Tr></Thead>
                <Tbody>{results.map((notice, index) => (
                  <Tr key={notice.notice_uuid} cursor="pointer" _hover={{ bg: "gray.50" }} onClick={() => navigate(`/note/notices/${notice.notice_uuid}`)}>
                    <Td>{count - (page - 1) * 20 - index}</Td><Td fontWeight="600">{notice.title}</Td><Td>{notice.author_name}</Td><Td>{formatDate(notice.created_at)}</Td>
                  </Tr>
                ))}</Tbody></Table>}
        </Box>
        {!loading && !error && count > 0 && <HStack justify="center">
          <Button size="sm" isDisabled={page <= 1} onClick={() => setPage(page - 1)}>이전</Button>
          <Text fontSize="sm">{page} / {totalPages}</Text>
          <Button size="sm" isDisabled={page >= totalPages} onClick={() => setPage(page + 1)}>다음</Button>
        </HStack>}
      </VStack>
    </BoardLayout>
  );
}
