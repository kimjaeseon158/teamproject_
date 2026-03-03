import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  Stack,
  Button,
  HStack,
  Text,
  Input,
  Checkbox,
  Switch,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
      setExtraWorks([{ type: "overtime", start: "", finish: "", duration: "" }]);
    }
    if (!extraEnabled) {
      setExtraWorks([]);
    }
  }, [extraEnabled]);

  const updateExtra = (idx, patch) => {
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

  const removeExtra = (idx) => {
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

  return (
    <Stack spacing={4} color="white" w="100%">
      {/* 날짜 */}
      <Box bg="gray.800" p={3} borderRadius="md">
        <Text>{displayDate.year}.{displayDate.month}.{displayDate.day}</Text>
      </Box>

      {/* 근무형태 */}
      <HStack>
        <Checkbox isChecked={baseShift === "주간"} onChange={() => setBaseShift("주간")}>주간</Checkbox>
        <Checkbox isChecked={baseShift === "야간"} onChange={() => setBaseShift("야간")}>야간</Checkbox>
        <Checkbox isChecked={isSpecial} onChange={(e) => setIsSpecial(e.target.checked)}>특근</Checkbox>
      </HStack>

      {/* 작업 시간 */}
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="gray.800" w="100%">
          {workTime || "작업 시간 선택"}
        </MenuButton>
        <MenuList bg="gray.800">
          {filteredWorkTimeList.map((t, i) => {
            const value = `${t.startTime}~${t.finishTime}`;
            return (
              <MenuItem key={i} onClick={() => {
                setStartTime(t.startTime);
                setFinishTime(t.finishTime);
                setWorkTime(value);
              }}>
                {value}
              </MenuItem>
            );
          })}
        </MenuList>
      </Menu>

      {/* 장소 */}
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="gray.800" w="100%">
          {location || "업체 선택"}
        </MenuButton>
        <MenuList bg="gray.800">
          {locationsList.map((loc, i) => (
            <MenuItem key={i} onClick={() => setLocation(loc)}>
              {loc}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      {/* 총 시간 */}
      <Input value={totalWorkTime} isReadOnly bg="gray.800" />

      {/* 잔업 스위치 */}
      <Switch isChecked={extraEnabled} onChange={(e) => setExtraEnabled(e.target.checked)}>
        잔업 추가
      </Switch>

      {/* 잔업 리스트 */}
      {extraWorks.map((row, idx) => (
        <Box key={idx} bg="gray.800" p={3} borderRadius="md">
          <HStack>
            <Input
              placeholder="시작"
              value={row.start}
              onChange={(e) => updateExtra(idx, { start: formatTimeInput(e.target.value) })}
            />
            <Text>~</Text>
            <Input
              placeholder="종료"
              value={row.finish}
              onChange={(e) => updateExtra(idx, { finish: formatTimeInput(e.target.value) })}
            />
            <Text>{row.duration || "-"}</Text>
            <IconButton icon={<DeleteIcon />} onClick={() => removeExtra(idx)} />
          </HStack>
        </Box>
      ))}

      {/* 추가목록 미리보기 */}
      {cart.length > 0 && (
        <Box bg="gray.800" p={3} borderRadius="md">
          <Text>추가목록 ({cart.length})</Text>
          {cart.map((item) => (
            <Box key={item.id} bg="gray.700" p={2} borderRadius="md">
              <Text>{item.startTime}~{item.finishTime}</Text>
            </Box>
          ))}
        </Box>
      )}

      <Button colorScheme="blue" onClick={handleAddToCart}>추가</Button>
      <Button colorScheme="green" onClick={handleSubmitAll} isDisabled={!cart.length}>
        전체 등록
      </Button>

      <AlertDialog isOpen={isSubmitConfirmOpen} leastDestructiveRef={cancelRef} onClose={() => setIsSubmitConfirmOpen(false)}>
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
              <Button onClick={handleConfirmSubmitAll} ml={3} colorScheme="green">등록</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Stack>
  );
};

export default Option;