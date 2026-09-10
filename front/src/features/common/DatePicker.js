import {
  Box, Button, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import { ko } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { toLocalDateValue } from "./utils/dateValue";

export default function DatePicker({ value, onChange, width = "100%", size = "md" }) {
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <Popover placement="bottom-start" gutter={6}>
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button
              size={size}
              variant="outline"
              w={width}
              justifyContent="space-between"
              fontWeight="500"
              rightIcon={<CalendarIcon color="gray.500" />}
            >
              {value || "날짜 선택"}
            </Button>
          </PopoverTrigger>
          <PopoverContent w="292px" p={1} zIndex={2000}>
            <PopoverBody px={2} py={2}>
              <Box
                sx={{
                  ".rdp-selected .rdp-day_button": {
                    bg: "#0aa683",
                    color: "white",
                    borderColor: "#0aa683",
                    fontWeight: "700",
                  },
                  ".rdp-today:not(.rdp-selected) .rdp-day_button": {
                    border: "1px solid #0aa683",
                    color: "#087d64",
                    fontWeight: "700",
                  },
                  ".rdp-day_button:hover": { bg: "#e1f7f1" },
                  ".rdp-selected .rdp-day_button:hover": { bg: "#07866b" },
                }}
              >
                <DayPicker
                  mode="single"
                  locale={ko}
                  weekStartsOn={1}
                  selected={selected}
                  defaultMonth={selected || new Date()}
                  formatters={{
                    formatCaption: (month) => `${month.getFullYear()}년 ${month.getMonth() + 1}월`,
                  }}
                  style={{
                    "--rdp-day-width": "34px",
                    "--rdp-day-height": "34px",
                    "--rdp-day_button-width": "32px",
                    "--rdp-day_button-height": "32px",
                    "--rdp-nav_button-width": "30px",
                    "--rdp-nav_button-height": "30px",
                  }}
                  onSelect={(date) => {
                    if (!date) return;
                    onChange(toLocalDateValue(date));
                    onClose();
                  }}
                />
              </Box>
              <HStack justify="flex-end" mt={2}>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    onChange(toLocalDateValue(new Date()));
                    onClose();
                  }}
                >
                  오늘
                </Button>
              </HStack>
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  );
}
