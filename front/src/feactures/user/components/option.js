import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Stack,
  Button,
  HStack,
  Text,
  Input,
  Checkbox,
  Select,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";

import { useUser } from "../../auth/userContext";
import locationsList from "../../common/work_placeCloums/locationsList";
import workTimeList from "../data/workTimeList";
import { minutesToHM, diffMinutes } from "../utils/timeUtils";
import { useOptionHandlers } from "../hook/useOptionHandlers";

const Option = ({ selectedDate }) => {
  const { userUuid, userName } = useUser();
  const toast = useToast();
  const cancelRef = useRef();

  const [location, setLocation] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [totalWorkTime, setTotalWorkTime] = useState("");

  const [baseShift, setBaseShift] = useState("주간");
  const [isSpecial, setIsSpecial] = useState(false);

  const [cart, setCart] = useState([]);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);

  const today = new Date();
  const displayDate = selectedDate ?? {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };

  /* ===== shift 기반 시간 필터 ===== */
  const filteredWorkTimeList = useMemo(
    () => workTimeList.filter((t) => t.shift === baseShift),
    [baseShift]
  );

  /* ===== 총 시간 계산 ===== */
  useEffect(() => {
    if (startTime && finishTime) {
      setTotalWorkTime(minutesToHM(diffMinutes(startTime, finishTime)));
    } else {
      setTotalWorkTime("");
    }
  }, [startTime, finishTime]);

  /* ===== 폼 리셋 ===== */
  const resetForm = () => {
    setLocation("");
    setWorkTime("");
    setStartTime("");
    setFinishTime("");
    setTotalWorkTime("");
    setIsSpecial(false);
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

      {/* 작업 시간 (workTimeList 기반) */}
      <Select
        placeholder="작업 시간 선택"
        value={workTime}
        onChange={(e) => {
          const selected = filteredWorkTimeList.find(
            (t) =>
              `${t.startTime}~${t.finishTime}` === e.target.value
          );
          if (!selected) return;

          setStartTime(selected.startTime);
          setFinishTime(selected.finishTime);
          setWorkTime(
            `${selected.startTime}~${selected.finishTime}`
          );
        }}
        bg="gray.800"
      >
        {filteredWorkTimeList.map((t, i) => {
          const value = `${t.startTime}~${t.finishTime}`;
          return (
            <option key={i} value={value}>
              {value}
            </option>
          );
        })}
      </Select>

      {/* 장소 선택 */}
      <Select
        placeholder="업체 / 장소 선택"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        bg="gray.800"
      >
        {locationsList.map((loc, idx) => (
          <option key={idx} value={loc}>
            {loc}
          </option>
        ))}
      </Select>

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

      {/* 등록 확인 다이얼로그 */}
      <AlertDialog
        isOpen={isSubmitConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsSubmitConfirmOpen(false)}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="gray.800" color="white">
            <AlertDialogHeader>
              전체 등록 확인
            </AlertDialogHeader>

            <AlertDialogBody>
              {cart.map((c) => (
                <Box key={c.id} bg="gray.700" p={2} borderRadius="md">
                  <Text>
                    📅 {c.work_date.year}-{c.work_date.month}-{c.work_date.day}
                  </Text>
                  <Text>
                    🕘 {c.baseShift} · {c.startTime} ~ {c.finishTime}
                  </Text>
                  <Text>📍 {c.location}</Text>
                </Box>
              ))}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() =>
                  setIsSubmitConfirmOpen(false)
                }
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