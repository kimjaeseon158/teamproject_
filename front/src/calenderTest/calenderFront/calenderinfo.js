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

// "HH:MM" -> minutes
const hmToMinutes = (hm) => {
  if (!hm || typeof hm !== "string" || !hm.includes(":")) return 0;
  const [h, m] = hm.split(":").map((x) => Number(x));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
};

// minutes -> "HH:MM"
const minutesToHM = (mins) => {
  const m = Math.max(0, mins);
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

const Option = ({ selectedDate }) => {
  const [records, setRecords] = useState([]);

  const [location, setLocation] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [totalWorkTime, setTotalWorkTime] = useState("");

  const { user, employeeNumber } = useContext(UserContext);

  // ✅ 추가 근무(여러 줄)
  const [extraEnabled, setExtraEnabled] = useState(false);
  const [extraWorks, setExtraWorks] = useState([
    { type: "", start: "", finish: "", duration: "" },
  ]);

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

  // 메인 작업 시간 선택
  const handleSelectWorkTime = (start, finish) => {
    setStartTime(start);
    setFinishTime(finish);
    setWorkTime(`${start}~${finish}`);
  };

  const handleSelectLocation = (loc) => {
    setLocation(loc);
  };

  // 총 작업 시간 계산
  useEffect(() => {
    if (startTime && finishTime) {
      const duration = calculateDurationInHM(startTime, finishTime);
      setTotalWorkTime(duration);
    } else {
      setTotalWorkTime("");
    }
  }, [startTime, finishTime]);

  // ✅ 추가근무: 특정 줄 값 변경
  const updateExtraWork = (idx, patch) => {
    setExtraWorks((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, ...patch };

        // duration 자동 계산
        if (next.start && next.finish) {
          next.duration = calculateDurationInHM(next.start, next.finish);
        } else {
          next.duration = "";
        }
        return next;
      })
    );
  };

  // ✅ + 줄 추가
  const handleAddExtraRow = () => {
    setExtraWorks((prev) => [
      ...prev,
      { type: "", start: "", finish: "", duration: "" },
    ]);
  };

  // ✅ 줄 삭제
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

    if (!location || !totalWorkTime) {
      alert("장소와 작업시간을 입력해주세요.");
      return;
    }

    const rows = extraEnabled
      ? extraWorks.filter((r) => r.type && r.start && r.finish)
      : [];

    const reduceByType = (type) => {
      const items = rows.filter((r) => r.type === type);
      if (!items.length) {
        return { checked: false, start: "", finish: "", duration: "" };
      }

      // duration 합산(분)
      const totalMins = items.reduce(
        (sum, r) => sum + hmToMinutes(r.duration),
        0
      );

      // start 최소, finish 최대 (문자열 정렬로 OK: "09:00" < "18:00")
      const minStart = items.map((r) => r.start).sort().at(0);
      const maxFinish = items.map((r) => r.finish).sort().at(-1);

      return {
        checked: true,
        start: minStart || "",
        finish: maxFinish || "",
        duration: minutesToHM(totalMins),
      };
    };

    const overtime = reduceByType("overtime");
    const lunch = reduceByType("lunch");
    const special = reduceByType("special");

    try {
      const { data, newRecord } = await submitWorkInfo({
        user,
        employeeNumber,
        selectedDate,
        startTime,
        finishTime,
        totalWorkTime,
        location,

        // 잔업
        overtimeChecked: overtime.checked,
        overtimeStart: overtime.start,
        overtimeFinish: overtime.finish,
        overtimeDuration: overtime.duration,

        // 중식
        lunchChecked: lunch.checked,
        lunchStart: lunch.start,
        lunchFinish: lunch.finish,
        lunchDuration: lunch.duration,

        // 특근
        specialWorkChecked: special.checked,
        specialWorkStart: special.start,
        specialWorkFinish: special.finish,
        specialWorkDuration: special.duration,
      });

      console.log("서버 응답:", data);
      setRecords([...records, newRecord]);

      // 초기화
      setLocation("");
      setStartTime("");
      setFinishTime("");
      setWorkTime("");
      setTotalWorkTime("");

      setExtraEnabled(false);
      setExtraWorks([{ type: "", start: "", finish: "", duration: "" }]);
    } catch (error) {
      console.error("전송 중 오류 발생:", error);
    }
  };

  return (
    <Stack as="form" spacing={4} onSubmit={handleSubmit} color="white">
      {/* ✅ 선택한 날짜 표시 (추가) */}
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

      {/* 🔹 작업 시간 선택 */}
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
            {workTimeList.map(({ startTime, finishTime }, idx) => (
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

      {/* 🔹 장소 선택 */}
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

      {/* 🔹 총 작업 시간 */}
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

      {/* ⭐ 추가 근무 블록 (잔업 / 특근 / 중식) */}
      <Box mt={2} bg="gray.700" p={3} borderRadius="md">
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" fontWeight="600">
            추가 근무 (잔업 / 특근 / 중식)
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
            {/* ✅ + 추가 버튼 */}
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

            {/* ✅ 여러 줄 입력 */}
            {extraWorks.map((row, idx) => (
              <Box key={idx} p={2} borderRadius="md" bg="gray.800">
                {/* 유형 + 삭제 */}
                <HStack spacing={2} mb={2}>
                  <Select
                    placeholder="유형 선택"
                    size="sm"
                    value={row.type}
                    onChange={(e) =>
                      updateExtraWork(idx, { type: e.target.value })
                    }
                    bg="gray.900"
                    borderColor="gray.500"
                    color="gray.100"
                  >
                    <option style={{ color: "black" }} value="overtime">
                      잔업
                    </option>
                    <option style={{ color: "black" }} value="special">
                      특근
                    </option>
                    <option style={{ color: "black" }} value="lunch">
                      중식
                    </option>
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

                {/* 시간 */}
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

            <Text fontSize="xs" color="gray.300">
              * 같은 유형을 여러 번 추가하면 전송 시 총 시간이 합산되어 저장돼요.
            </Text>
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
