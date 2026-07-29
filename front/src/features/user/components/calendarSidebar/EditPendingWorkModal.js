import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Switch,
  Text,
  VStack,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";

import { useUser } from "../../../auth/userContext";
import { EXTRA_WORK_TYPES, getExtraWorkTypeByLabel } from "../../../common/workTypes";
import { addMinutesToTime } from "../../../common/workTimeUtils";
import { fetchUserWorkPlaces } from "../../api/userWorkPlaces";
import { deleteWorkInfo, updateWorkInfo } from "../../api/updateWorkInfo";
import workTimeList from "../../data/workTimeList";
import { calculateNetMinutes, diffMinutes } from "../../utils/timeUtils";

const TEXT = {
  addExtra: "\ucd94\uac00\uadfc\ubb34\u0020\ucd94\uac00",
  delete: "\uc0ad\uc81c",
  deleteCancel: "\ucde8\uc18c",
  deleteConfirmAction: "\uc0ad\uc81c\ud558\uae30",
  deleteConfirmDescription: "\uc0ad\uc81c\u0020\ud6c4\uc5d0\ub294\u0020\ub418\ub3cc\ub9b4\u0020\uc218\u0020\uc5c6\uc2b5\ub2c8\ub2e4\u002e",
  deleteConfirmTitle: "\uc774\u0020\uadfc\ubb34\ub97c\u0020\uc0ad\uc81c\ud560\uae4c\uc694\u003f",
  deleteError: "\uadfc\ubb34\u0020\uc0ad\uc81c\uc5d0\u0020\uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4\u002e",
  deleteSuccess: "\uadfc\ubb34\u0020\ub0b4\uc5ed\uc774\u0020\uc0ad\uc81c\ub418\uc5c8\uc2b5\ub2c8\ub2e4\u002e",
  editDisabled: "\uc218\uc815\u0020\ubd88\uac00",
  extraDescription: "\uc794\uc5c5\u002c\u0020\uc911\uc2dd\uc5f0\uc7a5\u002c\u0020\uc870\uae30\ucd9c\uadfc\u0020\ub4f1\uc744\u0020\uc218\uc815\ud569\ub2c8\ub2e4\u002e",
  extraWork: "\ucd94\uac00\uadfc\ubb34",
  invalidForm: "\uadfc\ubb34\uc9c0\uc640\u0020\uadfc\ubb34\uc2dc\uac04\uc744\u0020\uc120\ud0dd\ud558\uc138\uc694\u002e",
  location: "\uadfc\ubb34\uc9c0",
  locationPlaceholder: "\uadfc\ubb34\uc9c0\u0020\uc120\ud0dd",
  pending: "\uc2b9\uc778\u0020\ub300\uae30",
  pendingOnly: "\uc2b9\uc778\u0020\ub300\uae30\u0020\uc0c1\ud0dc\uc758\u0020\uadfc\ubb34\ub9cc\u0020\uc218\uc815\ud560\u0020\uc218\u0020\uc788\uc2b5\ub2c8\ub2e4\u002e",
  save: "\uc218\uc815\u0020\uc800\uc7a5",
  saveError: "\uadfc\ubb34\u0020\uc218\uc815\uc5d0\u0020\uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4\u002e",
  saveSuccess: "\uadfc\ubb34\u0020\ub0b4\uc5ed\uc774\u0020\uc218\uc815\ub418\uc5c8\uc2b5\ub2c8\ub2e4\u002e",
  shift: "\uadfc\ubb34\uad6c\ubd84",
  special: "\ud2b9\uadfc",
  subtitle: "\uce98\ub9b0\ub354\uc5d0\uc11c\u0020\uc120\ud0dd\ud55c\u0020\uc2b9\uc778\u0020\ub300\uae30\u0020\uadfc\ubb34\uc785\ub2c8\ub2e4\u002e",
  time: "\uadfc\ubb34\uc2dc\uac04",
  title: "\uadfc\ubb34\u0020\uc218\uc815",
};

const DAY_SHIFT = "\uc8fc\uac04";
const NIGHT_SHIFT = "\uc57c\uac04";
const SPECIAL = "\ud2b9\uadfc";

const fieldStyle = {
  bg: "whiteAlpha.100",
  borderColor: "whiteAlpha.300",
  color: "white",
  borderRadius: "14px",
  h: "46px",
  _hover: { borderColor: "blue.300" },
  _focus: {
    borderColor: "blue.300",
    boxShadow: "0 0 0 1px var(--chakra-colors-blue-300)",
  },
  sx: {
    option: {
      background: "#1f1f22",
      color: "white",
    },
    "::-webkit-calendar-picker-indicator": {
      filter: "invert(1)",
      opacity: 0.85,
    },
  },
};

