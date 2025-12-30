// src/attendance/calenderinfo.js
import React, { useContext, useState, useEffect } from "react";
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

import UserContext from "../../login/js/userContext";
import locationsList from "../js/locationsList";
import workTimeList from "../js/workTimeList";
import { calculateDurationInHM } from "../js/timeUtils";
import submitWorkInfo from "../js/submitWorkInfo";
import "../css/activity.css";

// ✅ 어떤 형식이 와도 "분"으로 바꾸기
const toMinutesAny = (v) => {
  if (v == null) return 0;
  if (typeof v === "number") return v;

  const s = String(v).trim();

  // "HH:MM"
  const hm = s.match(/^(\d{1,2}):(\d{2})$/);
  if (hm) {
    const h = Number(hm[1]);
    const m = Number(hm[2]);
    if (!Number.isNaN(h) && !Number.isNaN(m)) return h * 60 + m;
  }

  // "8시간 30분"
  const korean = s.match(/(\d+)\s*시간\s*(\d+)\s*분/);
  if (korean) {
    const h = Number(korean[1]);
    const m = Number(korean[2]);
    if (!Number.isNaN(h) && !Number.isNaN(m)) return h * 60 + m;
  }

  // 숫자만
  const onlyNum = s.replace(/[^\d]/g, "");
  const n = Number(onlyNum);
  return Number.isFinite(n) ? n : 0;
};

const Option = ({ selectedDate }) => {
  const [records, setRecords] = useState([]);

  const [location, setLocation] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [totalWorkTime, setTotalWorkTime] = useState("");

  const { user, employeeNumber } = useContext(UserContext);

  // ✅ 근무형태:
  // baseShift: 주간/야간 중 1개(필수)
  // isSpecial: 특근 ON/OFF (주간/야간과 동시에 가능)
  const [baseShift, setBaseShift] = useState("day"); // "day" | "night"
  const [isSpecial, setIsSpecial] = useState(false); // true/false

  // ✅ 추가 근무(여러 줄)
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
    return Math.max(f - s, 0);
  };

  // 시간 입력 자동 포맷(HH:mm)
  const formatTimeInput = (value) => {
    let cleaned = value.replace(/[^0-9]/g, "");
    if (cleaned.length === 0) return "";

    let hour = cleaned.slice(0, 2);
    let minute = cleaned.slice(2, 4);

    if (hour.length === 1) {
      if (Number(hour) > 2) hour = "2";
    } else if (hour.length === 2) {
      if (Number(hour) > 24) hour = "24";
    }

    if (minute.length === 1) {
      if (Number(minute) > 5) minute = "5";
    } else if (minute.length === 2) {
      if (Number(minute) > 59) minute = "59";
    }

    if (minute.length === 0) return hour;
    return `${hour}:${minute}`;
  };

  const handleSelectWorkTime = (start, finish) => {
    setStartTime(start);
    setFinishTime(finish);
    setWorkTime(`${start}~${finish}`);
  };

  const handleSelectLocation = (loc) => setLocation(loc);

  // ✅ baseShift(주간/야간)에 따라 작업시간 리스트 필터
  // ⚠️ workTimeList 항목에 shift 필드가 있어야 함:
  // 예) { shift:"day", startTime:"09:00", finishTime:"18:00" }
  const filteredWorkTimeList = workTimeList.filter((t) => t.shift === baseShift);

  useEffect(() => {
    if (startTime && finishTime) {
      const duration = calculateDurationInHM(startTime, finishTime);
      setTotalWorkTime(duration);
    } else {
      setTotalWorkTime("");
    }
  }, [startTime, finishTime]);

  // ✅ 주간/야간 바뀌면 작업시간 선택 초기화
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
          next.duration = calculateDurationInHM(next.start, next.finish);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const overtimeMins = reduceByTypeMinutes("overtime"); // 잔업
    const lunchMins = reduceByTypeMinutes("lunch"); // 중식

    // ✅ 특근은 "추가근무"에서 제거됨 (isSpecial로만 처리)
    const details = [
      { work_type: "잔업", minutes: overtimeMins },
      { work_type: "중식", minutes: lunchMins },
    ].filter((d) => d.minutes > 0);

    console.log("✅ details:", details);

    try {
      const { data, newRecord } = await submitWorkInfo({
        user,
        employeeNumber,
        selectedDate,
        startTime,
        finishTime,
        location,
        baseShift,   // ✅ "day" | "night"
        isSpecial,   // ✅ 특근 여부 true/false
        details,
      });

      console.log("서버 응답:", data);
      console.log("보낸 payload:", newRecord);

      setRecords([...records, newRecord]);

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
    }
  };

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

        <HStack justify="space-between" align="center">
          <Text fontSize="md" fontWeight="800" color="gray.100">
            {selectedDate?.year}년 {selectedDate?.month}월 {selectedDate?.day}일
          </Text>
        </HStack>
      </Box>

      <Divider opacity={0.2} />

      {/* ✅ 근무형태: 주간/야간(단일) + 특근(추가 토글) */}
      <Box>
        <Text fontSize="sm" mb={1} fontWeight="600">
          근무형태
        </Text>

        <HStack spacing={5}>
          {/* 주간/야간: 둘 중 하나만 체크되도록 */}
          <Checkbox
            isChecked={baseShift === "day"}
            onChange={() => setBaseShift("day")}
            colorScheme="green"
          >
            주간
          </Checkbox>

          <Checkbox
            isChecked={baseShift === "night"}
            onChange={() => setBaseShift("night")}
            colorScheme="purple"
          >
            야간
          </Checkbox>

          {/* 특근: 주간/야간과 동시에 가능 */}
          <Checkbox
            isChecked={isSpecial}
            onChange={(e) => setIsSpecial(e.target.checked)}
            colorScheme="orange"
          >
            특근
          </Checkbox>
        </HStack>

        <Text fontSize="xs" color="gray.300" mt={2}>
          ※ 특근은 주간/야간 중 하나를 선택한 상태에서 추가로 켤 수 있어요.
        </Text>
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
