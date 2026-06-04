import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";

const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 3;

const generateRange = (length, formatter = (v) => v) =>
  Array.from({ length }, (_, i) => formatter(i));

const BASE_HOURS = generateRange(24, (h) => String(h).padStart(2, "0"));
const HOURS_DATA = [...BASE_HOURS, ...BASE_HOURS, ...BASE_HOURS];

// 휠 컴포넌트를 외부로 분리 (중요: 리렌더링 시 스크롤 초기화 방지)
const Wheel = React.memo(({
  data,
  refObj,
  type,
  currentValue,
  onScroll,
  onWheel,
  onTouchStart,
  onTouchEnd,
}) => (
  <Box
    ref={refObj}
    h={`${ITEM_HEIGHT * VISIBLE_COUNT}px`}
    w="50px"
    overflowY="hidden"
    onScroll={() => onScroll(type)}
    onWheel={(e) => onWheel(type, e)}
    onTouchStart={(e) => onTouchStart(type, e)}
    onTouchEnd={(e) => onTouchEnd(type, e)}
    sx={{
      scrollSnapType: "y mandatory",
      overscrollBehavior: "contain",
      "&::-webkit-scrollbar": { display: "none" },
      WebkitOverflowScrolling: "touch",
      touchAction: "none",
      userSelect: "none",
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
));

export default function TimeWheelPicker({
  value = "00:00",
  onChange,
  minuteStep = 10,
}) {
  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const isProgrammaticScroll = useRef(false);
  const lastEmittedValue = useRef(value);
  const scrollTimers = useRef({});
  const wheelLocked = useRef(false);
  const touchStartY = useRef({});

  const baseMinutes = useMemo(() => 
    generateRange(60 / minuteStep, (i) => String(i * minuteStep).padStart(2, "0")),
    [minuteStep]
  );
  const minutesData = useMemo(() => [...baseMinutes, ...baseMinutes, ...baseMinutes], [baseMinutes]);

  const [h, m] = useMemo(() => (value || "00:00").split(":"), [value]);

  const getSelectedValueFromScroll = useCallback((ref, data) => {
    if (!ref.current) return null;
    const baseLen = data.length / 3;
    const scrollTop = ref.current.scrollTop;
    const centerIndex = Math.round(scrollTop / ITEM_HEIGHT) + 1;
    return data[centerIndex % baseLen];
  }, []);

  useEffect(() => {
    const sync = (ref, data, val) => {
      if (!ref.current) return;
      const currentVal = getSelectedValueFromScroll(ref, data);
      if (currentVal === val) return;

      const baseLen = data.length / 3;
      const indexInBase = data.slice(baseLen, baseLen * 2).indexOf(val);
      if (indexInBase !== -1) {
        const targetScrollTop = (indexInBase + baseLen - 1) * ITEM_HEIGHT;
        isProgrammaticScroll.current = true;
        ref.current.scrollTop = targetScrollTop;
        setTimeout(() => { isProgrammaticScroll.current = false; }, 50);
      }
    };

    sync(hourRef, HOURS_DATA, h);
    sync(minuteRef, minutesData, m);
    lastEmittedValue.current = value;
  }, [value, h, m, minutesData, getSelectedValueFromScroll]);

  const emitValueFromScroll = useCallback((type) => {
    if (isProgrammaticScroll.current) return;

    const ref = type === "hour" ? hourRef : minuteRef;
    const data = type === "hour" ? HOURS_DATA : minutesData;
    const baseData = type === "hour" ? BASE_HOURS : baseMinutes;
    if (!ref.current) return;

    const scrollTop = ref.current.scrollTop;
    const baseLen = baseData.length;
    const baseHeight = baseLen * ITEM_HEIGHT;

    if (scrollTop < baseHeight * 0.2) {
      isProgrammaticScroll.current = true;
      ref.current.scrollTop += baseHeight;
      setTimeout(() => { isProgrammaticScroll.current = false; }, 50);
      return;
    } else if (scrollTop > baseHeight * 2.8) {
      isProgrammaticScroll.current = true;
      ref.current.scrollTop -= baseHeight;
      setTimeout(() => { isProgrammaticScroll.current = false; }, 50);
      return;
    }

    const newValue = getSelectedValueFromScroll(ref, data);
    if (!newValue) return;

    const [currH, currM] = lastEmittedValue.current.split(":");
    const nextH = type === "hour" ? newValue : currH;
    const nextM = type === "minute" ? newValue : currM;
    const nextValue = `${nextH}:${nextM}`;

    if (nextValue !== lastEmittedValue.current) {
      lastEmittedValue.current = nextValue;
      onChange(nextValue);
    }
  }, [baseMinutes, minutesData, onChange, getSelectedValueFromScroll]);

  const handleScroll = useCallback((type) => {
    window.clearTimeout(scrollTimers.current[type]);
    scrollTimers.current[type] = window.setTimeout(() => {
      emitValueFromScroll(type);
    }, 120);
  }, [emitValueFromScroll]);

  const stepValue = useCallback((type, direction) => {
    const baseData = type === "hour" ? BASE_HOURS : baseMinutes;
    const [currH, currM] = lastEmittedValue.current.split(":");
    const current = type === "hour" ? currH : currM;
    const currentIndex = baseData.indexOf(current);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + direction + baseData.length) % baseData.length;
    const nextValuePart = baseData[nextIndex];
    const nextValue = type === "hour" ? `${nextValuePart}:${currM}` : `${currH}:${nextValuePart}`;

    lastEmittedValue.current = nextValue;
    onChange(nextValue);
  }, [baseMinutes, onChange]);

  const handleWheel = useCallback((type, event) => {
    event.preventDefault();
    if (wheelLocked.current) return;

    const direction = event.deltaY > 0 ? 1 : -1;
    wheelLocked.current = true;
    stepValue(type, direction);

    window.setTimeout(() => {
      wheelLocked.current = false;
    }, 140);
  }, [stepValue]);

  const handleTouchStart = useCallback((type, event) => {
    touchStartY.current[type] = event.touches[0]?.clientY;
  }, []);

  const handleTouchEnd = useCallback((type, event) => {
    const startY = touchStartY.current[type];
    const endY = event.changedTouches[0]?.clientY;
    if (startY == null || endY == null) return;

    const diff = startY - endY;
    if (Math.abs(diff) < 12) return;

    stepValue(type, diff > 0 ? 1 : -1);
  }, [stepValue]);

  return (
    <Box
      bg="#2c2c2e"
      borderRadius="10px"
      p={1}
      border="1px solid"
      borderColor="whiteAlpha.300"
      w="fit-content"
    >
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
        <Wheel 
          data={HOURS_DATA} 
          refObj={hourRef} 
          type="hour" 
          currentValue={h} 
          onScroll={handleScroll} 
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
        <Text color="blue.400" fontWeight="bold" fontSize="xs">:</Text>
        <Wheel 
          data={minutesData} 
          refObj={minuteRef} 
          type="minute" 
          currentValue={m} 
          onScroll={handleScroll} 
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
      </HStack>
    </Box>
  );
}
