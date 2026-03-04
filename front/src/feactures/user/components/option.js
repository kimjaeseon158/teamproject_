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
import { minutesToHM, diffMinutes, formatTimeInput } from "../utils/timeUtils";
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

  const {
    handleAddToCart,
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

      {/* 장소 */}
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

      <Input
        value={totalWorkTime || ""}
        placeholder="총 근무 시간 (00:00)"
        isReadOnly
        bg="gray.800"
        borderColor="gray.600"
        color="white"
      />

      {/* 추가 근무 */}
      <Switch isChecked={extraEnabled} onChange={(e) => setExtraEnabled(e.target.checked)}>
        추가 근무
      </Switch>

      {extraWorks.map((row, idx) => (
        <Box key={idx} p={3} bg="gray.800" borderRadius="md" border="1px solid" borderColor="gray.600">

          <HStack mb={2}>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} {...menuBtnStyle}>
                {row.type === "overtime" ? "잔업" : row.type === "lunch" ? "중식" : "근무 선택"}
              </MenuButton>

              <MenuList bg="gray.800" borderColor="gray.600">
                <MenuItem bg="gray.800" _hover={{ bg: "gray.700" }} onClick={() => updateExtraWork(idx, { type: "overtime" })}>
                  잔업
                </MenuItem>
                <MenuItem bg="gray.800" _hover={{ bg: "gray.700" }} onClick={() => updateExtraWork(idx, { type: "lunch" })}>
                  중식
                </MenuItem>
              </MenuList>
            </Menu>

            <IconButton
              icon={<DeleteIcon />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => handleRemoveExtraRow(idx)}
            />
          </HStack>

          <HStack>
            <Input
              placeholder="시작"
              value={row.start}
              bg="gray.900"
              onChange={(e) => updateExtraWork(idx, { start: formatTimeInput(e.target.value) })}
            />
            <Text>~</Text>
            <Input
              placeholder="종료"
              value={row.finish}
              bg="gray.900"
              onChange={(e) => updateExtraWork(idx, { finish: formatTimeInput(e.target.value) })}
            />
            <Text fontSize="xs">{row.duration || "-"}</Text>
          </HStack>

        </Box>
      ))}

      {/* 추가목록 */}
      {cart.length > 0 && (
        <Box bg="gray.800" p={3} borderRadius="md">

          <Text fontSize="sm" fontWeight="600" mb={2}>
            추가목록 ({cart.length})
          </Text>

          <Stack spacing={2}>

            {cart.map((item) => (
              <Box key={item.id} bg="gray.700" borderRadius="md" p={3} fontSize="sm">

                <Stack spacing={1}>

                  <HStack>
                    <Text>📅</Text>
                    <Text>
                      {item.work_date.year}-{String(item.work_date.month).padStart(2,"0")}-{String(item.work_date.day).padStart(2,"0")}
                    </Text>
                  </HStack>

                  <HStack>
                    <Text>⏰</Text>
                    <Text>
                      {item.baseShift} · {item.startTime} ~ {item.finishTime}
                    </Text>
                  </HStack>

                  <HStack>
                    <Text>📍</Text>
                    <Text>{item.location}</Text>
                  </HStack>

                </Stack>

              </Box>
            ))}

          </Stack>
        </Box>
      )}

      <Button colorScheme="blue" onClick={handleAddToCart}>추가</Button>

      <Button colorScheme="green" onClick={onOpen} isDisabled={cart.length === 0}>
        전체 등록 ({cart.length})
      </Button>

      {/* 모달 */}
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.600" />

        <ModalContent bg="gray.800" border="1px solid" borderColor="gray.600" color="white">

          <ModalHeader>전체 등록 확인</ModalHeader>

          <ModalBody>
            <Stack spacing={3}>
              {cart.map((item) => (
                <Box key={item.id} bg="gray.700" p={3} borderRadius="md">
                  <Text fontSize="sm">
                    📅 {item.work_date.year}-{item.work_date.month}-{item.work_date.day}
                  </Text>
                  <Text fontSize="sm">
                    ⏰ {item.baseShift} · {item.startTime} ~ {item.finishTime}
                  </Text>
                  <Text fontSize="sm">
                    📍 {item.location}
                  </Text>
                </Box>
              ))}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} bg="gray.300" color="black" _hover={{ bg: "gray.400" }} onClick={onClose}>
              취소
            </Button>
            <Button colorScheme="green" onClick={() => { handleConfirmSubmitAll(); onClose(); }}>
              등록
            </Button>
          </ModalFooter>

        </ModalContent>
      </Modal>

    </Stack>
  );
};

export default Option;