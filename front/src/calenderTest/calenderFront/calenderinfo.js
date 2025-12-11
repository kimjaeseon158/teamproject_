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
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

import UserContext from "../../login/js/userContext";
import locationsList from "../js/locationsList";
import workTimeList from "../js/workTimeList";
import { calculateDurationInHM } from "../js/timeUtils";
import submitWorkInfo from "../js/submitWorkInfo";
import "../css/activity.css";

const Option = ({ selectedDate }) => {
  const [records, setRecords] = useState([]);

  const [location, setLocation] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [totalWorkTime, setTotalWorkTime] = useState("");

  const { user, employeeNumber } = useContext(UserContext);

  // 🔹 추가 근무(잔업/중식/특근) 통합 상태
  const [extraEnabled, setExtraEnabled] = useState(false);
  const [extraType, setExtraType] = useState(""); // "overtime" | "lunch" | "special"
  const [extraStart, setExtraStart] = useState("");
  const [extraFinish, setExtraFinish] = useState("");
  const [extraDuration, setExtraDuration] = useState("");

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

  // 추가 근무 시간 계산
  useEffect(() => {
    if (extraStart && extraFinish) {
      setExtraDuration(calculateDurationInHM(extraStart, extraFinish));
    } else {
      setExtraDuration("");
    }
  }, [extraStart, extraFinish]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location || !totalWorkTime) {
      alert("장소와 작업시간을 입력해주세요.");
      return;
    }

    // 🔹 extraType 을 예전 구조(잔업/중식/특근 개별 필드)로 분해
    const isOvertime = extraEnabled && extraType === "overtime";
    const isLunch = extraEnabled && extraType === "lunch";
    const isSpecial = extraEnabled && extraType === "special";

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
        overtimeChecked: isOvertime,
        overtimeStart: isOvertime ? extraStart : "",
        overtimeFinish: isOvertime ? extraFinish : "",
        overtimeDuration: isOvertime ? extraDuration : "",

        // 중식
        lunchChecked: isLunch,
        lunchStart: isLunch ? extraStart : "",
        lunchFinish: isLunch ? extraFinish : "",
        lunchDuration: isLunch ? extraDuration : "",

        // 특근
        specialWorkChecked: isSpecial,
        specialWorkStart: isSpecial ? extraStart : "",
        specialWorkFinish: isSpecial ? extraFinish : "",
        specialWorkDuration: isSpecial ? extraDuration : "",
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
      setExtraType("");
      setExtraStart("");
      setExtraFinish("");
      setExtraDuration("");
    } catch (error) {
      console.error("전송 중 오류 발생:", error);
    }
  };

  return (
    <Stack
      as="form"
      spacing={4}
      onSubmit={handleSubmit}
      color="white" // 다크박스 위라 텍스트 흰색
    >
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
            {/* 유형 선택 */}
            <Select
              placeholder="유형 선택 (잔업 / 특근 / 중식)"
              size="sm"
              value={extraType}
              onChange={(e) => setExtraType(e.target.value)}
              bg="gray.800"
              borderColor="gray.500"
              color="gray.100"
              _placeholder={{ color: "gray.400" }}
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

            {/* 시간 입력 */}
            <HStack spacing={3} align="center">
              <Input
                placeholder="시작"
                value={extraStart}
                maxLength={5}
                onChange={(e) =>
                  setExtraStart(formatTimeInput(e.target.value))
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
                value={extraFinish}
                maxLength={5}
                onChange={(e) =>
                  setExtraFinish(formatTimeInput(e.target.value))
                }
                flex="1"
                size="sm"
                bg="white"
                color="gray.800"
                _placeholder={{ color: "gray.400" }}
              />

              {/* 총 시간 표시 */}
              <Box minW="80px" textAlign="right">
                <Text fontSize="xs" color="gray.200">
                  {extraDuration ? `총 ${extraDuration}` : "총 시간 -"}
                </Text>
              </Box>
            </HStack>
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
