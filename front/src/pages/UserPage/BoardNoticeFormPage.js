import { Badge, Box, Button, Divider, Flex, FormControl, FormErrorMessage, FormLabel, Grid, GridItem, HStack, Icon, Input, Text, VStack, SimpleGrid, Image, IconButton, useToast } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import sanitizeNoticeHtml from "../../features/board/notices/utils/sanitizeNoticeHtml";
import { prepareNoticeContent } from "../../features/board/notices/utils/noticeImages";
import { useNavigate, useParams } from "react-router-dom";
import { FiEdit3, FiUser, FiX } from "react-icons/fi";

import BoardPageTitle from "../../features/board/components/BoardPageTitle";
import BoardLayout from "../../features/board/layout/BoardLayout";
import { createNotice, deleteNoticeImage, fetchNotice, updateNotice } from "../../features/board/notices/api/boardNotices";
import { useUser } from "../../features/auth/userContext";
import NoticeRichTextEditor, { NOTICE_CONTENT_LIMIT } from "../../features/board/notices/components/NoticeRichTextEditor";

export default function BoardNoticeFormPage() {
  const { noticeUuid } = useParams();
  const editing = Boolean(noticeUuid);
  const navigate = useNavigate();
  const toast = useToast();
  const { loginType, userName } = useUser();
  const [values, setValues] = useState({ title: "", content: "" });
  const [contentMeta, setContentMeta] = useState({ isEmpty: true, textLength: 0 });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const previewUrls = useRef([]);
  useEffect(() => () => previewUrls.current.forEach(URL.revokeObjectURL), []);
  const addImages = (files) => {
    const available = 5 - existingImages.length - selectedImages.length;
    if (files.length > available || files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      toast({ title: "이미지는 총 5개까지, JPEG·PNG·WebP 파일당 5MB 이하로 선택해주세요.", status: "warning" });
      return [];
    }
    files.forEach((file) => {
      file.noticeRef = `new:${crypto.randomUUID()}`;
      file.previewUrl = URL.createObjectURL(file);
      previewUrls.current.push(file.previewUrl);
    });
    setSelectedImages((current) => [...current, ...files]);
    return files.map((file) => ({ imageRef: file.noticeRef, src: file.previewUrl }));
  };
  const removeInlineImage = (ref) => {
    setValues((current) => {
      const doc = new DOMParser().parseFromString(current.content, "text/html");
      doc.querySelectorAll("img").forEach((image) => {
        if (image.getAttribute("data-notice-image") === ref) image.remove();
      });
      const text = doc.body.textContent || "";
      setContentMeta({ isEmpty: !text.trim() && !doc.querySelector("img"), textLength: text.length });
      return { ...current, content: doc.body.innerHTML };
    });
  };

  useEffect(() => {
    if (!editing || !loginType) return;
    let active = true;
    setLoading(true);
    fetchNotice({ loginType, noticeUuid }, { toast })
      .then((notice) => {
        if (!active) return;
        setValues({ title: notice.title, content: sanitizeNoticeHtml(notice.content, notice.images) });
        setExistingImages(notice.images || []);
        const text = new DOMParser().parseFromString(notice.content || "", "text/html").body.textContent || "";
        setContentMeta({ isEmpty: !text.trim() && !sanitizeNoticeHtml(notice.content, notice.images).includes("<img"), textLength: text.length });
      })
      .catch((error) => {
        toast({ title: "공지사항을 불러오지 못했습니다.", description: error.message, status: "error" });
        if (error.status === 404) navigate("/note", { replace: true });
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [editing, loginType, navigate, noticeUuid, toast]);

  const changeValue = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const changeContent = ({ html, isEmpty, textLength }) => {
    setValues((current) => ({ ...current, content: html }));
    setContentMeta({ isEmpty, textLength });
    setErrors((current) => ({ ...current, content: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = "제목을 입력해주세요.";
    if (contentMeta.isEmpty) nextErrors.content = "본문을 입력해주세요.";
    else if (contentMeta.textLength > NOTICE_CONTENT_LIMIT) nextErrors.content = `본문은 ${NOTICE_CONTENT_LIMIT.toLocaleString()}자 이내로 입력해주세요.`;
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);

    setSaving(true);
    try {
      const savedContent = prepareNoticeContent(values.content, existingImages, selectedImages);
      const payload = selectedImages.length ? (() => { const form = new FormData(); form.append("title", values.title.trim()); form.append("content", savedContent); selectedImages.forEach((file) => form.append("images", file)); return form; })() : { title: values.title.trim(), content: savedContent };
      const notice = editing
        ? await updateNotice({ loginType, noticeUuid, values: payload }, { toast })
        : await createNotice({ loginType, values: payload }, { toast });
      toast({ title: editing ? "공지사항이 수정되었습니다." : "공지사항이 등록되었습니다.", status: "success" });
      navigate(notice?.notice_uuid ? `/note/notices/${notice.notice_uuid}` : "/note", { replace: true });
    } catch (error) {
      if (error.status === 400 && error.data) {
        setErrors({
          title: Array.isArray(error.data.title) ? error.data.title[0] : error.data.title,
          content: Array.isArray(error.data.content) ? error.data.content[0] : error.data.content,
        });
      }
      toast({ title: editing ? "수정에 실패했습니다." : "등록에 실패했습니다.", description: error.message, status: "error" });
    } finally { setSaving(false); }
  };

  return <BoardLayout activeSection="notice">
    <Box as="form" onSubmit={submit} maxW="1200px" mx="auto">
      <Grid templateColumns={{ base: "1fr", lg: "minmax(0, 3fr) minmax(280px, 1fr)" }} gap={5} alignItems="start">
        <GridItem bg="white" borderWidth="1px" borderRadius="xl" boxShadow="sm" overflow="hidden">
          <Flex px={{ base: 5, md: 7 }} py={5} align="center" gap={3} borderBottomWidth="1px">
            <Flex w="44px" h="44px" bg="blue.50" color="blue.500" borderRadius="lg" align="center" justify="center">
              <Icon as={FiEdit3} boxSize={5} />
            </Flex>
            <BoardPageTitle title={editing ? "공지사항 수정" : "새 공지 작성"} />
          </Flex>

          <VStack p={{ base: 5, md: 7 }} spacing={6} align="stretch">
            <FormControl isInvalid={Boolean(errors.title)} isRequired>
              <HStack justify="space-between" mb={2} align="center">
                <FormLabel m={0}>제목</FormLabel>
                <Text fontSize="xs" color={values.title.length >= 90 ? "orange.500" : "gray.400"}>{values.title.length} / 100</Text>
              </HStack>
              <Input value={values.title} onChange={changeValue("title")} maxLength={100} isDisabled={loading} placeholder="공지 제목을 입력하세요" size="lg" bg="gray.50" _focus={{ bg: "white", borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)" }} />
              <FormErrorMessage>{errors.title}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={Boolean(errors.content)} isRequired>
              <FormLabel>내용</FormLabel>
              <NoticeRichTextEditor content={values.content} onChange={changeContent} onAddImages={addImages} disabled={loading || saving} isInvalid={Boolean(errors.content)} />
              <FormErrorMessage>{errors.content}</FormErrorMessage>
            </FormControl>
            <FormControl><FormLabel>첨부 이미지 ({existingImages.length + selectedImages.length}/5)</FormLabel><Input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={existingImages.length + selectedImages.length >= 5} onChange={(event) => { addImages(Array.from(event.target.files || [])); event.target.value = ""; }} /><SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mt={3}>{existingImages.map((image) => <Box key={image.image_uuid} position="relative"><Image src={image.image_url} alt="첨부 이미지" h="90px" w="100%" objectFit="cover" borderRadius="md" /><IconButton aria-label="이미지 삭제" icon={<FiX />} size="xs" position="absolute" top={1} right={1} onClick={async () => { if (!window.confirm("이 이미지를 삭제하시겠습니까?")) return; await deleteNoticeImage({ loginType, noticeUuid, imageUuid: image.image_uuid }, { toast }); removeInlineImage(`order:${image.display_order}`); setExistingImages((items) => items.filter((item) => item.image_uuid !== image.image_uuid)); }} /></Box>)}{selectedImages.map((file, index) => <Box key={`${file.name}-${index}`} position="relative"><Image src={file.previewUrl} alt="새 이미지" h="90px" w="100%" objectFit="cover" borderRadius="md" /><IconButton aria-label="이미지 제거" icon={<FiX />} size="xs" position="absolute" top={1} right={1} onClick={() => { removeInlineImage(file.noticeRef); setSelectedImages((items) => items.filter((_, itemIndex) => itemIndex !== index)); }} /></Box>)}</SimpleGrid><Text fontSize="xs" color="gray.500" mt={1}>JPEG·PNG·WebP, 파일당 5MB 이하</Text></FormControl>
          </VStack>
        </GridItem>

        <GridItem><VStack spacing={4} align="stretch">
          <SideCard icon={FiUser} title="작성자" color="blue.500">
            <HStack justify="space-between"><Text color="gray.500" fontSize="sm">이름</Text><Text fontWeight="700" fontSize="sm">{userName || "-"}</Text></HStack>
            <HStack justify="space-between"><Text color="gray.500" fontSize="sm">권한</Text><Badge colorScheme={loginType === "admin" ? "blue" : "teal"}>{loginType === "admin" ? "관리자" : "사용자"}</Badge></HStack>
          </SideCard>

        </VStack></GridItem>
      </Grid>

      <Flex mt={5} bg="white" borderWidth="1px" borderRadius="xl" boxShadow="sm" p={4} justify="flex-end" gap={3} position="sticky" bottom={3} zIndex={2}>
        <Button variant="outline" minW="110px" onClick={() => navigate(-1)}>취소</Button>
        <Button type="submit" colorScheme="blue" minW="140px" isLoading={saving || loading}>{editing ? "수정 완료" : "공지 등록"}</Button>
      </Flex>
    </Box>
  </BoardLayout>;
}

function SideCard({ icon, title, color, children }) {
  return <Box bg="white" borderWidth="1px" borderRadius="xl" boxShadow="sm" p={5}>
    <HStack color={color} fontWeight="800" mb={4}><Icon as={icon} /><Text>{title}</Text></HStack>
    <Divider mb={4} />
    <VStack align="stretch" spacing={3}>{children}</VStack>
  </Box>;
}
