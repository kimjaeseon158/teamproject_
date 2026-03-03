import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Stack,
  Button,
  HStack,
  Text,
  Input,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

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
          onChange={() => {
            setBaseShift("주간");
            setWorkTime("");
            setStartTime("");
            setFinishTime("");
          }}
        >
          주간
        </Checkbox>

        <Checkbox
          isChecked={baseShift === "야간"}
          onChange={() => {
            setBaseShift("야간");
            setWorkTime("");
            setStartTime("");
            setFinishTime("");
          }}
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

      {/* 작업 시간 (Menu 기반) */}
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          bg="gray.800"
          border="1px solid"
          borderColor="gray.600"
          color={workTime ? "white" : "gray.400"}
          w="100%"
          textAlign="left"
        >
          {workTime || "작업 시간 선택"}
        </MenuButton>

        <MenuList bg="gray.800" borderColor="gray.600">
          {filteredWorkTimeList.map((t, i) => {
            const value = `${t.startTime}~${t.finishTime}`;
            return (
              <MenuItem
                key={i}
                bg="gray.800"
                _hover={{ bg: "gray.700" }}
                onClick={() => {
                  setStartTime(t.startTime);
                  setFinishTime(t.finishTime);
                  setWorkTime(value);
                }}
              >
                {value}
              </MenuItem>
            );
          })}
        </MenuList>
      </Menu>

      {/* 장소 선택 (Menu 기반) */}
      <Menu>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          bg="gray.800"
          border="1px solid"
          borderColor="gray.600"
          color={location ? "white" : "gray.400"}
          w="100%"
          textAlign="left"
        >
          {location || "업체 / 장소 선택"}
        </MenuButton>

        <MenuList bg="gray.800" borderColor="gray.600" maxH="240px" overflowY="auto">
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
        placeholder="총 작업 시간"
      />

      {/* 버튼 */}
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

      {/* 등록 확인 */}
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