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
  onToday,
  showToday = false,
  size = "md",
  variant = "outline",
  width = "auto",
  height,
  borderRadius = "xl",
  placement = "bottom-start",
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
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    setYear(parsed.year);
  }, [value]);

  const displayLabel = `${parsed.year}년 ${parsed.month}월`;

  return (
    <Popover placement={placement}>
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button 
              size={size}
              variant={variant} 
              w={width} 
              h={height} 
              fontWeight="600"
              borderRadius={borderRadius}
            >
              {displayLabel}
            </Button>
          </PopoverTrigger>

          <PopoverContent w="280px" borderRadius="xl" boxShadow="2xl" zIndex={2000}>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader fontWeight="700" borderBottom="1px solid" borderColor="gray.100">
              월 선택
            </PopoverHeader>

            <PopoverBody py={4}>
              {showToday && (
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="green"
                  w="100%"
                  mb={3}
                  borderRadius="lg"
                  onClick={() => {
                    onChange(todayValue);
                    onToday?.();
                    onClose();
                  }}
                >
                  Today
                </Button>
              )}

              <HStack justify="space-between" mb={4}>
                <IconButton
                  size="sm"
                  variant="ghost"
                  icon={<ChevronLeftIcon />}
                  onClick={() => setYear((y) => y - 1)}
                  aria-label="Previous Year"
                />
                <Text fontWeight="800" fontSize="md">{year}년</Text>
                <IconButton
                  size="sm"
                  variant="ghost"
                  icon={<ChevronRightIcon />}
                  onClick={() => setYear((y) => y + 1)}
                  aria-label="Next Year"
                />
              </HStack>

              <SimpleGrid columns={4} spacing={2}>
                {Array.from({ length: 12 }).map((_, i) => {
                  const month = i + 1;
                  const formattedMonth = String(month).padStart(2, "0");
                  const formatted = `${year}-${formattedMonth}`;
                  const isSelected = value === formatted;

                  return (
                    <Button
                      key={i}
                      size="sm"
                      variant={isSelected ? "solid" : "ghost"}
                      colorScheme={isSelected ? "green" : "gray"}
                      onClick={() => {
                        onChange(formatted);
                        onClose();
                      }}
                      borderRadius="lg"
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
