import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  IconButton,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { AttachmentIcon, DeleteIcon, DownloadIcon } from "@chakra-ui/icons";

import {
  createAdminWorkSchedule,
  deleteAdminWorkSchedule,
  downloadAdminWorkSchedule,
  fetchAdminWorkSchedules,
  updateAdminWorkSchedule,
} from "../api/adminWorkSchedules";

const todayValue = () => new Date().toISOString().slice(0, 10);

const getScheduleUuid = (schedule) =>
  schedule?.schedule_uuid || schedule?.uuid || schedule?.id;

const normalizeScheduleList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.schedules)) return data.schedules;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getFileName = (response, fallback) => {
  const disposition = response.headers.get("content-disposition") || "";
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match) return decodeURIComponent(utf8Match[1]);
  const match = disposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallback;
};

const saveDownload = async (response, fallbackName) => {
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getFileName(response, fallbackName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

function Step({ children, index, title }) {
  return (
    <HStack align="start" spacing={4}>
      <Box
        w="26px"
        h="26px"
        borderRadius="full"
        bg="green.500"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontWeight="900"
        fontSize="sm"
        flexShrink={0}
      >
        {index}
      </Box>
      <Box flex="1" minW={0}>
        <Text fontSize="md" fontWeight="900" color="gray.800" mb={3}>
          {title}
        </Text>
        {children}
      </Box>
    </HStack>
  );
}

export default function WorkplaceAssignmentExcelDrawer({ isOpen, onClose }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [date, setDate] = useState(todayValue);
  const [file, setFile] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const existingSchedule = useMemo(
    () => schedules.find((item) => item.schedule_date === date),
    [date, schedules]
  );
  const existingUuid = getScheduleUuid(existingSchedule);

  const loadSchedules = useCallback(async () => {
    try {
      setListLoading(true);
      const data = await fetchAdminWorkSchedules({ toast });
      setSchedules(normalizeScheduleList(data));
    } catch (error) {
      toast({ title: "근무표 목록을 불러오지 못했습니다.", description: error.message, status: "error" });
    } finally {
      setListLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) loadSchedules();
  }, [isOpen, loadSchedules]);

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
  };

  const handleSubmit = async () => {
    if (!date || !file) {
      toast({ title: "날짜와 .xlsx 파일을 선택하세요.", status: "warning" });
      return;
    }

    try {
      setLoading(true);
      if (existingUuid) {
        await updateAdminWorkSchedule(existingUuid, { file, scheduleDate: date }, { toast });
        toast({ title: "같은 날짜의 근무표를 교체했습니다.", status: "success" });
      } else {
        await createAdminWorkSchedule({ file, scheduleDate: date }, { toast });
        toast({ title: "새 근무표를 등록했습니다.", status: "success" });
      }
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await loadSchedules();
    } catch (error) {
      toast({ title: "근무표 저장에 실패했습니다.", description: error.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (schedule) => {
    const uuid = getScheduleUuid(schedule);
    if (!uuid) return;

    try {
      const response = await downloadAdminWorkSchedule(uuid, { toast });
      await saveDownload(
        response,
        schedule.original_file_name || `work_schedule_${schedule.schedule_date}.xlsx`
      );
    } catch (error) {
      toast({ title: "원본 다운로드에 실패했습니다.", description: error.message, status: "error" });
    }
  };

  const handleDelete = async (schedule) => {
    const uuid = getScheduleUuid(schedule);
    if (!uuid) return;

    try {
      setLoading(true);
      await deleteAdminWorkSchedule(uuid, { toast });
      toast({ title: "근무표를 삭제했습니다.", status: "success" });
      await loadSchedules();
    } catch (error) {
      toast({ title: "근무표 삭제에 실패했습니다.", description: error.message, status: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" py={5}>
          날짜별 근무표 관리
        </DrawerHeader>

        <DrawerBody px={7} py={6}>
          <VStack align="stretch" spacing={6}>
            <Step index={1} title="게시 날짜 선택">
              <Input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                maxW="240px"
                bg="white"
              />
              <Text fontSize="sm" color={existingSchedule ? "orange.600" : "gray.500"} mt={2}>
                {existingSchedule
                  ? "같은 날짜 근무표가 이미 있습니다. 저장하면 기존 파일을 안전하게 교체합니다."
                  : "선택한 날짜로 새 근무표를 등록합니다."}
              </Text>
            </Step>

            <Divider />

            <Step index={2} title=".xlsx 근무표 업로드">
              <Text fontSize="sm" color="gray.500" mb={3}>
                최대 20MB의 .xlsx 근무표를 업로드합니다. 서버에서 모든 시트를 이미지로 변환합니다.
              </Text>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                hidden
              />
              <HStack
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                p={3}
                justify="space-between"
              >
                <HStack minW={0}>
                  <AttachmentIcon color="green.500" />
                  <Text fontSize="sm" color={file ? "gray.800" : "gray.400"} noOfLines={1}>
                    {file?.name || "선택된 파일 없음"}
                  </Text>
                </HStack>
                <Button size="sm" onClick={() => fileRef.current?.click()}>
                  파일 선택
                </Button>
              </HStack>
              <Button
                mt={3}
                colorScheme={existingSchedule ? "orange" : "green"}
                isLoading={loading}
                onClick={handleSubmit}
                isDisabled={!file}
              >
                {existingSchedule ? "같은 날짜 근무표 교체" : "근무표 등록"}
              </Button>
            </Step>

            <Divider />

            <Step index={3} title="등록된 근무표">
              <Text fontSize="sm" color="gray.500" mb={3}>
                Admin은 원본 엑셀을 다운로드할 수 있고, 같은 날짜 자료를 완전히 삭제할 수 있습니다.
              </Text>
              <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
                <Table size="sm">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>게시 날짜</Th>
                      <Th>원본 파일</Th>
                      <Th isNumeric>크기</Th>
                      <Th>관리</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {schedules.length === 0 && (
                      <Tr>
                        <Td colSpan={4} color="gray.500" py={6} textAlign="center">
                          {listLoading ? "불러오는 중입니다." : "등록된 근무표가 없습니다."}
                        </Td>
                      </Tr>
                    )}
                    {schedules.map((schedule) => {
                      const uuid = getScheduleUuid(schedule);
                      return (
                        <Tr key={uuid || schedule.schedule_date}>
                          <Td fontWeight="800">
                            {schedule.schedule_date}
                            {schedule.schedule_date === date && (
                              <Badge ml={2} colorScheme="orange">선택됨</Badge>
                            )}
                          </Td>
                          <Td>{schedule.original_file_name || "-"}</Td>
                          <Td isNumeric>
                            {schedule.original_file_size
                              ? `${Math.round(schedule.original_file_size / 1024).toLocaleString()}KB`
                              : "-"}
                          </Td>
                          <Td>
                            <HStack spacing={1}>
                              <IconButton
                                aria-label="원본 다운로드"
                                icon={<DownloadIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="blue"
                                onClick={() => handleDownload(schedule)}
                              />
                              <IconButton
                                aria-label="근무표 삭제"
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                isDisabled={loading}
                                onClick={() => handleDelete(schedule)}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </Step>

            <Box bg="blue.50" border="1px solid" borderColor="blue.100" borderRadius="md" p={4}>
              <Text fontSize="sm" color="blue.800" fontWeight="700">
                User 화면에는 원본 엑셀이 아니라 변환된 이미지 페이지만 표시됩니다.
              </Text>
              <Text fontSize="xs" color="blue.700" mt={1}>
                원본 파일과 이미지 파일은 공개 URL로 제공하지 않고, 인증 API를 통해서만 조회합니다.
              </Text>
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
