import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Image,
  Input,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
  useToast,
  useBreakpointValue,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";

import {
  fetchUserWorkSchedule,
  fetchUserWorkScheduleImageUrl,
  fetchUserWorkSchedulePageImage,
} from "../api/userWorkSchedule";

const todayValue = () => new Date().toISOString().slice(0, 10);

const getScheduleUuid = (schedule) =>
  schedule?.schedule_uuid || schedule?.uuid || schedule?.id;

export default function WorkSchedulePreviewPanel({
  isOpen,
  onClose,
  selectedDate,
}) {
  const toast = useToast();
  const placement = useBreakpointValue({ base: "bottom", md: "right" });
  const imageUrlsRef = useRef([]);
  const [date, setDate] = useState(selectedDate?.formatted || "");
  const [schedule, setSchedule] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const pageCount = useMemo(() => schedule?.pages?.length || 0, [schedule]);

  useEffect(() => {
    setDate(selectedDate?.formatted || "");
  }, [selectedDate?.formatted]);

  const clearImageUrls = useCallback(() => {
    imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    imageUrlsRef.current = [];
    setImageUrls([]);
  }, []);

  useEffect(() => () => {
    imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const loadSchedule = useCallback(async (targetDate) => {
    try {
      setLoading(true);
      setNotFound(false);
      clearImageUrls();

      const data = await fetchUserWorkSchedule(targetDate, { toast });
      const scheduleUuid = getScheduleUuid(data);
      const pages = data.pages || [];

      if (pages.length === 0) {
        setSchedule(data);
        setNotFound(true);
        return;
      }

      const urls = await Promise.all(
        pages.map((page) => {
          if (page.image_url) {
            return fetchUserWorkScheduleImageUrl(page.image_url, { toast });
          }

          if (!scheduleUuid) {
            throw new Error("근무표 이미지 식별자가 없습니다.");
          }

          return fetchUserWorkSchedulePageImage(scheduleUuid, page.page_number, { toast });
        })
      );

      imageUrlsRef.current = urls;
      setImageUrls(urls);
      setSchedule(data);
    } catch (error) {
      setSchedule(null);
      setNotFound(true);
      if (!String(error.message || "").includes("404")) {
        toast({
          title: "근무표를 불러오지 못했습니다.",
          description: error.message,
          status: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [clearImageUrls, toast]);

  useEffect(() => {
    if (isOpen) loadSchedule();
  }, [isOpen, loadSchedule]);

  const handleSearch = () => {
    loadSchedule(date || todayValue());
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement={placement || "right"}
      size={placement === "bottom" ? "full" : "xl"}
    >
      <DrawerOverlay />
      <DrawerContent
        bg="white"
        maxH={placement === "bottom" ? "92dvh" : undefined}
        borderTopRadius={placement === "bottom" ? "28px" : undefined}
        overflow="hidden"
      >
        <DrawerCloseButton top={4} right={4} />
        <DrawerHeader borderBottomWidth="1px" py={5} pr={14}>
          근무표 조회
        </DrawerHeader>

        <DrawerBody px={{ base: 4, md: 6 }} py={5}>
          <VStack align="stretch" spacing={4}>
            <HStack
              justify="space-between"
              align={{ base: "stretch", lg: "center" }}
              flexDirection={{ base: "column", lg: "row" }}
              gap={3}
            >
              <Box minW={0}>
                <HStack flexWrap="wrap" gap={2}>
                  <Text fontSize="lg" fontWeight="900" color="gray.800">
                    읽기 전용 근무표
                  </Text>
                  {schedule?.schedule_date && (
                    <Badge colorScheme="blue" borderRadius="full">
                      {schedule.schedule_date}
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  최신 근무표를 기본으로 표시하고, 날짜를 선택하면 해당 날짜 근무표를 조회합니다.
                </Text>
              </Box>

              <HStack
                w={{ base: "100%", lg: "auto" }}
                justify={{ base: "stretch", lg: "flex-end" }}
                spacing={2}
              >
                <Input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  maxW={{ base: "none", lg: "170px" }}
                  size="sm"
                  flex="1"
                />
                <Button
                  leftIcon={<RepeatIcon />}
                  colorScheme="blue"
                  size="sm"
                  onClick={handleSearch}
                  isLoading={loading}
                  minW="76px"
                >
                  조회
                </Button>
              </HStack>
            </HStack>

            {loading && (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                <Skeleton h="360px" borderRadius="lg" />
                <Skeleton h="360px" borderRadius="lg" />
              </SimpleGrid>
            )}

            {!loading && notFound && (
              <Box bg="gray.50" borderRadius="lg" p={6} textAlign="center" color="gray.500">
                해당 날짜의 근무표가 없습니다.
              </Box>
            )}

            {!loading && imageUrls.length > 0 && (
              <VStack align="stretch" spacing={4}>
                <Text fontSize="sm" color="gray.500">
                  총 {pageCount}개 페이지가 읽기 전용 이미지로 표시됩니다.
                </Text>
                {imageUrls.map((url, index) => (
                  <Box
                    key={url}
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    overflow="auto"
                    bg="gray.50"
                    maxH="760px"
                  >
                    <Box px={3} py={2} bg="gray.100" borderBottom="1px solid" borderColor="gray.200">
                      <Text fontSize="sm" fontWeight="800">페이지 {index + 1}</Text>
                    </Box>
                    <Image src={url} alt={`근무표 페이지 ${index + 1}`} w="100%" minW="720px" />
                  </Box>
                ))}
              </VStack>
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
