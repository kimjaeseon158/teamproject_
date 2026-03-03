import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Stack,
  Button,
  HStack,
  Text,
  Input,
  Switch,
  Checkbox,
  IconButton,
  Select,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

import { useUser } from "../../auth/userContext";
import locationsList from "../../common/work_placeCloums/locationsList";
import {
  minutesToHM,
  diffMinutes,
  formatTimeInput,
} from "../utils/timeUtils";
import { useOptionHandlers } from "../hook/useOptionHandlers";

const Option = ({ selectedDate }) => {
  const { userUuid, userName } = useUser();
  const toast = useToast();
  const cancelRef = useRef();

  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [totalWorkTime, setTotalWorkTime] = useState("");

  const [baseShift, setBaseShift] = useState("주간");
  const [isSpecial, setIsSpecial] = useState(false);

  const [extraEnabled, setExtraEnabled] = useState(false);
  const [extraWorks, setExtraWorks] = useState([]);

  const [cart, setCart] = useState([]);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);

  const today = new Date();
  const displayDate = selectedDate ?? {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };

  /* ===== 시간 옵션 생성 ===== */
  const timeOptions = useMemo(() => {
    const arr = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 10) {
        arr.push(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        );
      }
    }
    return arr;
  }, []);

  useEffect(() => {
    if (startTime && finishTime) {
      setTotalWorkTime(minutesToHM(diffMinutes(startTime, finishTime)));
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
    setStartTime("");
    setFinishTime("");
    setTotalWorkTime("");
    setIsSpecial(false);
    setExtraEnabled(false);
    setExtraWorks([]);
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
      <HStack spacing={3}>
        <Select
          placeholder="시작 시간"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          bg="gray.800"
        >
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </Select>

        <Text>~</Text>

        <Select
          placeholder="종료 시간"
          value={finishTime}
          onChange={(e) => setFinishTime(e.target.value)}
          bg="gray.800"
        >
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </Select>
      </HStack>

      {/* 총 시간 */}
      <Input
        value={totalWorkTime}
        isReadOnly
        bg="gray.800"
        placeholder="총 작업 시간"
      />

      {/* 액션 버튼 */}
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

      {/* 확인 다이얼로그 */}
      <AlertDialog
        isOpen={isSubmitConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsSubmitConfirmOpen(false)}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="gray.800" color="white">
            <AlertDialogHeader>전체 등록 확인</AlertDialogHeader>
            <AlertDialogBody>
              {cart.map((c) => (
                <Box key={c.id} bg="gray.700" p={2} borderRadius="md">
                  <Text>
                    {c.work_date.year}-{c.work_date.month}-{c.work_date.day}
                  </Text>
                  <Text>
                    {c.baseShift} · {c.startTime} ~ {c.finishTime}
                  </Text>
                </Box>
              ))}
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