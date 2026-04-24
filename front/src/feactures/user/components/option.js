import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Stack, Button, Menu, MenuButton, MenuList, MenuItem,
  HStack, Text, Input, Switch, IconButton, VStack,
  useToast, AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  Badge, Center
} from "@chakra-ui/react";
import { ChevronDownIcon, DeleteIcon, TimeIcon, InfoOutlineIcon } from "@chakra-ui/icons";

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
} from "../utils/timeUtils";

import { useOptionHandlers } from "../hook/useOptionHandlers";

const Option = ({ selectedDate, onRefresh, onClose }) => {
  const { userUuid, userName } = useUser();
  const toast = useToast();
  const cancelRef = useRef();

  const [location, setLocation] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");

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

  // 🔥 실시간 자동 계산 (Error Fix: setTotalWorkTime 제거 대응)
  const totalWorkTime = useMemo(() => {
    if (startTime && finishTime) {
      return minutesToHM(calculateNetMinutes(startTime, finishTime));
    }
    return "";
  }, [startTime, finishTime]);

  useEffect(() => {
    if (extraEnabled && extraWorks.length === 0) {
      setExtraWorks([{ type: "", start: "17:00", finish: "19:00", duration: "" }]);
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
        n.duration = (n.start && n.finish) ? minutesToHM(diffMinutes(n.start, n.finish)) : "";
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
    handleDeleteFromCart,
    handleSubmitAll,
    handleConfirmSubmitAll,
  } = useOptionHandlers({
    selectedDate, userUuid, userName, cart, setCart, toast, resetForm,
    baseShift, isSpecial, startTime, finishTime, location, extraEnabled, extraWorks,
    setIsSubmitConfirmOpen,
    onRefresh,
    onClose, // 🔥 추가
  });

  useEffect(() => {
    if (cart.length === 0 && isSubmitConfirmOpen) {
      setIsSubmitConfirmOpen(false);
    }
  }, [cart.length, isSubmitConfirmOpen]);

  /* 모바일용 세그먼트 버튼 컴포넌트 */
  const SegmentedControl = () => (
    <HStack bg="whiteAlpha.100" p={1} borderRadius="xl" w="100%">
      {["주간", "야간"].map((s) => (
        <Center
          key={s}
          flex={1}
          py={2}
          borderRadius="lg"
          bg={baseShift === s ? "blue.500" : "transparent"}
          color={baseShift === s ? "white" : "gray.400"}
          fontWeight="bold"
          fontSize="sm"
          cursor="pointer"
          onClick={() => {
            setBaseShift(s);
            setWorkTime("");
            setStartTime("");
            setFinishTime("");
          }}
          transition="all 0.2s"
        >
          {s}
        </Center>
      ))}
      <Center
        flex={1}
        py={2}
        borderRadius="lg"
        bg={isSpecial ? "orange.400" : "transparent"}
        color={isSpecial ? "white" : "gray.400"}
        fontWeight="bold"
        fontSize="sm"
        cursor="pointer"
        onClick={() => setIsSpecial(!isSpecial)}
        transition="all 0.2s"
      >
        특근 {isSpecial && "✓"}
      </Center>
    </HStack>
  );

  return (
    <Stack spacing={5} color="white" w="100%" pb={10}>
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={0}>
          <Text fontSize="2xl" fontWeight="900" letterSpacing="-1px">
            {displayDate.month}월 {displayDate.day}일
          </Text>
          <Text fontSize="xs" color="gray.500">{displayDate.year}년 활동 기록</Text>
        </VStack>
        <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
          {baseShift} {isSpecial && "/ 특근"}
        </Badge>
      </HStack>

      <SegmentedControl />

      <VStack align="stretch" spacing={2}>
        <Text fontSize="xs" fontWeight="bold" color="gray.500" ml={1}>근무 시간</Text>
        <Menu>
          <MenuButton 
            as={Button} 
            variant="unstyled" 
            w="100%" 
            h="56px"
            bg="whiteAlpha.100" 
            borderRadius="16px"
            px={4}
            textAlign="left"
          >
            <HStack justify="space-between" w="100%">
              <Text color={workTime ? "white" : "gray.500"} fontSize="md" fontWeight="600" isTruncated>
                {workTime || "근무 시간을 선택하세요"}
              </Text>
              <ChevronDownIcon color="gray.500" />
            </HStack>
          </MenuButton>
          <MenuList bg="#2c2c2e" borderColor="whiteAlpha.200" color="white" maxH="300px" overflowY="auto" borderRadius="16px">
            {filteredWorkTimeList.map((t, i) => (
              <MenuItem 
                key={i} 
                bg="transparent" 
                _hover={{ bg: "whiteAlpha.100" }} 
                onClick={() => handleSelectWorkTime(t.startTime, t.finishTime)} 
                py={3}
              >
                <HStack justify="space-between" w="100%">
                  <Text fontSize="md" fontWeight="600">{t.startTime} ~ {t.finishTime}</Text>
                  <Text fontSize="xs" color="gray.500">
                    ({minutesToHM(calculateNetMinutes(t.startTime, t.finishTime))})
                  </Text>
                </HStack>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        {totalWorkTime && (
          <Center 
            py={2} 
            px={4} 
            borderRadius="12px" 
            border="1px dashed" 
            borderColor="blue.500" 
            bg="blue.900" 
            bgOpacity="0.1"
          >
            <HStack spacing={2}>
              <TimeIcon color="blue.300" w={3} h={3} />
              <Text fontSize="sm" fontWeight="bold" color="blue.300">
                총 근무 시간: <Text as="span" color="white">{totalWorkTime}</Text>
              </Text>
            </HStack>
          </Center>
        )}
      </VStack>

      <VStack align="stretch" spacing={2}>
        <Text fontSize="xs" fontWeight="bold" color="gray.500" ml={1}>업체 및 장소</Text>
        <Menu>
          <MenuButton 
            as={Button} 
            variant="unstyled" 
            w="100%" 
            h="56px"
            bg="whiteAlpha.100" 
            borderRadius="16px"
            px={4}
            textAlign="left"
          >
            <HStack justify="space-between" w="100%">
              <Text color={location ? "white" : "gray.500"} fontSize="md" fontWeight="600" isTruncated>
                {location || "근무 장소를 선택하세요"}
              </Text>
              <ChevronDownIcon color="gray.500" />
            </HStack>
          </MenuButton>
          <MenuList bg="#2c2c2e" borderColor="whiteAlpha.200" color="white" maxH="300px" overflowY="auto" borderRadius="16px">
            {locationsList.map((loc, idx) => (
              <MenuItem key={idx} bg="transparent" _hover={{ bg: "whiteAlpha.100" }} onClick={() => setLocation(loc)} py={3}>
                {loc}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </VStack>

      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <HStack>
            <InfoOutlineIcon w={3} h={3} color="orange.300" />
            <Text fontSize="xs" fontWeight="bold" color="gray.500">추가 근무 내역</Text>
          </HStack>
          <Switch size="sm" colorScheme="orange" isChecked={extraEnabled} onChange={(e) => setExtraEnabled(e.target.checked)} />
        </HStack>

        {extraEnabled && extraWorks.map((row, idx) => (
          <Box key={idx} p={3} borderRadius="20px" bg="orange.900" bgOpacity="0.1" border="1px solid" borderColor="orange.900">
            <HStack justify="space-between" mb={3}>
              <Menu>
                <MenuButton as={Button} size="xs" variant="solid" colorScheme="orange" borderRadius="full" rightIcon={<ChevronDownIcon />}>
                  {row.type || "종류 선택"}
                </MenuButton>
                <MenuList bg="#2c2c2e" borderColor="whiteAlpha.200">
                  {["평일 잔업", "휴일 특근", "휴일 잔업", "철야", "철야 잔업", "조기 출근", "중식 연장"].map(t => (
                    <MenuItem key={t} bg="transparent" onClick={() => updateExtraWork(idx, { type: t })}>{t}</MenuItem>
                  ))}
                </MenuList>
              </Menu>
              <IconButton icon={<DeleteIcon />} size="xs" variant="ghost" colorScheme="red" onClick={() => handleRemoveExtraRow(idx)} />
            </HStack>

            <HStack justify="space-between" align="center">
              <HStack flex={1} justify="center" spacing={2}>
                {isMobile ? <TimeWheelPicker value={row.start} onChange={(val) => updateExtraWork(idx, { start: val })} /> :
                  <Input size="xs" value={row.start} onChange={(e) => updateExtraWork(idx, { start: e.target.value })} />}
                <Text fontSize="xs" color="orange.300">~</Text>
                {isMobile ? <TimeWheelPicker value={row.finish} onChange={(val) => updateExtraWork(idx, { finish: val })} /> :
                  <Input size="xs" value={row.finish} onChange={(e) => updateExtraWork(idx, { finish: e.target.value })} />}
              </HStack>
              <Badge variant="subtle" colorScheme="orange" borderRadius="md" ml={2}>
                {row.duration || "0:00"}
              </Badge>
            </HStack>
          </Box>
        ))}
      </VStack>

      <VStack spacing={3} pt={2}>
        <Button 
          w="100%" h="56px" colorScheme="blue" borderRadius="18px" fontSize="lg" fontWeight="800"
          onClick={handleAddToCart}
          boxShadow="0 8px 20px -8px rgba(49, 130, 206, 0.5)"
        >
          임시 저장소에 추가
        </Button>

        {cart.length > 0 && (
          <Button w="100%" h="56px" colorScheme="green" variant="outline" borderWidth="2px" borderRadius="18px" onClick={handleSubmitAll}>
            기록 모두 등록 ({cart.length}건)
          </Button>
        )}
      </VStack>

      <AlertDialog isOpen={isSubmitConfirmOpen} leastDestructiveRef={cancelRef} onClose={() => setIsSubmitConfirmOpen(false)} isCentered>
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent bg="#1c1c1e" color="white" borderRadius="24px" m={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">최종 등록 확인</AlertDialogHeader>
            <AlertDialogBody>
              <VStack spacing={3} align="stretch" maxH="300px" overflowY="auto" py={2}>
                {cart.map((c) => (
                  <Box key={c.id} bg="whiteAlpha.100" p={3} borderRadius="16px">
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Text fontWeight="bold">{c.work_date.month}/{c.work_date.day}</Text>
                        <Badge colorScheme="blue">{c.baseShift}</Badge>
                      </HStack>
                      <IconButton
                        icon={<DeleteIcon />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteFromCart(c.id)}
                        aria-label="Remove item"
                      />
                    </HStack>
                    <Text fontSize="sm" color="gray.400">{c.startTime} ~ {c.finishTime} | {c.location}</Text>
                  </Box>
                ))}
              </VStack>
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} variant="ghost" onClick={() => setIsSubmitConfirmOpen(false)}>취소</Button>
              <Button colorScheme="green" borderRadius="xl" onClick={handleConfirmSubmitAll}>지금 등록하기</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Stack>
  );
};

export default Option;
