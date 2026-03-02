import React, { useRef, useEffect, useState } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";

const ITEM_HEIGHT = 32;
const VISIBLE_COUNT = 5;

const generateRange = (length, formatter = (v) => v) =>
  Array.from({ length }, (_, i) => formatter(i));

export default function TimeWheelPicker({
  value = "00:00",
  onChange,
  minuteStep = 10,
}) {
  const hourRef = useRef(null);
  const minuteRef = useRef(null);

  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const hours = generateRange(24, (h) => String(h).padStart(2, "0"));
  const minutes = generateRange(
    60 / minuteStep,
    (i) => String(i * minuteStep).padStart(2, "0")
  );

  const updateValue = (ref, type) => {
    const index = Math.round(ref.current.scrollTop / ITEM_HEIGHT);
    const [h, m] = value.split(":");

    if (type === "hour") {
      onChange(`${hours[index] || "00"}:${m}`);
    } else {
      onChange(`${h}:${minutes[index] || "00"}`);
    }
  };

  useEffect(() => {
    if (!value || isUserScrolling) return;

    const [h, m] = value.split(":");

    const hourIndex = hours.indexOf(h);
    const minuteIndex = minutes.indexOf(m);

    if (hourRef.current)
      hourRef.current.scrollTop = hourIndex * ITEM_HEIGHT;

    if (minuteRef.current)
      minuteRef.current.scrollTop = minuteIndex * ITEM_HEIGHT;
  }, [value]);

  const Wheel = ({ data, refObj, type }) => (
    <Box
      ref={refObj}
      h={`${ITEM_HEIGHT * VISIBLE_COUNT}px`}
      w="60px"
      overflowY="auto"
      onScroll={() => {
        setIsUserScrolling(true);
        updateValue(refObj, type);
      }}
      onTouchEnd={() => setIsUserScrolling(false)}
      onMouseUp={() => setIsUserScrolling(false)}
      sx={{
        scrollSnapType: "y mandatory",
        "&::-webkit-scrollbar": { display: "none" },
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
          <Text fontSize="md">{item}</Text>
        </Box>
      ))}
    </Box>
  );

  return (
    <HStack spacing={2} position="relative">
      <Box
        position="absolute"
        top={`${ITEM_HEIGHT * 2}px`}
        left="0"
        right="0"
        h={`${ITEM_HEIGHT}px`}
        borderTop="2px solid"
        borderBottom="2px solid"
        borderColor="blue.400"
        pointerEvents="none"
      />

      <Wheel data={hours} refObj={hourRef} type="hour" />
      <Text fontSize="lg">:</Text>
      <Wheel data={minutes} refObj={minuteRef} type="minute" />
    </HStack>
  );
}