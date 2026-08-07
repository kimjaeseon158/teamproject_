import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
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

const DEFAULT_REGIONS = [
  { id: 1, name: "구역 1", start: 0, end: 25, color: "blue.400" },
  { id: 2, name: "구역 2", start: 25, end: 50, color: "orange.400" },
  { id: 3, name: "구역 3", start: 50, end: 75, color: "green.400" },
  { id: 4, name: "구역 4", start: 75, end: 100, color: "purple.400" },
];

const REGION_COLORS = ["blue.400", "orange.400", "green.400", "purple.400", "pink.400"];

const loadBrowserImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("근무표 이미지를 읽을 수 없습니다."));
    image.src = url;
  });

const cropWhiteImageMargins = async (url) => {
  const image = await loadBrowserImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return url;

  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let left = canvas.width;
  let top = canvas.height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const offset = (y * canvas.width + x) * 4;
      const isContent =
        data[offset + 3] > 16 &&
        (data[offset] < 248 || data[offset + 1] < 248 || data[offset + 2] < 248);

      if (isContent) {
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }
  }

  if (right < left || bottom < top) return url;

  const padding = 8;
  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(canvas.width - 1, right + padding);
  bottom = Math.min(canvas.height - 1, bottom + padding);

  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = right - left + 1;
  croppedCanvas.height = bottom - top + 1;
  croppedCanvas
    .getContext("2d")
    ?.drawImage(
      canvas,
      left,
      top,
      croppedCanvas.width,
      croppedCanvas.height,
      0,
      0,
      croppedCanvas.width,
      croppedCanvas.height
    );

  const croppedBlob = await new Promise((resolve) =>
    croppedCanvas.toBlob(resolve, "image/png")
  );
  if (!croppedBlob) return url;

  const croppedUrl = URL.createObjectURL(croppedBlob);
  URL.revokeObjectURL(url);
  return croppedUrl;
};

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
  const [viewMode, setViewMode] = useState("split");
  const [regions, setRegions] = useState(DEFAULT_REGIONS);
  const [selectedRegionId, setSelectedRegionId] = useState(1);
  const [isRegionEditing, setIsRegionEditing] = useState(false);
  const [draftRegion, setDraftRegion] = useState(null);

  const pageCount = useMemo(() => schedule?.pages?.length || 0, [schedule]);
  const selectedRegionIndex = Math.max(
    0,
    regions.findIndex((region) => region.id === selectedRegionId)
  );
  const selectedRegion = regions[selectedRegionIndex] || DEFAULT_REGIONS[0];

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

      const sourceUrls = await Promise.all(
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
      const urls = await Promise.all(
        sourceUrls.map(async (url) => {
          try {
            return await cropWhiteImageMargins(url);
          } catch {
            return url;
          }
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
    setSelectedRegionId(regions[0]?.id || 1);
    loadSchedule(date || todayValue());
  };

  const isSplitView = viewMode === "split";

  const selectRegionByIndex = (index) => {
    const region = regions[index];
    if (region) setSelectedRegionId(region.id);
  };

  const getPointerPercent = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100));
  };

  const finishRegionDrawing = (event) => {
    if (!draftRegion) return;

    const pointer = getPointerPercent(event);
    const start = Math.min(draftRegion.anchor, pointer);
    const end = Math.max(draftRegion.anchor, pointer);
    setDraftRegion(null);

    if (end - start < 3) return;

    const id = Date.now();
    const nextRegion = {
      id,
      name: `구역 ${regions.length + 1}`,
      start,
      end,
      color: REGION_COLORS[regions.length % REGION_COLORS.length],
    };
    setRegions((current) => [...current, nextRegion].sort((a, b) => a.start - b.start));
    setSelectedRegionId(id);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement={placement || "right"}
      size="full"
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
                <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
                  <Text fontSize="sm" color="gray.500">
                    총 {pageCount}개 페이지가 읽기 전용 이미지로 표시됩니다.
                  </Text>
                  <ButtonGroup size="xs" isAttached variant="outline">
                    <Button
                      colorScheme={viewMode === "split" ? "blue" : "gray"}
                      variant={viewMode === "split" ? "solid" : "outline"}
                      onClick={() => setViewMode("split")}
                    >
                      구역 보기
                    </Button>
                    <Button
                      colorScheme={viewMode === "full" ? "blue" : "gray"}
                      variant={viewMode === "full" ? "solid" : "outline"}
                      onClick={() => setViewMode("full")}
                    >
                      전체 보기
                    </Button>
                  </ButtonGroup>
                </HStack>

                {isSplitView && (
                  <Box
                    position="sticky"
                    top="0"
                    zIndex="2"
                    w="100%"
                    maxW={{ base: "100%", md: "1280px" }}
                    mx="auto"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    p={2}
                  >
                    {placement === "bottom" ? (
                      <HStack justify="space-between">
                        <Button
                          size="sm"
                          variant="ghost"
                          isDisabled={selectedRegionIndex === 0}
                          onClick={() => selectRegionByIndex(selectedRegionIndex - 1)}
                        >
                          이전
                        </Button>
                        <Text fontSize="sm" fontWeight="800">
                          {selectedRegion.name} · {selectedRegionIndex + 1} / {regions.length}
                        </Text>
                        <Button
                          size="sm"
                          variant="ghost"
                          isDisabled={selectedRegionIndex === regions.length - 1}
                          onClick={() => selectRegionByIndex(selectedRegionIndex + 1)}
                        >
                          다음
                        </Button>
                      </HStack>
                    ) : (
                      <VStack spacing={2}>
                        <ButtonGroup size="sm" isAttached variant="outline" w="100%">
                          {regions.map((region) => (
                            <Button
                              key={region.id}
                              flex="1"
                              colorScheme={selectedRegionId === region.id ? "blue" : "gray"}
                              variant={selectedRegionId === region.id ? "solid" : "outline"}
                              onClick={() => setSelectedRegionId(region.id)}
                            >
                              {region.name}
                            </Button>
                          ))}
                        </ButtonGroup>
                        <HStack justify="space-between" w="100%">
                          <Text fontSize="sm" fontWeight="800">
                            {selectedRegion.name} · {Math.round(selectedRegion.end - selectedRegion.start)}%
                          </Text>
                          <ButtonGroup size="xs" variant="outline">
                            <Button
                              colorScheme={isRegionEditing ? "blue" : "gray"}
                              onClick={() => {
                                setIsRegionEditing((current) => !current);
                                setDraftRegion(null);
                              }}
                            >
                              {isRegionEditing ? "설정 완료" : "영역 설정"}
                            </Button>
                            {isRegionEditing && (
                              <Button
                                onClick={() => {
                                  setRegions([]);
                                  setSelectedRegionId(null);
                                }}
                              >
                                모두 지우기
                              </Button>
                            )}
                            <Button
                              onClick={() => {
                                setRegions(DEFAULT_REGIONS);
                                setSelectedRegionId(1);
                                setDraftRegion(null);
                              }}
                            >
                              4등분 복원
                            </Button>
                          </ButtonGroup>
                        </HStack>
                      </VStack>
                    )}
                  </Box>
                )}

                {imageUrls.map((url, index) => (
                  <Box
                    key={url}
                    w="100%"
                    maxW={isSplitView ? { base: "100%", md: "1280px" } : "100%"}
                    mx="auto"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    overflow={isSplitView ? "hidden" : "auto"}
                    bg="gray.50"
                    maxH={
                      isSplitView && placement !== "bottom"
                        ? "none"
                        : "calc(100dvh - 230px)"
                    }
                  >
                    <Box px={3} py={2} bg="gray.100" borderBottom="1px solid" borderColor="gray.200">
                      <Text fontSize="sm" fontWeight="800">
                        페이지 {index + 1}
                        {isSplitView ? ` · ${selectedRegion.name}` : ""}
                      </Text>
                    </Box>
                    {isSplitView ? (
                      <Box
                        overflowX="hidden"
                        overflowY="auto"
                        maxH={{
                          base: "calc(100dvh - 285px)",
                          md: "calc(100dvh - 430px)",
                        }}
                      >
                        <Image
                          src={url}
                          alt={`근무표 페이지 ${index + 1} ${selectedRegion.name}`}
                          display="block"
                          w={`${10000 / Math.max(3, selectedRegion.end - selectedRegion.start)}%`}
                          maxW="none"
                          transform={`translateX(-${selectedRegion.start}%)`}
                          transformOrigin="top left"
                        />
                      </Box>
                    ) : (
                      <Image
                        src={url}
                        alt={`근무표 페이지 ${index + 1}`}
                        display="block"
                        w="auto"
                        maxW="none"
                        minW={{ base: "960px", md: "1280px" }}
                      />
                    )}
                    {isSplitView && placement !== "bottom" && (
                      <Box p={3} bg="white" borderTop="1px solid" borderColor="gray.200">
                        <Box
                          position="relative"
                          overflow="hidden"
                          borderRadius="md"
                          cursor={isRegionEditing ? "crosshair" : "default"}
                          touchAction="none"
                          onPointerDown={(event) => {
                            if (!isRegionEditing) return;
                            event.currentTarget.setPointerCapture(event.pointerId);
                            const anchor = getPointerPercent(event);
                            setDraftRegion({ anchor, current: anchor });
                          }}
                          onPointerMove={(event) => {
                            if (!draftRegion) return;
                            setDraftRegion((current) => ({
                              ...current,
                              current: getPointerPercent(event),
                            }));
                          }}
                          onPointerUp={(event) => {
                            finishRegionDrawing(event);
                            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                              event.currentTarget.releasePointerCapture(event.pointerId);
                            }
                          }}
                          onPointerCancel={() => setDraftRegion(null)}
                        >
                          <Image
                            src={url}
                            alt={`근무표 페이지 ${index + 1} 전체 위치`}
                            display="block"
                            w="100%"
                          />
                          {regions.map((region) => (
                            <Box
                              key={region.id}
                              position="absolute"
                              top="0"
                              bottom="0"
                              left={`${region.start}%`}
                              w={`${region.end - region.start}%`}
                              border="3px solid"
                              borderColor={
                                selectedRegionId === region.id ? "blue.600" : region.color
                              }
                              bg={region.color}
                              opacity={selectedRegionId === region.id ? 0.45 : 0.2}
                              cursor={isRegionEditing ? "crosshair" : "pointer"}
                              onPointerDown={(event) => {
                                if (isRegionEditing) return;
                                event.stopPropagation();
                                setSelectedRegionId(region.id);
                              }}
                            >
                              <Text
                                position="absolute"
                                top="2px"
                                left="4px"
                                fontSize="10px"
                                fontWeight="900"
                                color="gray.900"
                              >
                                {region.name}
                              </Text>
                            </Box>
                          ))}
                          {draftRegion && (
                            <Box
                              position="absolute"
                              top="0"
                              bottom="0"
                              left={`${Math.min(draftRegion.anchor, draftRegion.current)}%`}
                              w={`${Math.abs(draftRegion.current - draftRegion.anchor)}%`}
                              border="3px dashed"
                              borderColor="red.500"
                              bg="red.100"
                              opacity="0.55"
                              pointerEvents="none"
                            />
                          )}
                        </Box>
                        <Text mt={2} fontSize="xs" color="gray.500">
                          {isRegionEditing
                            ? "전체표 위에서 원하는 구간을 좌우로 드래그해 영역을 추가하세요."
                            : "색상 영역을 선택하면 해당 범위를 확대해서 표시합니다."}
                        </Text>
                      </Box>
                    )}
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
