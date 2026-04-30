import React, { useRef, useEffect, useMemo } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";

const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 3;

const generateRange = (length, formatter = (v) => v) =>
  Array.from({ length }, (_, i) => formatter(i));

const BASE_HOURS = generateRange(24, (h) => String(h).padStart(2, "0"));
const HOURS_DATA = [...BASE_HOURS, ...BASE_HOURS, ...BASE_HOURS];

export default function TimeWheelPicker({
  value = "00:00",
  onChange,
  minuteStep = 10,
}) {
  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  
  const isInteracting = useRef(false);
  const isProgrammaticScroll = useRef(false);
  const interactTimer = useRef(null);
  const lastEmittedValue = useRef(value);

  const baseMinutes = useMemo(() => 
    generateRange(60 / minuteStep, (i) => String(i * minuteStep).padStart(2, "0")),
    [minuteStep]
  );
  const minutesData = useMemo(() => [...baseMinutes, ...baseMinutes, ...baseMinutes], [baseMinutes]);

  const [h, m] = (value || "00:00").split(":");

  useEffect(() => {
    // 사용자가 조작 중일 때는 외부 value 변화에 의한 동기화를 차단
    if (isInteracting.current) return;

    const sync = (ref, data, val) => {
      if (!ref.current) return;
      const baseLen = data.length / 3;
      const indexInBase = data.slice(baseLen, baseLen * 2).indexOf(val);
      if (indexInBase !== -1) {
        const targetScrollTop = (indexInBase + baseLen - 1) * ITEM_HEIGHT;
        if (Math.abs(ref.current.scrollTop - targetScrollTop) > 1) {
          isProgrammaticScroll.current = true;
          ref.current.scrollTop = targetScrollTop;
          // 스크롤 이벤트가 발생한 후 플래그를 해제하기 위해 약간의 지연
          setTimeout(() => { isProgrammaticScroll.current = false; }, 100);
        }
      }
    };

    sync(hourRef, HOURS_DATA, h);
    sync(minuteRef, minutesData, m);
    lastEmittedValue.current = value;
  }, [value, h, m, minutesData]);

  const handleScroll = (type) => {
    // 프로그램에 의한 강제 이동(sync)일 때는 무시
    if (isProgrammaticScroll.current) return;

    const ref = type === "hour" ? hourRef : minuteRef;
    const baseData = type === "hour" ? BASE_HOURS : baseMinutes;
    if (!ref.current) return;

    // 조작 중임을 표시하고, 스크롤이 멈춘 후 200ms까지 유지 (관성 스크롤 대응)
    isInteracting.current = true;
    clearTimeout(interactTimer.current);
    interactTimer.current = setTimeout(() => {
      isInteracting.current = false;
    }, 200);

    const scrollTop = ref.current.scrollTop;
    const baseLen = baseData.length;
    const baseHeight = baseLen * ITEM_HEIGHT;

    // 무한 루프 워프
    if (scrollTop < baseHeight * 0.5) {
      isProgrammaticScroll.current = true;
      ref.current.scrollTop += baseHeight;
      setTimeout(() => { isProgrammaticScroll.current = false; }, 50);
      return;
    } else if (scrollTop > baseHeight * 2.5) {
      isProgrammaticScroll.current = true;
      ref.current.scrollTop -= baseHeight;
      setTimeout(() => { isProgrammaticScroll.current = false; }, 50);
      return;
    }

    const centerIndex = Math.round(scrollTop / ITEM_HEIGHT) + 1;
    const index = centerIndex % baseLen;
    const newValue = baseData[index];

    const [currH, currM] = lastEmittedValue.current.split(":");
    const nextH = type === "hour" ? newValue : currH;
    const nextM = type === "minute" ? newValue : currM;
    const nextValue = `${nextH}:${nextM}`;

    if (nextValue !== lastEmittedValue.current) {
      lastEmittedValue.current = nextValue;
      onChange(nextValue);
    }
  };

  const Wheel = ({ data, refObj, type, currentValue }) => (
    <Box
      ref={refObj}
      h={`${ITEM_HEIGHT * VISIBLE_COUNT}px`}
      w="50px"
      overflowY="auto"
      onScroll={() => handleScroll(type)}
      sx={{
        scrollSnapType: "y mandatory",
        overscrollBehavior: "contain",
        "&::-webkit-scrollbar": { display: "none" },
        WebkitOverflowScrolling: "touch",
      }}
    >
      {data.map((item, i) => (
        <Box
          key={i}
          h={`${ITEM_HEIGHT}px`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          scrollSnapAlign="center"
        >
          <Text
            fontSize={item === currentValue ? "lg" : "xs"}
            fontWeight={item === currentValue ? "bold" : "normal"}
            color={item === currentValue ? "white" : "gray.600"}
          >
            {item}
          </Text>
        </Box>
      ))}
    </Box>
  );

  return (
    <Box
      bg="#2c2c2e"
      borderRadius="10px"
      p={1}
      border="1px solid"
      borderColor="whiteAlpha.300"
      w="fit-content"
    >
      {/* 🔥 실시간 캡처 값 확인용 디버그 텍스트 */}
      <Box textAlign="center" mb={1}>
        <Text fontSize="10px" fontWeight="bold" color="blue.300">
          SELECTED: {value}
        </Text>
      </Box>

      <HStack spacing={0} position="relative">
        <Box
          position="absolute"
          top="50%"
          left="0"
          right="0"
          transform="translateY(-50%)"
          h={`${ITEM_HEIGHT}px`}
          bg="whiteAlpha.100"
          borderRadius="4px"
          pointerEvents="none"
          borderY="1px solid"
          borderColor="blue.400"
        />
        <Wheel data={HOURS_DATA} refObj={hourRef} type="hour" currentValue={h} />
        <Text color="blue.400" fontWeight="bold" fontSize="xs">:</Text>
        <Wheel data={minutesData} refObj={minuteRef} type="minute" currentValue={m} />
      </HStack>
    </Box>
  );
}
