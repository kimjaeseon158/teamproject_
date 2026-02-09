import {
  Flex,
  Select,
  Button,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function ApproveFilterBar({
  status,
  setStatus,
  range,
  setRange,
  rangeLabel,
  onSearch,
  loading,
}) {
  return (
    <Flex mt={4} gap={3} align="center">
      <Select
        size="sm"
        w="160px"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        isDisabled={loading}
      >
        <option value="전체">전체</option>
        <option value="승인">승인</option>
        <option value="대기">대기</option>
        <option value="거절">거절</option>
      </Select>

      <Button size="sm" colorScheme="blue" onClick={onSearch} isLoading={loading}>
        조회
      </Button>

      <Box ml="auto">
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <Button size="sm" variant="outline">
              {rangeLabel}
            </Button>
          </PopoverTrigger>

          <PopoverContent w="auto">
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>
              <DayPicker
                mode="range"
                selected={range}
                onSelect={(r) => {
                  if (!r?.from) return;
                  setRange({ from: r.from, to: r.to ?? r.from });
                }}
              />
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
    </Flex>
  );
}
