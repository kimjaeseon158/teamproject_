import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
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
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

import workTimeList from "../data/workTimeList";
import { EXTRA_WORK_TYPES, getExtraWorkTypeByLabel } from "../../common/workTypes";
import { addMinutesToTime } from "../../common/workTimeUtils";
import { minutesToHM } from "../utils/timeUtils";
import TimeWheelPicker from "../../common/TimeWheelPicker";

const toTime = (value) => {
  const match = String(value || "").match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : "";
};

const toDateLabel = (value) => {
  const [, month, day] = String(value || "").match(/\d{4}-(\d{2})-(\d{2})/) || [];
  return month && day ? `${Number(month)}월 ${Number(day)}일` : value;
};

export default function PreviousWorkApplyModal({
  isOpen,
  onClose,
  onApply,
  previousWork,
  isMobile = false,
  workPlaces = [],
}) {
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [location, setLocation] = useState("");
  const [includeNote, setIncludeNote] = useState(false);
  const [note, setNote] = useState("");
  const [includeExtraWork, setIncludeExtraWork] = useState(false);
  const [extraWorks, setExtraWorks] = useState([]);

  useEffect(() => {
    if (!isOpen || !previousWork) return;
    const fallbackTime = workTimeList.find(
      (item) => item.shift === previousWork.work_shift
    );
    setStartTime(toTime(previousWork.work_start) || fallbackTime?.startTime || "");
    setFinishTime(toTime(previousWork.work_end) || fallbackTime?.finishTime || "");
    setLocation(previousWork.work_place || "");
    setIncludeNote(false);
    setNote(previousWork.note || "");
    setIncludeExtraWork(false);
    setExtraWorks(
      (previousWork.details || []).slice(1).map((detail) => {
        const type = getExtraWorkTypeByLabel(detail.work_type)?.value || "weekday_ot";
        const minutes = Number(detail.minutes) || 0;
        const baseStart = toTime(previousWork.work_start) || fallbackTime?.startTime || "";
        const baseFinish = toTime(previousWork.work_end) || fallbackTime?.finishTime || "";
        const start = type === "early_arrival"
          ? addMinutesToTime(baseStart, -minutes)
          : type === "lunch_ext" ? "12:00" : baseFinish;
        return {
          type,
          start,
          finish: addMinutesToTime(start, minutes),
          duration: minutesToHM(minutes),
        };
      })
    );
  }, [isOpen, previousWork]);

  if (!previousWork) return null;

  const availableTimes = workTimeList.filter(
    (item) => item.shift === previousWork.work_shift
  );
  const selectedTime = `${startTime}~${finishTime}`;
  const hasNote = Boolean(previousWork.note);
  const updateExtraWork = (index, patch) => {
    setExtraWorks((prev) =>
      prev.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row)
    );
  };

  const enableExtraWork = (enabled) => {
    setIncludeExtraWork(enabled);
    if (enabled && extraWorks.length === 0) {
      setExtraWorks([{
        type: "weekday_ot",
        start: finishTime,
        finish: addMinutesToTime(finishTime, 120),
        duration: "2:00",
      }]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      closeOnEsc={false}
      isCentered={!isMobile}
      size="md"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <ModalContent
        bg="#1c1c1e"
        color="white"
        borderTopRadius="24px"
        borderBottomRadius={isMobile ? 0 : "24px"}
        mx={isMobile ? 0 : 4}
        mt={isMobile ? "auto" : undefined}
        mb={isMobile ? 0 : undefined}
        maxW={isMobile ? "100%" : undefined}
      >
        {isMobile && (
          <Box w="40px" h="5px" bg="gray.500" borderRadius="full" mx="auto" mt={3} />
        )}
        <ModalHeader pb={2}>이전 근무 불러오기</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Badge colorScheme="blue" borderRadius="full" px={3} py={1} mb={5}>
            {toDateLabel(previousWork.work_date || previousWork.date)} · {previousWork.work_shift}
          </Badge>

          <FormControl mb={4}>
            <FormLabel fontSize="sm" color="gray.300">근무 시간</FormLabel>
            <Select
              value={selectedTime}
              onChange={(event) => {
                const [start, finish] = event.target.value.split("~");
                setStartTime(start);
                setFinishTime(finish);
              }}
              bg="whiteAlpha.100"
              borderColor="whiteAlpha.300"
              sx={{ option: { background: "#2c2c2e", color: "white" } }}
            >
              {!availableTimes.some(
                (item) => `${item.startTime}~${item.finishTime}` === selectedTime
              ) && <option value={selectedTime}>{startTime} ~ {finishTime}</option>}
              {availableTimes.map((item) => (
                <option key={`${item.startTime}-${item.finishTime}`} value={`${item.startTime}~${item.finishTime}`}>
                  {item.startTime} ~ {item.finishTime}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm" color="gray.300">업체 및 근무지</FormLabel>
            <Select
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              bg="whiteAlpha.100"
              borderColor="whiteAlpha.300"
              sx={{ option: { background: "#2c2c2e", color: "white" } }}
            >
              {!workPlaces.includes(location) && location && (
                <option value={location}>{location}</option>
              )}
              {workPlaces.map((place) => (
                <option key={place} value={place}>{place}</option>
              ))}
            </Select>
          </FormControl>

          <Box mt={5} p={4} bg="whiteAlpha.50" borderRadius="16px">
            <Text fontSize="sm" fontWeight="800" mb={3}>선택 항목</Text>
            <HStack justify="space-between" mb={3}>
              <Box>
                <Text fontSize="sm">비고 포함</Text>
                <Text fontSize="xs" color="gray.500">
                  {hasNote ? "이전 비고를 불러옵니다." : "새 비고를 입력할 수 있습니다."}
                </Text>
              </Box>
              <Switch
                colorScheme="blue"
                isChecked={includeNote}
                onChange={(event) => setIncludeNote(event.target.checked)}
              />
            </HStack>
            {includeNote && (
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value.slice(0, 200))}
                placeholder="준비물, 집결 시간 등 전달 사항"
                mb={4}
                minH="88px"
                resize="vertical"
                bg="whiteAlpha.100"
                borderColor="whiteAlpha.300"
              />
            )}
            <HStack justify="space-between">
              <Box>
                <Text fontSize="sm">추가 근무 포함</Text>
                <Text fontSize="xs" color="gray.500">
                  {extraWorks.length > 0
                    ? `${extraWorks.length}건 · 수정할 수 있습니다.`
                    : "새 추가 근무를 입력할 수 있습니다."}
                </Text>
              </Box>
              <Switch
                colorScheme="orange"
                isChecked={includeExtraWork}
                onChange={(event) => enableExtraWork(event.target.checked)}
              />
            </HStack>
            {includeExtraWork && (
              <VStack align="stretch" spacing={3} mt={3}>
                {extraWorks.map((row, index) => (
                  <Box key={index} p={3} bg="blackAlpha.300" borderRadius="14px">
                    <HStack mb={2}>
                      <Select
                        size="sm"
                        value={row.type}
                        onChange={(event) => updateExtraWork(index, { type: event.target.value })}
                        sx={{ option: { background: "#2c2c2e", color: "white" } }}
                      >
                        {EXTRA_WORK_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </Select>
                      <IconButton
                        aria-label="추가 근무 삭제"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => setExtraWorks((prev) => prev.filter((_, i) => i !== index))}
                      />
                    </HStack>
                    {isMobile ? (
                      <HStack justify="center" spacing={2} bg="blackAlpha.200" borderRadius="xl" px={2} py={2}>
                        <VStack spacing={1}>
                          <Text fontSize="10px" color="gray.300">시작</Text>
                          <TimeWheelPicker
                            value={row.start}
                            variant="compact"
                            onChange={(value) => updateExtraWork(index, { start: value })}
                          />
                        </VStack>
                        <Text color="orange.300">→</Text>
                        <VStack spacing={1}>
                          <Text fontSize="10px" color="gray.300">종료</Text>
                          <TimeWheelPicker
                            value={row.finish}
                            variant="compact"
                            onChange={(value) => updateExtraWork(index, { finish: value })}
                          />
                        </VStack>
                      </HStack>
                    ) : (
                      <HStack>
                        <Input
                          size="sm"
                          value={row.start}
                          placeholder="시작 시간"
                          onChange={(event) => updateExtraWork(index, { start: event.target.value })}
                        />
                        <Text color="orange.300">~</Text>
                        <Input
                          size="sm"
                          value={row.finish}
                          placeholder="종료 시간"
                          onChange={(event) => updateExtraWork(index, { finish: event.target.value })}
                        />
                      </HStack>
                    )}
                  </Box>
                ))}
                <Button
                  size="sm"
                  leftIcon={<AddIcon />}
                  variant="outline"
                  colorScheme="orange"
                  onClick={() => setExtraWorks((prev) => [...prev, {
                    type: "weekday_ot",
                    start: finishTime,
                    finish: addMinutesToTime(finishTime, 120),
                    duration: "2:00",
                  }])}
                >
                  추가 근무 추가
                </Button>
              </VStack>
            )}
          </Box>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>취소</Button>
          <Button
            colorScheme="blue"
            onClick={() => onApply({
              startTime,
              finishTime,
              location,
              includeNote,
              note,
              includeExtraWork,
              extraWorks,
              previousWork,
            })}
            isDisabled={!startTime || !finishTime || !location}
          >
            이 내용 적용
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
