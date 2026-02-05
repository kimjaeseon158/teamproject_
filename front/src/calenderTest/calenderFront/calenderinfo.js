import React, { useState, useEffect, useMemo, useRef } from "react";
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
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";

import { useUser } from "../../login/js/userContext";
import locationsList from "../js/locationsList";
import workTimeList from "../js/workTimeList";
import submitWorkInfo from "../js/submitWorkInfo";
import "../css/activity.css";

/* =========================
   utils
========================= */
const minutesToHM = (mins) => {
  const m = Math.max(0, Number(mins) || 0);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
    m % 60
  ).padStart(2, "0")}`;
};

const hmToMinutes = (hm) => {
  if (!hm || !hm.includes(":")) return null;
  const [h, m] = hm.split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
};

const diffMinutes = (s, f) => {
  const start = hmToMinutes(s);
  const end = hmToMinutes(f);
  if (start == null || end == null) return 0;
  return Math.max((end < start ? end + 1440 : end) - start, 0);
};

const formatTimeInput = (v) => {
  const c = v.replace(/[^0-9]/g, "");
  if (!c) return "";
  const h = c.slice(0, 2);
  const m = c.slice(2, 4);
  return m ? `${h}:${m}` : h;
};

/* =========================
   component
========================= */
const Option = ({ selectedDate }) => {
  const { userUuid, userName } = useUser();
  const toast = useToast();
  const cancelRef = useRef();

  /* ===== 입력 상태 ===== */
  const [location, setLocation] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [totalWorkTime, setTotalWorkTime] = useState("");

  const [baseShift, setBaseShift] = useState("주간");
  const [isSpecial, setIsSpecial] = useState(false);

  const [extraEnabled, setExtraEnabled] = useState(false);
  const [extraWorks, setExtraWorks] = useState([]);

  /* ===== 장바구니 ===== */
  const [cart, setCart] = useState([]);

  /* 🔥 전체 등록 확인용 */
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);

  const filteredWorkTimeList = useMemo(
    () => workTimeList.filter((t) => t.shift === baseShift),
    [baseShift]
  );

  /* =========================
     effects
  ========================= */
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

  useEffect(() => {
    if (extraEnabled && extraWorks.length === 0) {
      setExtraWorks([{ type: "", start: "", finish: "", duration: "" }]);
    }
    if (!extraEnabled) setExtraWorks([]);
  }, [extraEnabled]);

  /* =========================
     handlers
  ========================= */
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

  /* =========================
     장바구니 추가
  ========================= */
  const handleAddToCart = () => {
    if (!location || !startTime || !finishTime) {
      toast({ title: "필수 항목을 입력하세요", status: "warning" });
      return;
    }

    const extraRows = extraEnabled
      ? extraWorks.filter((r) => r.type && r.start && r.finish)
      : [];

    const details = [
      {
        work_type: baseShift,
        minutes: diffMinutes(startTime, finishTime),
        is_overtime_approved: isSpecial,
      },
      ...extraRows.map((r) => ({
        work_type: r.type === "overtime" ? "잔업" : "중식",
        minutes: diffMinutes(r.start, r.finish),
        is_overtime_approved: true,
      })),
    ];

    setCart((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        work_date: { ...selectedDate },
        location,
        startTime,
        finishTime,
        baseShift,
        details,
      },
    ]);

    toast({ title: "장바구니에 추가됨", status: "info", duration: 1200 });
    resetForm();
  };

  /* =========================
     전체 등록
  ========================= */
  const handleSubmitAll = () => {
    if (cart.length === 0) {
      toast({ title: "등록할 항목이 없습니다", status: "info" });
      return;
    }
    setIsSubmitConfirmOpen(true);
  };
  const handleRemoveExtraRow = (idx) => {
    setExtraWorks((prev) => prev.filter((_, i) => i !== idx));
  };
  console.log(userUuid)
 const handleConfirmSubmitAll = async () => {
  try {
    const payload = cart.map(item => ({
      user_uuid: userUuid,
      user_name: userName,
      work_date: item.work_date,
      startTime: item.startTime,
      finishTime: item.finishTime,
      work_shift: item.baseShift,
      location: item.location,
      details: item.details,
    }));

    await submitWorkInfo(payload); // 🔥 배열 그대로 전달

    setCart([]);
    setIsSubmitConfirmOpen(false);
    toast({ title: "전체 등록 완료", status: "success" });
  } catch (e) {
    console.error(e);
    toast({ title: "등록 실패", status: "error" });
  }
};
  /* =========================
     UI
  ========================= */
  return (
    <Stack spacing={4} color="white" w="100%" >
      {/* 날짜 */}
      <Box bg="gray.800" p={3} borderRadius="md">
        <Text fontSize="sm">
          {selectedDate?.year}년 {selectedDate?.month}월 {selectedDate?.day}일
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
        _hover={{ bg: "gray.700" }}
      >
        {workTime || "작업 시간 선택"}
      </MenuButton>

      <MenuList
        bg="gray.800"
        borderColor="gray.600"
        color="gray.100"
        maxH="240px"
        overflowY="auto"
      >
        {filteredWorkTimeList.map((t, i) => (
          <MenuItem
            key={i}
            bg="gray.800"
            _hover={{ bg: "gray.700" }}
            onClick={() => handleSelectWorkTime(t.startTime, t.finishTime)}
          >
            {t.startTime} ~ {t.finishTime}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>

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
        _placeholder={{ color: "gray.500" }}
        placeholder="총 작업 시간"
      />

      {/* 추가 근무 */}
      <Switch
        isChecked={extraEnabled}
        onChange={(e) => setExtraEnabled(e.target.checked)}
      >
        추가 근무
      </Switch>

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
         <Select
            size="sm"
            placeholder="선택하세요"
            value={row.type}
            bg="gray.900"
            color="gray.100"
            borderColor="gray.600"
            sx={{
              option: {
                bg: "gray.800",
                color: "gray.100",
              },
            }}
            _hover={{ borderColor: "gray.500" }}
            _focus={{
              borderColor: "blue.400",
              boxShadow: "0 0 0 1px #63B3ED",
            }}
            onChange={(e) =>
              updateExtraWork(idx, { type: e.target.value })
            }
          >
            <option value="overtime">잔업</option>
            <option value="lunch">중식</option>
          </Select>
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
            🧺 장바구니 ({cart.length})
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
                  {item.work_date.year}.{item.work_date.month}.{item.work_date.day} ·{" "}
                  {item.baseShift} · {item.startTime}~{item.finishTime}
                </Text>

                <IconButton
                  icon={<DeleteIcon />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() =>
                    setCart((prev) => prev.filter((c) => c.id !== item.id))
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

                  <Text>
                    📍 {c.location}
                  </Text>
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
