import { Badge, Box, Button, Center, Divider, Grid, GridItem, HStack, Spinner, Text, VStack, useToast } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import BoardLayout from "../../features/board/layout/BoardLayout";
import { deleteNotice, fetchNotice, markNoticeRead } from "../../features/board/notices/api/boardNotices";
import { useUser } from "../../features/auth/userContext";
import { noticeContentStyles } from "../../features/board/notices/components/NoticeRichTextEditor";
import sanitizeNoticeHtml from "../../features/board/notices/utils/sanitizeNoticeHtml";
import useBoardNotices from "../../features/board/notices/hook/useBoardNotices";

const formatDateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("ko-KR");
};
const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("ko-KR");
};

export default function BoardNoticeDetailPage() {
  const { noticeUuid } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { loginType, userName, markNoticeAsRead } = useUser();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const noticeList = useBoardNotices();

  useEffect(() => {
    if (!loginType) return;
    let active = true;
    setLoading(true);
    fetchNotice({ loginType, noticeUuid }, { toast })
      .then(async (loadedNotice) => {
        if (!active) return;
        setNotice(loadedNotice);
        if (loginType === "user") {
          try {
            await markNoticeRead({ noticeUuid }, { toast });
            markNoticeAsRead(loadedNotice.title);
          } catch (error) {
            toast({ title: "공지 읽음 처리에 실패했습니다.", description: error.message, status: "error" });
          }
        }
      })
      .catch((error) => {
        if (error.status === 404) setNotFound(true);
        else toast({ title: "공지사항을 불러오지 못했습니다.", description: error.message, status: "error" });
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [loginType, markNoticeAsRead, noticeUuid, toast]);

  const canManage = useMemo(() => {
    if (!notice) return false;
    if (loginType === "admin") return true;
    return notice.author_type === "user" && notice.author_name === userName;
  }, [loginType, notice, userName]);

  const remove = async () => {
    if (!window.confirm("이 공지사항을 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      await deleteNotice({ loginType, noticeUuid }, { toast });
      toast({ title: "공지사항이 삭제되었습니다.", status: "success" });
      navigate("/note", { replace: true });
    } catch (error) {
      toast({ title: "삭제에 실패했습니다.", description: error.message, status: "error" });
    } finally { setDeleting(false); }
  };

  return <BoardLayout activeSection="notice">
    <Box maxW="1280px" mx="auto">
      {loading ? <Center minH="300px"><Spinner size="lg" /></Center>
        : notFound || !notice ? <Center minH="300px"><VStack><Text fontWeight="700">존재하지 않는 공지사항입니다.</Text><Button onClick={() => navigate("/note")}>목록으로</Button></VStack></Center>
        : <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 3fr) minmax(300px, 1fr)" }} gap={6} alignItems="start">
          <GridItem>
            <Box bg="white" borderWidth="1px" borderRadius="xl" boxShadow="sm" overflow="hidden">
              <HStack justify="space-between" align="flex-start" gap={4} p={{ base: 5, md: 8 }} pb={{ base: 5, md: 6 }}>
                <Box minW={0}>
                  <Text as="h1" fontSize={{ base: "xl", md: "2xl" }} fontWeight="800" color="gray.900" wordBreak="break-word">{notice.title}</Text>
                  <Text mt={2} fontSize="sm" color="gray.500">{notice.author_name} · {formatDateTime(notice.created_at)}</Text>
                </Box>
                <Button flexShrink={0} variant="outline" onClick={() => navigate("/note")}>목록</Button>
              </HStack>
              <Divider />
              <Box p={{ base: 5, md: 8 }} minH={{ base: "240px", md: "320px" }}>
                <Box className="tiptap" lineHeight="1.8" sx={noticeContentStyles} dangerouslySetInnerHTML={{ __html: sanitizeNoticeHtml(notice.content) }} />
              </Box>
              {canManage && <><Divider /><HStack justify="flex-end" p={4}>
                <Button colorScheme="red" variant="outline" isLoading={deleting} onClick={remove}>삭제</Button>
                <Button colorScheme="blue" onClick={() => navigate(`/note/notices/${noticeUuid}/edit`)}>수정</Button>
              </HStack></>}
            </Box>
          </GridItem>

          <GridItem position={{ lg: "sticky" }} top={{ lg: "24px" }}>
            <Box bg="white" borderWidth="1px" borderRadius="xl" boxShadow="sm" overflow="hidden">
              <HStack justify="space-between" px={5} py={4} borderBottomWidth="1px">
                <Text fontWeight="800">공지 목록</Text><Badge colorScheme="blue">전체 {noticeList.count}건</Badge>
              </HStack>
              <VStack align="stretch" spacing={0} maxH={{ base: "360px", lg: "620px" }} overflowY="auto">
                {noticeList.loading ? <Center py={10}><Spinner size="sm" /></Center>
                  : noticeList.results.length === 0 ? <Text py={10} textAlign="center" fontSize="sm" color="gray.500">등록된 공지가 없습니다.</Text>
                  : noticeList.results.map((item) => {
                    const active = item.notice_uuid === noticeUuid;
                    return <Box key={item.notice_uuid} px={5} py={4} cursor="pointer" bg={active ? "blue.50" : "white"} borderLeftWidth="3px" borderLeftColor={active ? "blue.500" : "transparent"} borderBottomWidth="1px" _hover={{ bg: active ? "blue.50" : "gray.50" }} onClick={() => navigate(`/note/notices/${item.notice_uuid}`)}>
                      <Text fontSize="sm" fontWeight={active ? "800" : "600"} color={active ? "blue.700" : "gray.800"} noOfLines={2}>{item.title}</Text>
                      <HStack mt={2} justify="space-between"><Text fontSize="xs" color="gray.500">{item.author_name}</Text><Text fontSize="xs" color="gray.400">{formatDate(item.created_at)}</Text></HStack>
                    </Box>;
                  })}
              </VStack>
              <Button w="full" borderRadius="0" variant="ghost" colorScheme="blue" size="sm" onClick={() => navigate("/note")}>전체보기</Button>
              {noticeList.count > 0 && <HStack justify="space-between" p={3} bg="gray.50">
                <Button size="xs" variant="ghost" isDisabled={noticeList.page <= 1} onClick={() => noticeList.setPage(noticeList.page - 1)}>이전</Button>
                <Text fontSize="xs" color="gray.500">{noticeList.page} / {noticeList.totalPages}</Text>
                <Button size="xs" variant="ghost" isDisabled={noticeList.page >= noticeList.totalPages} onClick={() => noticeList.setPage(noticeList.page + 1)}>다음</Button>
              </HStack>}
            </Box>
          </GridItem>
        </Grid>}
    </Box>
  </BoardLayout>;
}
