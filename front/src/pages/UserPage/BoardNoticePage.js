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
      <VStack align="stretch" spacing={5} maxW="1120px" mx="auto">
        <HStack display={{ base: "none", md: "flex" }} justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <BoardPageTitle title="공지사항" />
          <Button size="sm" colorScheme="blue" onClick={() => navigate("/note/notices/new")}>공지 작성</Button>
        </HStack>
        <HStack display={{ base: "none", md: "flex" }} as="form" onSubmit={submitSearch} spacing={2} flexWrap="wrap" align="stretch" bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="lg" p={3}>
          <Input flex={{ base: "1 1 100%", md: "0 1 auto" }} minW={0} bg="white" maxW={{ base: "none", md: "260px" }} placeholder="제목 검색" value={filters.title} onChange={updateFilter("title")} />
          <Input flex={{ base: "1 1 calc(100% - 70px)", md: "0 1 auto" }} minW={0} bg="white" maxW={{ base: "none", md: "220px" }} placeholder="작성자 검색" value={filters.author} onChange={updateFilter("author")} />
          <Button flexShrink={0} type="submit" colorScheme="teal">검색</Button>
        </HStack>
        <Box display={{ base: "block", md: "none" }}>
          <HStack justify="space-between" align="center" mb={4}>
            <BoardPageTitle title="공지사항" />
            <Button size="sm" colorScheme="blue" onClick={() => navigate("/note/notices/new")}>공지 작성</Button>
          </HStack>
          <HStack as="form" onSubmit={submitSearch} spacing={2} mb={3}>
            <Input flex="1" minW={0} bg="white" placeholder="제목 또는 작성자 검색" value={filters.title} onChange={updateFilter("title")} />
            <Button type="submit" colorScheme="teal">검색</Button>
          </HStack>
          <HStack spacing={2} overflowX="auto" pb={1} mb={4}>
            {["전체", "안전", "근무"].map((label, index) => <Button key={label} size="sm" flexShrink={0} borderRadius="full" colorScheme={index === 0 ? "blue" : "gray"} variant={index === 0 ? "solid" : "outline"} bg={index === 0 ? undefined : "white"}>{label}</Button>)}
          </HStack>
          {loading ? <Center minH="220px"><Spinner size="lg" /></Center>
            : error ? <Center minH="220px"><Text color="red.500">공지사항 조회에 실패했습니다.</Text></Center>
            : results.length === 0 ? <Center minH="220px"><Text color="gray.500">등록된 공지사항이 없습니다.</Text></Center>
            : <VStack align="stretch" spacing={3}>{results.map((notice) => <Box key={notice.notice_uuid} bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="xl" p={4} cursor="pointer" _active={{ bg: "blue.50" }} onClick={() => navigate(`/note/notices/${notice.notice_uuid}`)}>
              <Text fontSize="md" fontWeight="800" lineHeight="1.5" wordBreak="keep-all" overflowWrap="anywhere">{notice.title}</Text>
              <Text mt={2} fontSize="xs" color="gray.500">{notice.author_name} · {formatDate(notice.created_at)} <Text as="span" float="right" fontSize="lg" lineHeight="short">›</Text></Text>
            </Box>)}</VStack>}
        </Box>
        <Box display={{ base: "none", md: "block" }} bg="white" borderWidth="1px" borderColor="gray.200" borderRadius="lg" overflowX="auto" boxShadow="sm">
          <Box display={{ base: "none", md: "block" }}>
          {loading ? <Center minH="220px"><Spinner size="lg" /></Center>
            : error ? <Center minH="220px"><Text color="red.500">공지사항 조회에 실패했습니다.</Text></Center>
            : results.length === 0 ? <Center minH="220px"><Text color="gray.500">등록된 공지사항이 없습니다.</Text></Center>
            : <Table sx={{ tableLayout: "fixed" }}><Thead bg="gray.50"><Tr><Th px={6}>제목</Th><Th w={{ base: "90px", md: "160px" }}>작성자</Th><Th w={{ base: "90px", md: "180px" }}>등록일</Th></Tr></Thead>
                <Tbody>{results.map((notice, index) => (
                  <Tr key={notice.notice_uuid} cursor="pointer" _hover={{ bg: "gray.50" }} onClick={() => navigate(`/note/notices/${notice.notice_uuid}`)}>
                    <Td px={6} fontWeight="600" whiteSpace="normal" overflowWrap="anywhere" wordBreak="keep-all">{notice.title}</Td><Td whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{notice.author_name}</Td><Td whiteSpace="nowrap">{formatDate(notice.created_at)}</Td>
                  </Tr>
                ))}</Tbody></Table>}
          </Box>
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
