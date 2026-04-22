import React, { useRef, useEffect } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";

const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 3;

const generateRange = (length, formatter = (v) => v) =>
  Array.from({ length }, (_, i) => formatter(i));

export default function TimeWheelPicker({
  value = "00:00",
  onChange,
  minuteStep = 10,
}) {
  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const isInteracting = useRef(false);
  const lastEmittedValue = useRef(value); // 중복 업데이트 방지

  const baseHours = generateRange(25, (h) => String(h).padStart(2, "0"));
  const baseMinutes = generateRange(
    60 / minuteStep,
    (i) => String(i * minuteStep).padStart(2, "0")
  );

  const hours = [...baseHours, ...baseHours, ...baseHours];
  const minutes = [...baseMinutes, ...baseMinutes, ...baseMinutes];

  const [h, m] = (value || "00:00").split(":");

  useEffect(() => {
    if (isInteracting.current) return;

    const sync = (ref, data, val) => {
      if (!ref.current) return;
      const baseLen = data.length / 3;
      const indexInBase = data.slice(baseLen, baseLen * 2).indexOf(val);
      if (indexInBase !== -1) {
        ref.current.scrollTop = (indexInBase + baseLen) * ITEM_HEIGHT;
      }
    };

    sync(hourRef, hours, h);
    sync(minuteRef, minutes, m);
    lastEmittedValue.current = value;
  }, [value, h, m]);

  const handleScroll = (type) => {
    const ref = type === "hour" ? hourRef : minuteRef;
    const baseData = type === "hour" ? baseHours : baseMinutes;
    if (!ref.current) return;

    let scrollTop = ref.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    
    // 무한 루프 경계 보정
    if (index < baseData.length * 0.5) {
      ref.current.scrollTop += baseData.length * ITEM_HEIGHT;
    } else if (index > baseData.length * 2.5) {
      ref.current.scrollTop -= baseData.length * ITEM_HEIGHT;
    }

    const finalIndex = Math.round(ref.current.scrollTop / ITEM_HEIGHT) % baseData.length;
    const newValue = baseData[finalIndex];

    if (isInteracting.current) {
      const [currH, currM] = lastEmittedValue.current.split(":");
      let nextH = currH;
      let nextM = currM;

      if (type === "hour") nextH = newValue;
      else nextM = newValue;

      const nextValue = `${nextH}:${nextM}`;
      
      // 값이 실제로 변했을 때만 즉시 부모에게 알림
      if (nextValue !== lastEmittedValue.current) {
        lastEmittedValue.current = nextValue;
        onChange(nextValue);
      }
    }
  };

  const Wheel = ({ data, refObj, type, currentValue }) => (
    <Box
      ref={refObj}
      h={`${ITEM_HEIGHT * VISIBLE_COUNT}px`}
      w="50px"
      overflowY="auto"
      onScroll={() => handleScroll(type)}
      onTouchStart={() => { isInteracting.current = true; }}
      onTouchEnd={() => { 
        isInteracting.current = false; 
        handleScroll(type); 
      }}
      onMouseDown={() => { isInteracting.current = true; }}
      onMouseUp={() => { 
        isInteracting.current = false; 
        handleScroll(type); 
      }}
      sx={{
        scrollSnapType: "y mandatory",
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
      p={0.5}
      border="1px solid"
      borderColor="whiteAlpha.200"
      w="fit-content"
    >
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
        <Wheel data={hours} refObj={hourRef} type="hour" currentValue={h} />
        <Text color="blue.400" fontWeight="bold" fontSize="xs">:</Text>
        <Wheel data={minutes} refObj={minuteRef} type="minute" currentValue={m} />
      </HStack>
    </Box>
  );
}
