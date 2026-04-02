import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Stack, Button, Menu, MenuButton, MenuList, MenuItem,
  HStack, Text, Input, Select, Switch, Checkbox, IconButton,
  useToast, AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
} from "@chakra-ui/react";
import { ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";

import { useUser } from "../../auth/userContext";
import { useBreakpointValue } from "@chakra-ui/react";
import TimeWheelPicker from "../../common/TimeWheelPicker";
import locationsList from "../../common/work_placeCloums/locationsList";
import workTimeList from "../data/workTimeList";
import "./activity.css";

import {
  minutesToHM,
  diffMinutes,
  calculateNetMinutes,
  formatTimeInput,
} from "../utils/timeUtils";

import { useOptionHandlers } from "../hook/useOptionHandlers";

const Option = ({ selectedDate }) => {
  const { userUuid, userName } = useUser();
  const toast = useToast();
  const cancelRef = useRef();

  /* ===== 상태 (원본 그대로) ===== */
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
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const filteredWorkTimeList = useMemo(
    () => workTimeList.filter((t) => t.shift === baseShift),
    [baseShift]
  );
  const today = new Date();

  const displayDate = selectedDate ?? {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
  useEffect(() => {
    if (startTime && finishTime) {
      setTotalWorkTime(minutesToHM(calculateNetMinutes(startTime, finishTime)));
    } else {
      setTotalWorkTime("");
    }
  }, [startTime, finishTime]);

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
      prev.map((r, i) => {
        if (i !== idx) return r;

        const n = { ...r, ...patch };
        n.duration =
          n.start && n.finish
            ? minutesToHM(diffMinutes(n.start, n.finish))
            : "";
        return n;
      })
    );
  };
  const handleRemoveExtraRow = (idx) => {
    setExtraWorks((prev) => prev.filter((_, i) => i !== idx));
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
  const handleSelectWorkTime = (s, f) => {
    setStartTime(s);
    setFinishTime(f);
    setWorkTime(`${s}~${f}`);
  };
  const {
    handleAddToCart,
    handleSubmitAll,
    handleConfirmSubmitAll,
  } = useOptionHandlers({
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

    setIsSubmitConfirmOpen,
  });

  /* ===== return JSX ===== */
return (
  <Stack spacing={4} color="white" w="100%">
    {/* 날짜 */}
    <Box bg="gray.800" p={3} borderRadius="md">
      <Text fontSize="sm">
        {displayDate.year}년 {displayDate.month}월 {displayDate.day}일
      </Text>
    </Box>
    {/* 근무형태 */}
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
    {isMobile ? (
      <Box
        bg="gray.800"
        p={4}
        borderRadius="xl"
        boxShadow="lg"
      >
        <HStack spacing={4} justify="center">
          <TimeWheelPicker
            value={startTime}
            onChange={setStartTime}
          />

          <Text fontSize="2xl" fontWeight="bold">
            ~
          </Text>

          <TimeWheelPicker
            value={finishTime}
            onChange={setFinishTime}
          />
        </HStack>
      </Box>
    ) : (
      <Menu>
        <MenuButton
          as={Button}
          variant="outline"
          rightIcon={<ChevronDownIcon />}
          width="100%"
          justifyContent="space-between"
          bg="gray.800"
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
              color="gray.100"
              _hover={{ bg: "gray.700" }}
              _focus={{ bg: "gray.700" }}
              onClick={() =>
                handleSelectWorkTime(t.startTime, t.finishTime)
              }
            >
              {t.startTime} ~ {t.finishTime}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    )}
    {/* 장소 */}
    <Menu>
      <MenuButton
        as={Button}
        variant="outline"
        rightIcon={<ChevronDownIcon />}
        width="100%"
        justifyContent="space-between"
        bg="gray.800"
        borderColor="gray.600"
        color={location ? "gray.100" : "gray.400"}
        _hover={{ bg: "gray.700" }}
      >
        {location || "업체 / 장소 선택"}
      </MenuButton>

      <MenuList
        bg="gray.800"
        borderColor="gray.600"
        color="gray.100"
        maxH="240px"
        overflowY="auto"
      >
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
      color="gray.100"
      placeholder="총 작업 시간"
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
        borderRadius="md"
        bg="gray.800"          
        border="1px solid"
        borderColor="gray.600"
      >
        <HStack spacing={2} mb={2}>
          <Menu>
            <MenuButton
              as={Button}
              w="100%"
              bg="gray.900"
              color="gray.100"
              border="1px solid"
              borderColor="gray.600"
              rightIcon={<ChevronDownIcon />}
            >
              {row.type === "weekday_ot" ? "평일 잔업" :
               row.type === "holiday_special" ? "휴일 특근" :
               row.type === "holiday_ot" ? "휴일 잔업" :
               row.type === "night_shift" ? "철야" :
               row.type === "night_ot" ? "철야 잔업" :
               row.type === "early_arrival" ? "조기 출근" :
               row.type === "lunch_ext" ? "중식 연장" :
               "근무 선택"}
            </MenuButton>

            <MenuList bg="gray.800" borderColor="gray.600">
              <MenuItem bg="gray.800" _hover={{ bg: "gray.700" }} onClick={() => updateExtraWork(idx, { type: "weekday_ot" })}>평일 잔업</MenuItem>
              <MenuItem bg="gray.800" _hover={{ bg: "gray.700" }} onClick={() => updateExtraWork(idx, { type: "holiday_special" })}>휴일 특근</MenuItem>
              <MenuItem bg="gray.800" _hover={{ bg: "gray.700" }} onClick={() => updateExtraWork(idx, { type: "holiday_ot" })}>휴일 잔업</MenuItem>
              <MenuItem bg="gray.800" _hover={{ bg: "gray.700" }} onClick={() => updateExtraWork(idx, { type: "night_shift" })}>철야</MenuItem>
              <MenuItem bg="gray.800" _hover={{ bg: "gray.700" }} onClick={() => updateExtraWork(idx, { type: "night_ot" })}>철야 잔업</MenuItem>
              <MenuItem bg="gray.800" _hover={{ bg: "gray.700" }} onClick={() => updateExtraWork(idx, { type: "early_arrival" })}>조기 출근</MenuItem>
              <MenuItem bg="gray.800" _hover={{ bg: "gray.700" }} onClick={() => updateExtraWork(idx, { type: "lunch_ext" })}>중식 연장</MenuItem>
            </MenuList>
          </Menu>

          <IconButton
            icon={<DeleteIcon />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={() => handleRemoveExtraRow(idx)}
            aria-label="삭제"
          />
        </HStack>

        <HStack spacing={3}>
          <Input
            placeholder="시작"
            value={row.start}
            bg="gray.900"
            color="gray.100"
            borderColor="gray.600"
            _focus={{ borderColor: "blue.400" }}
            _hover={{ borderColor: "gray.500" }}
            onChange={(e) =>
              updateExtraWork(idx, {
                start: formatTimeInput(e.target.value),
              })
            }
          />
          <Text color="gray.300">~</Text>
          <Input
            placeholder="종료"
            value={row.finish}
            bg="gray.900"
            color="gray.100"
            borderColor="gray.600"
            _focus={{ borderColor: "blue.400" }}
            _hover={{ borderColor: "gray.500" }}
            onChange={(e) =>
              updateExtraWork(idx, {
                finish: formatTimeInput(e.target.value),
              })
            }
          />
          <Text fontSize="xs" color="gray.200" minW="80px">
            {row.duration ? `총 ${row.duration}` : "총 시간 -"}
          </Text>
        </HStack>
      </Box>
    ))}
    {/* 장바구니 */}
    {cart.length > 0 && (
      <Box bg="gray.800" p={3} borderRadius="md">
        <Text fontSize="sm" fontWeight="600" mb={2}>
          추가목록 ({cart.length})
        </Text>

        <Stack spacing={1}>
          {cart.map((item) => (
            <HStack
              key={item.id}
              justify="space-between"
              bg="gray.700"
              px={3}
              py={2}
              borderRadius="md"
              fontSize="sm"
            >
              <Text>
                {item.work_date.year}.{item.work_date.month}.
                {item.work_date.day} · {item.baseShift} ·{" "}
                {item.startTime}~{item.finishTime}
              </Text>

              <IconButton
                icon={<DeleteIcon />}
                size="xs"
                variant="ghost"
                colorScheme="red"
                onClick={() =>
                  setCart((prev) =>
                    prev.filter((c) => c.id !== item.id)
                  )
                }
                aria-label="삭제"
              />
            </HStack>
          ))}
        </Stack>
      </Box>
    )}

    {/* 액션 */}
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

    {/* 전체 등록 확인 */}
    <AlertDialog
      isOpen={isSubmitConfirmOpen}
      leastDestructiveRef={cancelRef}
      onClose={() => setIsSubmitConfirmOpen(false)}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent bg="gray.800" color="white">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            전체 등록 확인
          </AlertDialogHeader>

          <AlertDialogBody>
            <Stack spacing={2} fontSize="sm">
              {cart.map((c) => (
                <Box
                  key={c.id}
                  bg="gray.700"
                  p={2}
                  borderRadius="md"
                >
                  <Text>
                    📅 {c.work_date.year}-
                    {String(c.work_date.month).padStart(2, "0")}-
                    {String(c.work_date.day).padStart(2, "0")}
                  </Text>
                  <Text>
                    🕘 {c.baseShift} · {c.startTime} ~ {c.finishTime}
                  </Text>
                  <Text>📍 {c.location}</Text>
                </Box>
              ))}
            </Stack>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={() => setIsSubmitConfirmOpen(false)}
            >
              취소
            </Button>
            <Button
              colorScheme="green"
              ml={3}
              onClick={handleConfirmSubmitAll}
            >
              등록
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  </Stack>
);


};

export default Option;