const toTime = (value, fallback = "") => {
  if (!value) return fallback;
  const match = String(value).match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : fallback;
};

const getWorkDayId = (work) => work?.work_day_id ?? work?.id ?? work?.work_id;

const getInitialShift = (work) => {
  const workType = work?.details?.[0]?.work_type || work?.work_type || "";
  if (workType.includes(NIGHT_SHIFT)) return NIGHT_SHIFT;
  return work?.work_shift || DAY_SHIFT;
};

const toExtraRows = (details = [], finishTime = "") =>
  details.slice(1).map((detail) => {
    const type = getExtraWorkTypeByLabel(detail.work_type)?.value || "weekday_ot";
    const minutes = Number(detail.minutes) || 0;
    return {
      type,
      start: finishTime,
      finish: addMinutesToTime(finishTime, minutes),
    };
  });

const getRefreshMonth = (selectedDate, work) => {
  const source = work?.date || selectedDate;
  if (typeof source === "string") return source.slice(0, 7);
  if (source?.year && source?.month) {
    return `${source.year}-${String(source.month).padStart(2, "0")}`;
  }
  return "";
};

export default function EditPendingWorkModal({
  forceBottomSheet,
  isOpen,
  onClose,
  onRefresh,
  selectedDate,
  work,
}) {
  const toast = useToast();
  const responsiveBottomSheet = useBreakpointValue({ base: true, md: false });
  const isBottomSheet = forceBottomSheet ?? responsiveBottomSheet;
  const { setUserWorkPlaces, userName, userUuid, workPlaces } = useUser();
  const [baseShift, setBaseShift] = useState(DAY_SHIFT);
  const [isSpecial, setIsSpecial] = useState(false);
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [finishTime, setFinishTime] = useState("18:00");
  const [extraEnabled, setExtraEnabled] = useState(false);
  const [extraRows, setExtraRows] = useState([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const workDayId = getWorkDayId(work);
  const canEdit = work?.is_approved === null;
  const selectedWorkTime = `${startTime}~${finishTime}`;

  const filteredWorkTimes = useMemo(
    () => workTimeList.filter((time) => time.shift === baseShift),
    [baseShift]
  );

  useEffect(() => {
    if (!isOpen || !work) return;

    const nextStartTime = toTime(work.work_start, "09:00");
    const nextFinishTime = toTime(work.work_end, "18:00");
    const primaryWorkType = work.details?.[0]?.work_type || work.work_type || "";
    const nextExtraRows = toExtraRows(work.details || [], nextFinishTime);

    setBaseShift(getInitialShift(work));
    setIsSpecial(primaryWorkType.includes(SPECIAL));
    setLocation(work.work_place || "");
    setStartTime(nextStartTime);
    setFinishTime(nextFinishTime);
    setExtraRows(nextExtraRows);
    setExtraEnabled(nextExtraRows.length > 0);
    setIsDeleteConfirmOpen(false);
  }, [isOpen, work]);

  useEffect(() => {
    if (!isOpen || !userUuid || workPlaces.length > 0) return;

    fetchUserWorkPlaces({ toast })
      .then(setUserWorkPlaces)
      .catch((error) => {
        toast({
          title: "\uadfc\ubb34\uc9c0\ub97c\u0020\ubd88\ub7ec\uc624\uc9c0\u0020\ubabb\ud588\uc2b5\ub2c8\ub2e4\u002e",
          description: error?.message,
          status: "error",
        });
      });
  }, [isOpen, setUserWorkPlaces, toast, userUuid, workPlaces.length]);

  const baseWorkType = useMemo(
    () => (isSpecial ? `${baseShift} ${SPECIAL}` : baseShift),
    [baseShift, isSpecial]
  );

  const buildTarget = () => ({
    targetWorkDate: work?.date || selectedDate,
    targetWorkShift: work?.work_shift,
    workShift: baseShift,
  });

  const refreshMonth = async () => {
    const ym = getRefreshMonth(selectedDate, work);
    if (onRefresh && ym) await onRefresh(ym);
  };

  const handleShiftChange = (nextShift) => {
    setBaseShift(nextShift);
    const nextTime = workTimeList.find((time) => time.shift === nextShift);
    if (nextTime) {
      setStartTime(nextTime.startTime);
      setFinishTime(nextTime.finishTime);
    }
  };

  const handleWorkTimeChange = (value) => {
    const [nextStart, nextFinish] = value.split("~");
    setStartTime(nextStart);
    setFinishTime(nextFinish);
  };

  const handleExtraChange = (index, field, value) => {
    setExtraRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const handleAddExtra = () => {
    setExtraRows((prev) => [
      ...prev,
      { type: "weekday_ot", start: finishTime, finish: addMinutesToTime(finishTime, 120) },
    ]);
  };

  const handleDelete = async () => {
    if (!canEdit || isDeleting || isSaving) return;

    try {
      setIsDeleting(true);
      await deleteWorkInfo(buildTarget(), { toast });
      toast({ title: TEXT.deleteSuccess, status: "success" });
      setIsDeleteConfirmOpen(false);
      onClose();
      await refreshMonth();
    } catch (error) {
      toast({
        title: TEXT.deleteError,
        description: error?.message,
        status: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!canEdit || isSaving || isDeleting) return;
    if (!location || !startTime || !finishTime) {
      toast({ title: TEXT.invalidForm, status: "warning" });
      return;
    }

    const enabledExtraRows = extraEnabled
      ? extraRows.filter((row) => row.type && row.start && row.finish)
      : [];

    const details = [
      {
        work_type: baseWorkType,
        minutes: calculateNetMinutes(startTime, finishTime),
        is_overtime_approved: isSpecial,
      },
      ...enabledExtraRows.map((row) => ({
        work_type:
          row.type === "holiday_special"
            ? `${baseShift} ${SPECIAL}`
            : EXTRA_WORK_TYPES.find((type) => type.value === row.type)?.submitLabel || row.type,
        minutes: diffMinutes(row.start, row.finish),
        is_overtime_approved: true,
      })),
    ];

    try {
      setIsSaving(true);
      await updateWorkInfo(
        {
          ...buildTarget(),
          details,
          finishTime,
          location,
          selectedDate: work?.date || selectedDate,
          startTime,
          userName,
          userUuid,
          workDayId,
          workShift: baseShift,
        },
        { toast }
      );

      toast({ title: TEXT.saveSuccess, status: "success" });
      onClose();
      await refreshMonth();
    } catch (error) {
      toast({
        title: TEXT.saveError,
        description: error?.message,
        status: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      isCentered={!isBottomSheet}
      motionPreset={isBottomSheet ? "slideInBottom" : "scale"}
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" />
      <ModalContent
        bg="#1c1c1e"
        color="white"
        borderTopRadius={isBottomSheet ? "30px" : "24px"}
        borderBottomRadius={isBottomSheet ? 0 : "24px"}
        border={isBottomSheet ? "0" : "1px solid"}
        borderColor={isBottomSheet ? "transparent" : "whiteAlpha.200"}
        boxShadow={isBottomSheet ? "0 -10px 30px rgba(0, 0, 0, 0.28)" : "0 24px 80px rgba(0, 0, 0, 0.45)"}
        mt={isBottomSheet ? "auto" : undefined}
        mb={isBottomSheet ? 0 : undefined}
        mx={isBottomSheet ? 0 : undefined}
        w={isBottomSheet ? "100%" : undefined}
        maxW={isBottomSheet ? "100%" : undefined}
        maxH={isBottomSheet ? "94dvh" : "auto"}
        overflow="hidden"
      >
        {isBottomSheet && (
          <Box w="40px" h="5px" bg="gray.300" borderRadius="full" mx="auto" mt={3} mb={1} />
        )}

        <ModalHeader px={6} pt={isBottomSheet ? 4 : 6} pb={3}>
          <HStack justify="space-between" pr={8}>
            <Box>
              <Text fontSize="lg" fontWeight="900">{TEXT.title}</Text>
              <Text fontSize="sm" color="gray.400" mt={1}>
                {TEXT.subtitle}
              </Text>
            </Box>
            <Badge colorScheme={canEdit ? "orange" : "gray"} borderRadius="full" px={3}>
              {canEdit ? TEXT.pending : TEXT.editDisabled}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton
          top={isBottomSheet ? 5 : 5}
          right={5}
          bg={isBottomSheet ? "whiteAlpha.100" : undefined}
          borderRadius="full"
          _hover={{ bg: "whiteAlpha.200" }}
        />

        <ModalBody px={5} py={3} overflowY="auto">
          <VStack align="stretch" spacing={4}>
            {!canEdit && (
              <Box bg="orange.900" border="1px solid" borderColor="orange.600" borderRadius="14px" p={3}>
                <Text fontSize="sm" color="orange.100">
                  {TEXT.pendingOnly}
                </Text>
              </Box>
            )}

            <Box bg="whiteAlpha.50" borderRadius="18px" p={4}>
              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.400">{TEXT.shift}</FormLabel>
                  <HStack align="center">
                    <Select value={baseShift} onChange={(e) => handleShiftChange(e.target.value)} {...fieldStyle}>
                      <option value={DAY_SHIFT}>{DAY_SHIFT}</option>
                      <option value={NIGHT_SHIFT}>{NIGHT_SHIFT}</option>
                    </Select>
                    <HStack minW="94px" justify="flex-end">
                      <Switch colorScheme="orange" isChecked={isSpecial} onChange={(e) => setIsSpecial(e.target.checked)} />
                      <Text fontSize="sm" color="gray.200">{TEXT.special}</Text>
                    </HStack>
                  </HStack>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color="gray.400">{TEXT.time}</FormLabel>
                  <Select value={selectedWorkTime} onChange={(e) => handleWorkTimeChange(e.target.value)} {...fieldStyle}>
                    {filteredWorkTimes.map((time) => (
                      <option key={`${time.startTime}-${time.finishTime}`} value={`${time.startTime}~${time.finishTime}`}>
                        {time.startTime} ~ {time.finishTime}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="xs" color="gray.400">{TEXT.location}</FormLabel>
                  <Select value={location} onChange={(e) => setLocation(e.target.value)} {...fieldStyle}>
                    <option value="">{TEXT.locationPlaceholder}</option>
                    {workPlaces.map((place) => (
                      <option key={place} value={place}>
                        {place}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </VStack>
            </Box>

            <Box bg="whiteAlpha.50" borderRadius="18px" p={4}>
              <HStack justify="space-between" mb={extraEnabled ? 3 : 0}>
                <Box>
                  <Text fontSize="sm" fontWeight="800">{TEXT.extraWork}</Text>
                  <Text fontSize="xs" color="gray.500">{TEXT.extraDescription}</Text>
                </Box>
                <Switch colorScheme="orange" isChecked={extraEnabled} onChange={(e) => setExtraEnabled(e.target.checked)} />
              </HStack>

              {extraEnabled && (
                <VStack align="stretch" spacing={3}>
                  {extraRows.map((row, index) => (
                    <Box key={index} p={3} bg="blackAlpha.200" borderRadius="14px">
                      <VStack align="stretch" spacing={2}>
                        <Select value={row.type} onChange={(e) => handleExtraChange(index, "type", e.target.value)} {...fieldStyle}>
                          {EXTRA_WORK_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Select>
                        <HStack>
                          <Input type="time" value={row.start} onChange={(e) => handleExtraChange(index, "start", e.target.value)} {...fieldStyle} />
                          <Input type="time" value={row.finish} onChange={(e) => handleExtraChange(index, "finish", e.target.value)} {...fieldStyle} />
                        </HStack>
                      </VStack>
                    </Box>
                  ))}

                  <Button size="sm" variant="outline" borderColor="whiteAlpha.300" color="white" onClick={handleAddExtra}>
                    {TEXT.addExtra}
                  </Button>
                </VStack>
              )}
            </Box>

            {isDeleteConfirmOpen && (
              <Box
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
                borderRadius="18px"
                p={4}
              >
                <HStack
                  justify="space-between"
                  align={isBottomSheet ? "stretch" : "center"}
                  spacing={4}
                  flexDirection={isBottomSheet ? "column" : "row"}
                >
                  <Box>
                    <Badge colorScheme="red" borderRadius="full" mb={2}>
                      {TEXT.delete}
                    </Badge>
                    <Text fontSize="sm" fontWeight="900" color="white">
                      {TEXT.deleteConfirmTitle}
                    </Text>
                    <Text fontSize="xs" color="gray.400" mt={1}>
                      {TEXT.deleteConfirmDescription}
                    </Text>
                  </Box>
                  <HStack flexShrink={0} justify={isBottomSheet ? "stretch" : "flex-end"}>
                    <Button
                      size="sm"
                      variant="ghost"
                      color="gray.300"
                      onClick={() => setIsDeleteConfirmOpen(false)}
                      flex={isBottomSheet ? 1 : undefined}
                    >
                      {TEXT.deleteCancel}
                    </Button>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={handleDelete}
                      isLoading={isDeleting}
                      flex={isBottomSheet ? 1 : undefined}
                    >
                      {TEXT.deleteConfirmAction}
                    </Button>
                  </HStack>
                </HStack>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <Divider borderColor="whiteAlpha.100" />
        <ModalFooter
          px={5}
          py={4}
          gap={2}
          bg="#1c1c1e"
          borderTop="1px solid"
          borderColor="whiteAlpha.100"
          justifyContent="flex-end"
        >
          <Button
            colorScheme="red"
            variant="outline"
            onClick={() => setIsDeleteConfirmOpen(true)}
            isDisabled={!canEdit || isSaving || isDeleting}
            flex={isBottomSheet ? 1 : undefined}
          >
            {TEXT.delete}
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={isSaving}
            isDisabled={!canEdit || isDeleting}
            flex={isBottomSheet ? 1.35 : undefined}
          >
            {TEXT.save}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
