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
  Checkbox,
  IconButton,
  Switch,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";

import { ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";

import { useUser } from "../../auth/userContext";
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
  const { isOpen, onOpen, onClose } = useDisclosure();

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

  useEffect(() => {
    if (startTime && finishTime) {
      setTotalWorkTime(
        minutesToHM(calculateNetMinutes(startTime, finishTime))
      );
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
  }, [extraEnabled]);

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

  const { handleAddToCart, handleConfirmSubmitAll } = useOptionHandlers({
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

  const menuBtnStyle = {
    w: "100%",
    bg: "gray.800",
    border: "1px solid",
    borderColor: "gray.600",
    color: "white",
    _hover: { bg: "gray.700" },
    _expanded: { bg: "gray.700" },
  };

  return (
    <Stack spacing={4} color="white" w="100%">
      {/* 날짜 */}
      <Box bg="gray.800" p={3} borderRadius="md">
        <Text fontSize="sm">
          {displayDate.year}년 {displayDate.month}월 {displayDate.day}일
        </Text>
      </Box>

      {/* 근무 타입 */}
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
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} {...menuBtnStyle}>
          {workTime || "작업 시간 선택"}
        </MenuButton>

        <MenuList bg="gray.800" color="white" borderColor="gray.600">
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

      {/* 장소 선택 */}
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} {...menuBtnStyle}>
          {location || "업체 / 장소 선택"}
        </MenuButton>

        <MenuList bg="gray.800" color="white" borderColor="gray.600">
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
        placeholder="총 근무 시간"
        isReadOnly
        bg="gray.800"
      />

      {/* 추가 근무 */}
      <Switch
        isChecked={extraEnabled}
        onChange={(e) => setExtraEnabled(e.target.checked)}
      >
        추가 근무
      </Switch>

      {extraWorks.map((row, idx) => (
        <Box key={idx} p={3} bg="gray.800" borderRadius="md">
          <HStack>
            <Input
              placeholder="시작"
              value={row.start}
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
              onChange={(e) =>
                updateExtraWork(idx, {
                  finish: formatTimeInput(e.target.value),
                })
              }
            />
            <Text>{row.duration || "-"}</Text>

            <IconButton
              icon={<DeleteIcon />}
              onClick={() => handleRemoveExtraRow(idx)}
            />
          </HStack>
        </Box>
      ))}

      {/* 장바구니 */}
      {cart.length > 0 && (
        <Box bg="gray.800" p={3} borderRadius="md">
          <Text>추가목록 ({cart.length})</Text>

          {cart.map((item) => (
            <Text key={item.id}>
              {item.startTime}~{item.finishTime} / {item.location}
            </Text>
          ))}
        </Box>
      )}

      <Button onClick={handleAddToCart}>추가</Button>
      <Button onClick={onOpen}>전체 등록</Button>

      {/* 모달 */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>확인</ModalHeader>
          <ModalBody>등록하시겠습니까?</ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>취소</Button>
            <Button
              colorScheme="green"
              onClick={() => {
                handleConfirmSubmitAll();
                onClose();
              }}
            >
              등록
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Stack>
  );
};

export default Option;