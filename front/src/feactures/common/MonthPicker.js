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
import { useState, useEffect } from "react";

export default function MonthPicker({
  value,        // 반드시 "YYYY-MM"
  onChange,
}) {
  const today = new Date();

  const parseYearMonth = (val) => {
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
  };

  const parsed = parseYearMonth(value);

  const [year, setYear] = useState(parsed.year);

  useEffect(() => {
    const { year: newYear } = parseYearMonth(value);
    setYear(newYear);
  }, [value]);

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
                  onClick={() => setYear((y) => y - 1)}
                />
                <Text fontWeight="800">{year}년</Text>
                <IconButton
                  size="sm"
                  icon={<ChevronRightIcon />}
                  onClick={() => setYear((y) => y + 1)}
                />
              </HStack>

              <SimpleGrid columns={4} spacing={2}>
                {Array.from({ length: 12 }).map((_, i) => {
                  const month = i + 1;
                  const formatted = `${year}-${String(month).padStart(2, "0")}`;

                  return (
                    <Button
                      key={i}
                      size="sm"
                      onClick={() => {
                        onChange(formatted); // 🔥 항상 YYYY-MM 반환
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