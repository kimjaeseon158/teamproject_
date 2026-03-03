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
import workTimeList from "../data/workTimeList";
import { minutesToHM, diffMinutes, formatTimeInput } from "../utils/timeUtils";
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

  const filteredWorkTimeList = useMemo(
    () => workTimeList.filter((t) => t.shift === baseShift),
    [baseShift]
  );

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
    setWorkTime("");
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

  const handleSelectWorkTime = (value) => {
    const selected = filteredWorkTimeList.find(
      (t) => `${t.startTime}~${t.finishTime}` === value
    );
    if (!selected) return;

    setStartTime(selected.startTime);
    setFinishTime(selected.finishTime);
    setWorkTime(value);
  };

  return (
    <Stack spacing={4} color="white" w="100%">
      <Box bg="gray.800" p={3} borderRadius="md">
        <Text fontSize="sm">
          {displayDate.year}년 {displayDate.month}월 {displayDate.day}일
        </Text>
      </Box>

      <HStack>
        <Checkbox isChecked={baseShift === "주간"} onChange={() => setBaseShift("주간")}>주간</Checkbox>
        <Checkbox isChecked={baseShift === "야간"} onChange={() => setBaseShift("야간")}>야간</Checkbox>
        <Checkbox isChecked={isSpecial} onChange={(e) => setIsSpecial(e.target.checked)}>특근</Checkbox>
      </HStack>

      <Select
        placeholder="작업 시간 선택"
        value={workTime}
        onChange={(e) => handleSelectWorkTime(e.target.value)}
        bg="gray.800"
        color="white"
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

      <Select
        placeholder="업체 / 장소 선택"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        bg="gray.800"
        color="white"
      >
        {locationsList.map((loc, idx) => (
          <option key={idx} value={loc}>
            {loc}
          </option>
        ))}
      </Select>

      <Input value={totalWorkTime} isReadOnly bg="gray.800" />

      <Switch isChecked={extraEnabled} onChange={(e) => setExtraEnabled(e.target.checked)}>
        추가 근무
      </Switch>

      {extraWorks.map((row, idx) => (
        <Box key={idx} p={3} bg="gray.800" borderRadius="md">
          <HStack>
            <Input
              placeholder="시작"
              value={row.start}
              onChange={(e) =>
                updateExtraWork(idx, { start: formatTimeInput(e.target.value) })
              }
            />
            <Text>~</Text>
            <Input
              placeholder="종료"
              value={row.finish}
              onChange={(e) =>
                updateExtraWork(idx, { finish: formatTimeInput(e.target.value) })
              }
            />
            <Text>{row.duration || "-"}</Text>
            <IconButton
              icon={<DeleteIcon />}
              size="sm"
              onClick={() => handleRemoveExtraRow(idx)}
            />
          </HStack>
        </Box>
      ))}

      <Button colorScheme="blue" onClick={handleAddToCart}>추가</Button>
      <Button colorScheme="green" onClick={handleSubmitAll} isDisabled={!cart.length}>
        전체 등록 ({cart.length})
      </Button>

      <AlertDialog
        isOpen={isSubmitConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsSubmitConfirmOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>등록 확인</AlertDialogHeader>
            <AlertDialogBody>
              {cart.map((c) => (
                <Text key={c.id}>{c.startTime}~{c.finishTime}</Text>
              ))}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={() => setIsSubmitConfirmOpen(false)}>취소</Button>
              <Button ml={3} colorScheme="green" onClick={handleConfirmSubmitAll}>
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