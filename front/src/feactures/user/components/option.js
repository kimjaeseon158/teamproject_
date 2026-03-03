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
  Switch,
  Checkbox,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";

import { useUser } from "../../auth/userContext";
import locationsList from "../../common/work_placeCloums/locationsList";
import workTimeList from "../data/workTimeList";
import {
  minutesToHM,
  diffMinutes,
  formatTimeInput,
} from "../utils/timeUtils";
import { useOptionHandlers } from "../hook/useOptionHandlers";

const Option = ({ selectedDate }) => {
  const { userUuid, userName } = useUser();
  const toast = useToast();

  const [location, setLocation] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [totalWorkTime, setTotalWorkTime] = useState("");

  const [baseShift, setBaseShift] = useState("주간");
  const [isSpecial, setIsSpecial] = useState(false);

  const [extraEnabled, setExtraEnabled] = useState(false);
  const [extraWorks, setExtraWorks] = useState([]);

  const [cart, setCart] = useState([]);

  const today = new Date();
  const displayDate = selectedDate ?? {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };

  const filteredWorkTimeList = useMemo(
    () => workTimeList.filter((t) => t.shift === baseShift),
    [baseShift]
  );

  /* ===== 기본 근무 시간 계산 ===== */
  useEffect(() => {
    if (startTime && finishTime) {
      setTotalWorkTime(minutesToHM(diffMinutes(startTime, finishTime)));
    } else {
      setTotalWorkTime("");
    }
  }, [startTime, finishTime]);

  /* ===== 추가 근무 관리 ===== */
  useEffect(() => {
    if (extraEnabled && extraWorks.length === 0) {
      setExtraWorks([{ type: "", start: "", finish: "", duration: "" }]);
    }
    if (!extraEnabled && extraWorks.length > 0) {
      setExtraWorks([]);
    }
  }, [extraEnabled, extraWorks.length]);

  const updateExtraWork = (idx, patch) => {
    setExtraWorks((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const next = { ...row, ...patch };
        next.duration =
          next.start && next.finish
            ? minutesToHM(diffMinutes(next.start, next.finish))
            : "";
        return next;
      })
    );
  };

  const handleRemoveExtraRow = (idx) => {
    setExtraWorks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSelectWorkTime = (s, f) => {
    setStartTime(s);
    setFinishTime(f);
    setWorkTime(`${s}~${f}`);
  };

  const resetForm = () => {
    setLocation("");
    setWorkTime("");
    setStartTime("");
    setFinishTime("");
    setTotalWorkTime("");
    setIsSpecial(false);
    setExtraEnabled(false);
    setExtraWorks([]);
  };

  const { handleAddToCart, handleSubmitAll } = useOptionHandlers({
    selectedDate,
    userUuid,
    userName,
    cart,
    setCart,
    toast,
    resetForm,
    baseShift,
    isSpecial,
    startTime,
    finishTime,
    location,
    extraEnabled,
    extraWorks,
  });

  return (
    <Stack spacing={4} color="white" w="100%">
      {/* 날짜 */}
      <Box bg="gray.800" p={3} borderRadius="md">
        <Text fontSize="sm">
          {displayDate.year}년 {displayDate.month}월 {displayDate.day}일
        </Text>
      </Box>

      {/* 근무 형태 */}
      <HStack>
        <Checkbox
          isChecked={baseShift === "주간"}
          onChange={() => setBaseShift("주간")}
        >
          주간
        </Checkbox>
        <Checkbox
          isChecked={baseShift === "야간"}
          onChange={() => setBaseShift("야간")}
        >
          야간
        </Checkbox>
        <Checkbox
          isChecked={isSpecial}
          onChange={(e) => setIsSpecial(e.target.checked)}
        >
          특근
        </Checkbox>
      </HStack>

      {/* 작업 시간 */}
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          w="100%"
          bg="gray.800"
          border="1px solid"
          borderColor="gray.600"
          color={workTime ? "gray.100" : "gray.400"}
        >
          {workTime || "작업 시간 선택"}
        </MenuButton>

        <MenuList bg="gray.800" borderColor="gray.600">
          {filteredWorkTimeList.map((t, i) => (
            <MenuItem
              key={i}
              bg="gray.800"
              _hover={{ bg: "gray.700" }}
              onClick={() =>
                handleSelectWorkTime(t.startTime, t.finishTime)
              }
            >
              {t.startTime} ~ {t.finishTime}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      {/* 장소 선택 */}
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          w="100%"
          bg="gray.800"
          border="1px solid"
          borderColor="gray.600"
          color={location ? "gray.100" : "gray.400"}
        >
          {location || "업체 / 장소 선택"}
        </MenuButton>

        <MenuList bg="gray.800" borderColor="gray.600">
          {locationsList.map((loc, idx) => (
            <MenuItem
              key={idx}
              bg="gray.800"
              _hover={{ bg: "gray.700" }}
              onClick={() => setLocation(loc)}
            >
              {loc}
            </MenuItem>
          ))}
        </MenuList> 
      </Menu>

      {/* 총 시간 */}
      <Input
        value={totalWorkTime}
        isReadOnly
        bg="gray.800"
        borderColor="gray.600"
      />

      {/* 추가 근무 */}
      <Switch
        isChecked={extraEnabled}
        onChange={(e) => setExtraEnabled(e.target.checked)}
      >
        추가 근무
      </Switch>

      {/* 추가 근무 리스트 */}
      {extraWorks.map((row, idx) => (
        <Box
          key={idx}
          p={3}
          bg="gray.800"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.600"
        >
          <HStack spacing={3}>
            <Input
              placeholder="시작"
              value={row.start}
              bg="gray.900"
              onChange={(e) =>
                updateExtraWork(idx, {
                  start: formatTimeInput(e.target.value),
                })
              }
            />
            <Text>~</Text>
            <Input
              placeholder="종료"
              value={row.finish}
              bg="gray.900"
              onChange={(e) =>
                updateExtraWork(idx, {
                  finish: formatTimeInput(e.target.value),
                })
              }
            />
            <Text fontSize="xs">
              {row.duration || "-"}
            </Text>
            <IconButton
              icon={<DeleteIcon />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => handleRemoveExtraRow(idx)}
              aria-label="삭제"
            />
          </HStack>
        </Box>
      ))}

      <Button colorScheme="blue" onClick={handleAddToCart}>
        추가
      </Button>

      <Button
        colorScheme="green"
        onClick={handleSubmitAll}
        isDisabled={cart.length === 0}
      >
        전체 등록 ({cart.length})
      </Button>
    </Stack>
  );
};

export default Option;