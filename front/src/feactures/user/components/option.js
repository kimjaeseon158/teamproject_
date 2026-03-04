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
import {
  minutesToHM,
  diffMinutes,
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
      setTotalWorkTime(minutesToHM(diffMinutes(startTime, finishTime)));
    } else {
      setTotalWorkTime("");
    }
  }, [startTime, finishTime]);

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
        <Checkbox isChecked={baseShift === "주간"} onChange={() => setBaseShift("주간")}>
          주간
        </Checkbox>
        <Checkbox isChecked={baseShift === "야간"} onChange={() => setBaseShift("야간")}>
          야간
        </Checkbox>
        <Checkbox isChecked={isSpecial} onChange={(e) => setIsSpecial(e.target.checked)}>
          특근
        </Checkbox>
      </HStack>

      {/* 작업 시간 */}

      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} {...menuBtnStyle}>
          {workTime || "작업 시간 선택"}
        </MenuButton>

        <MenuList bg="gray.800" borderColor="gray.600" color="white">
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

        <MenuList bg="gray.800" borderColor="gray.600" color="white">
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

      {/* 추가 목록 */}

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
                  {item.startTime}~{item.finishTime} · {item.location}
                </Text>

                <IconButton
                  icon={<DeleteIcon />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() =>
                    setCart((prev) => prev.filter((c) => c.id !== item.id))
                  }
                />

              </HStack>
            ))}

          </Stack>

        </Box>
      )}

      <Button colorScheme="blue" onClick={handleAddToCart}>
        추가
      </Button>

      <Button colorScheme="green" onClick={onOpen} isDisabled={cart.length === 0}>
        전체 등록 ({cart.length})
      </Button>

      {/* 최종 확인 모달 */}

      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />

        <ModalContent bg="gray.800" color="white" border="1px solid" borderColor="gray.600">

          <ModalHeader>등록 확인</ModalHeader>

          <ModalBody>

            <Stack spacing={2}>

              {cart.map((item) => (
                <Box
                  key={item.id}
                  bg="gray.700"
                  p={2}
                  borderRadius="md"
                  fontSize="sm"
                >
                  {item.startTime} ~ {item.finishTime} · {item.location}
                </Box>
              ))}

            </Stack>

          </ModalBody>

          <ModalFooter>

            <Button variant="ghost" mr={3} onClick={onClose}>
              취소
            </Button>

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