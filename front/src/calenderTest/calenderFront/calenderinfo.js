// src/attendance/calenderinfo.js
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Stack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Text,
  Input,
  Select,
  Switch,
  Checkbox,
  IconButton,
  Divider,
} from "@chakra-ui/react";
import { ChevronDownIcon, AddIcon, DeleteIcon } from "@chakra-ui/icons";

import { useUser } from "../../login/js/userContext";
import locationsList from "../js/locationsList";
import workTimeList from "../js/workTimeList";
import submitWorkInfo from "../js/submitWorkInfo";
import "../css/activity.css";

// minutes -> "HH:MM"
const minutesToHM = (mins) => {
  const m = Math.max(0, Number(mins) || 0);
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

const Option = ({ selectedDate }) => {
  const { userUuid, userName  } = useUser();

  const [records, setRecords] = useState([]);

  const [location, setLocation] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [totalWorkTime, setTotalWorkTime] = useState("");

  const [baseShift, setBaseShift] = useState("주간");
  const [isSpecial, setIsSpecial] = useState(false);

  const [extraEnabled, setExtraEnabled] = useState(false);
  const [extraWorks, setExtraWorks] = useState([
    { type: "", start: "", finish: "", duration: "" },
  ]);

  const hmToMinutes = (hm) => {
    if (!hm || typeof hm !== "string" || !hm.includes(":")) return null;
    const [h, m] = hm.split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    return h * 60 + m;
  };

  const diffMinutes = (start, finish) => {
    const s = hmToMinutes(start);
    const f = hmToMinutes(finish);
    if (s == null || f == null) return 0;
    const fixedF = f < s ? f + 24 * 60 : f;
    return Math.max(fixedF - s, 0);
  };

  const formatTimeInput = (value) => {
    let cleaned = value.replace(/[^0-9]/g, "");
    if (cleaned.length === 0) return "";

    let hour = cleaned.slice(0, 2);
    let minute = cleaned.slice(2, 4);

    if (hour.length === 1 && Number(hour) > 2) hour = "2";
    if (hour.length === 2 && Number(hour) > 24) hour = "24";
    if (minute.length === 1 && Number(minute) > 5) minute = "5";
    if (minute.length === 2 && Number(minute) > 59) minute = "59";

    if (minute.length === 0) return hour;
    return `${hour}:${minute}`;
  };

  const handleSelectWorkTime = (start, finish) => {
    setStartTime(start);
    setFinishTime(finish);
    setWorkTime(`${start}~${finish}`);
  };

  const handleSelectLocation = (loc) => setLocation(loc);

  const filteredWorkTimeList = useMemo(() => {
    return workTimeList.filter((t) => t.shift === baseShift);
  }, [baseShift]);

  useEffect(() => {
    if (startTime && finishTime) {
      setTotalWorkTime(minutesToHM(diffMinutes(startTime, finishTime)));
    } else {
      setTotalWorkTime("");
    }
  }, [startTime, finishTime]);

  useEffect(() => {
    setStartTime("");
    setFinishTime("");
    setWorkTime("");
    setTotalWorkTime("");
  }, [baseShift]);

  const updateExtraWork = (idx, patch) => {
    setExtraWorks((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, ...patch };
        if (next.start && next.finish) {
          next.duration = minutesToHM(diffMinutes(next.start, next.finish));
        } else {
          next.duration = "";
        }
        return next;
      })
    );
  };

  const handleAddExtraRow = () => {
    setExtraWorks((prev) => [
      ...prev,
      { type: "", start: "", finish: "", duration: "" },
    ]);
  };

  const handleRemoveExtraRow = (idx) => {
    setExtraWorks((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length
        ? next
        : [{ type: "", start: "", finish: "", duration: "" }];
    });
  };
  /* =========================
     🔥 기능 수정 ONLY
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 로그인 체크 (UI 영향 없음)
    if (!userUuid) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!location || !startTime || !finishTime) {
      alert("장소와 작업시간을 입력해주세요.");
      return;
    }

    const rows = extraEnabled
      ? extraWorks.filter((r) => r.type && r.start && r.finish)
      : [];

    const reduceByTypeMinutes = (type) => {
      const items = rows.filter((r) => r.type === type);
      return items.reduce((sum, r) => sum + diffMinutes(r.start, r.finish), 0);
    };

    const details = [
      { work_type: "잔업", minutes: reduceByTypeMinutes("overtime") },
      { work_type: "중식", minutes: reduceByTypeMinutes("lunch") },
    ].filter((d) => d.minutes > 0);

    const workType = isSpecial ? `${baseShift}-특근` : baseShift;
    
    try {
      const { newRecord } = await submitWorkInfo({
        user_uuid: userUuid, // 🔥 key만 수정
        user_name: userName ,
        selectedDate,
        startTime,
        finishTime,
        location,
        workType,
        details,
      });

      setRecords((prev) => [...prev, newRecord]);

      // ✅ 성공했을 때만 리셋 (기존 UX 유지)
      setLocation("");
      setStartTime("");
      setFinishTime("");
      setWorkTime("");
      setTotalWorkTime("");
      setIsSpecial(false);
      setExtraEnabled(false);
      setExtraWorks([{ type: "", start: "", finish: "", duration: "" }]);
    } catch (error) {
      console.error("전송 중 오류 발생:", error);
      return; // 🔥 실패 시 UI 유지
    }
  };

  /* =========================
     UI (원본 그대로)
  ========================= */
  return (
    <Stack as="form" spacing={4} onSubmit={handleSubmit} color="white">
      <Box
        bg="gray.800"
        borderRadius="md"
        p={3}
        border="1px solid"
        borderColor="gray.600"
      >
        <Text fontSize="xs" color="gray.400" mb={1}>
          선택한 날짜
        </Text>
        <HStack justify="space-between">
          <Text fontSize="md" fontWeight="800" color="gray.100">
            {selectedDate?.year}년 {selectedDate?.month}월 {selectedDate?.day}일
          </Text>
        </HStack>
      </Box>

      <Divider opacity={0.2} />

      <Box>
        <Text fontSize="sm" mb={1} fontWeight="600">
          근무형태
        </Text>
        <HStack spacing={5}>
          <Checkbox
            isChecked={baseShift === "주간"}
            onChange={() => setBaseShift("주간")}
            colorScheme="green"
          >
            주간
          </Checkbox>
          <Checkbox
            isChecked={baseShift === "야간"}
            onChange={() => setBaseShift("야간")}
            colorScheme="purple"
          >
            야간
          </Checkbox>
          <Checkbox
            isChecked={isSpecial}
            onChange={(e) => setIsSpecial(e.target.checked)}
            colorScheme="orange"
          >
            특근
          </Checkbox>
        </HStack>
      </Box>

      <Box>
        <Text fontSize="sm" mb={1} fontWeight="600">
          작업 시간
        </Text>
        <Menu>
          <MenuButton
            as={Button}
            variant="outline"
            rightIcon={<ChevronDownIcon />}
            width="100%"
            justifyContent="space-between"
            fontWeight={workTime ? "500" : "400"}
            color={workTime ? "gray.100" : "gray.400"}
            bg="gray.800"
            borderColor="gray.600"
            _hover={{ bg: "gray.700" }}
          >
            {workTime || "작업 시간 선택"}
          </MenuButton>

          <MenuList maxH="240px" overflowY="auto" bg="white" color="gray.800">
            {filteredWorkTimeList.map(({ startTime, finishTime }, idx) => (
              <MenuItem
                key={idx}
                onClick={() => handleSelectWorkTime(startTime, finishTime)}
              >
                {startTime}~{finishTime}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Box>

      <Box>
        <Text fontSize="sm" mb={1} fontWeight="600">
          업체 / 장소
        </Text>
        <Menu>
          <MenuButton
            as={Button}
            variant="outline"
            rightIcon={<ChevronDownIcon />}
            width="100%"
            justifyContent="space-between"
            fontWeight={location ? "500" : "400"}
            color={location ? "gray.100" : "gray.400"}
            bg="gray.800"
            borderColor="gray.600"
            _hover={{ bg: "gray.700" }}
          >
            {location || "업체/장소 선택"}
          </MenuButton>

          <MenuList maxH="240px" overflowY="auto" bg="white" color="gray.800">
            {locationsList.map((loc, idx) => (
              <MenuItem key={idx} onClick={() => handleSelectLocation(loc)}>
                {loc}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Box>

      <Box>
        <Text fontSize="sm" mb={1} fontWeight="600">
          총 작업 시간
        </Text>
        <Input
          value={totalWorkTime}
          placeholder="총 작업 시간"
          isReadOnly
          bg="gray.800"
          borderColor="gray.600"
          color="gray.100"
          _placeholder={{ color: "gray.500" }}
        />
      </Box>

      <Box mt={2} bg="gray.700" p={3} borderRadius="md">
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" fontWeight="600">
            추가 근무 (잔업 / 중식)
          </Text>
          <HStack>
            <Text
              fontSize="xs"
              color={extraEnabled ? "green.300" : "red.300"}
              mr={1}
            >
              {extraEnabled ? "ON" : "OFF"}
            </Text>
            <Switch
              isChecked={extraEnabled}
              onChange={(e) => setExtraEnabled(e.target.checked)}
              colorScheme="green"
              size="md"
            />
          </HStack>
        </HStack>

        {extraEnabled && (
          <Stack spacing={3} mt={2}>
            <Button
              size="xs"
              leftIcon={<AddIcon />}
              variant="none"
              alignSelf="flex-start"
              color="white.100"
              onClick={handleAddExtraRow}
            >
              추가 근무 항목 추가
            </Button>

            {extraWorks.map((row, idx) => (
              <Box key={idx} p={2} borderRadius="md" bg="gray.800">
                <HStack spacing={2} mb={2}>
                  <Select
                    placeholder="유형 선택"
                    size="sm"
                    value={row.type}
                    onChange={(e) =>
                      updateExtraWork(idx, { type: e.target.value })
                    }
                    bg="white"
                    color="gray.800"
                    borderColor="gray.500"
                    _hover={{ borderColor: "gray.400" }}
                    _focus={{
                      borderColor: "blue.400",
                      boxShadow: "0 0 0 1px #63B3ED",
                    }}
                  >
                    <option value="overtime">잔업</option>
                    <option value="lunch">중식</option>
                  </Select>

                  <IconButton
                    aria-label="삭제"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleRemoveExtraRow(idx)}
                  />
                </HStack>

                <HStack spacing={3} align="center">
                  <Input
                    placeholder="시작"
                    value={row.start}
                    maxLength={5}
                    onChange={(e) =>
                      updateExtraWork(idx, {
                        start: formatTimeInput(e.target.value),
                      })
                    }
                    flex="1"
                    size="sm"
                    bg="white"
                    color="gray.800"
                    _placeholder={{ color: "gray.400" }}
                  />
                  <Text color="gray.200">~</Text>
                  <Input
                    placeholder="종료"
                    value={row.finish}
                    maxLength={5}
                    onChange={(e) =>
                      updateExtraWork(idx, {
                        finish: formatTimeInput(e.target.value),
                      })
                    }
                    flex="1"
                    size="sm"
                    bg="white"
                    color="gray.800"
                    _placeholder={{ color: "gray.400" }}
                  />
                  <Box minW="90px" textAlign="right">
                    <Text fontSize="xs" color="gray.200">
                      {row.duration ? `총 ${row.duration}` : "총 시간 -"}
                    </Text>
                  </Box>
                </HStack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Button
        type="submit"
        colorScheme="blue"
        alignSelf="flex-end"
        mt={2}
        size="sm"
      >
        추가
      </Button>
    </Stack>
  );
};

export default Option;
