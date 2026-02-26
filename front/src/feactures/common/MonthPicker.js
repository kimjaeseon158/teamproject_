// MonthPicker.js

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  SimpleGrid,
  IconButton,
  Button,
  HStack,
  Text,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useState, useEffect, useMemo } from "react";

/**
 * 🔥 컴포넌트 밖에 둔다 (중요)
 * 렌더마다 새로 생성되지 않음
 */
function parseYearMonth(val) {
  const today = new Date();

  if (!val || !val.includes("-")) {
    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    };
  }

  const [y, m] = val.split("-").map(Number);

  return {
    year: isNaN(y) ? today.getFullYear() : y,
    month: isNaN(m) ? today.getMonth() + 1 : m,
  };
}

export default function MonthPicker({
  value,      // 반드시 "YYYY-MM"
  onChange,
}) {
  /**
   * ✅ value 바뀔 때만 재계산
   */
  const parsed = useMemo(() => {
    return parseYearMonth(value);
  }, [value]);

  /**
   * ✅ 초기값 안전 설정 (함수형)
   */
  const [year, setYear] = useState(() => parsed.year);

  /**
   * ✅ value 변경 시 year 동기화
   */
  useEffect(() => {
    setYear(parsed.year);
  }, [parsed.year]);

  const displayLabel = `${parsed.year}년 ${parsed.month}월`;

  return (
    <Popover placement="bottom-start">
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button size="sm" variant="outline">
              {displayLabel}
            </Button>
          </PopoverTrigger>

          <PopoverContent w="280px">
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader fontWeight="700">
              월 선택
            </PopoverHeader>

            <PopoverBody>
              <HStack justify="space-between" mb={3}>
                <IconButton
                  size="sm"
                  icon={<ChevronLeftIcon />}
                  onClick={() => setYear((prev) => prev - 1)}
                  aria-label="이전 연도"
                />

                <Text fontWeight="800">{year}년</Text>

                <IconButton
                  size="sm"
                  icon={<ChevronRightIcon />}
                  onClick={() => setYear((prev) => prev + 1)}
                  aria-label="다음 연도"
                />
              </HStack>

              <SimpleGrid columns={4} spacing={2}>
                {Array.from({ length: 12 }).map((_, i) => {
                  const month = i + 1;
                  const formatted = `${year}-${String(month).padStart(2, "0")}`;

                  return (
                    <Button
                      key={month}
                      size="sm"
                      variant={
                        formatted === value ? "solid" : "outline"
                      }
                      colorScheme={
                        formatted === value ? "blue" : "gray"
                      }
                      onClick={() => {
                        onChange(formatted); // 항상 YYYY-MM 반환
                        onClose();
                      }}
                    >
                      {month}월
                    </Button>
                  );
                })}
              </SimpleGrid>
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  );
}