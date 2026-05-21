import {
  Flex,
  Select,
  Button,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverCloseButton,
  Text,
  HStack,
} from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import locationsList from "../../../common/work_placeCloums/locationsList";

export default function ApproveFilterBar({
  status,
  setStatus,
  workPlace,
  setWorkPlace,
  workType,
  setWorkType,
  range,
  setRange,
  rangeLabel,
  onSearch,
  loading,
}) {
  return (
    <Flex gap={3} align="center" wrap="wrap">
      <Select
        size="sm"
        w={{ base: "100%", md: "150px" }}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        isDisabled={loading}
      >
        <option value="전체">전체</option>
        <option value="승인">승인</option>
        <option value="대기">대기</option>
        <option value="거절">거절</option>
      </Select>

      <Select
        size="sm"
        w={{ base: "100%", md: "220px" }}
        value={workPlace}
        onChange={(e) => setWorkPlace(e.target.value)}
        isDisabled={loading}
      >
        <option value="">근무지 전체</option>
        <option value="__NULL__">근무지 미지정</option>
        {locationsList.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </Select>

      <Select
        size="sm"
        w={{ base: "100%", md: "160px" }}
        value={workType}
        onChange={(e) => setWorkType(e.target.value)}
        isDisabled={loading}
      >
        <option value="">근무구분 전체</option>
        <option value="주간">주간</option>
        <option value="야간">야간</option>
        <option value="특근">특근</option>
        <option value="__NULL__">근무구분 미지정</option>
      </Select>

      <Button
        size="sm"
        colorScheme="blue"
        onClick={onSearch}
        isLoading={loading}
      >
        조회
      </Button>

      <Box ml={{ base: 0, md: "auto" }} w={{ base: "100%", md: "auto" }}>
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <Button size="sm" variant="outline" w={{ base: "100%", md: "auto" }}>
              {rangeLabel}
            </Button>
          </PopoverTrigger>

          <PopoverContent w="auto" p={4}>
            {/* 🔥 Arrow 제거해서 겹침 해결 */}
            <PopoverCloseButton top="8px" right="8px" />

            <PopoverBody>
              {/* 🔥 선택 기간 표시 */}
              <Text fontSize="sm" mb={3} fontWeight="medium">
                선택 기간: {rangeLabel}
              </Text>

              <DayPicker
                mode="range"
                selected={range}
                onSelect={setRange}
              />

              {/* 🔥 Today 버튼 */}
              <HStack mt={4} justify="space-between">
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    const today = new Date();
                    setRange({ from: today, to: today });
                  }}
                >
                  Today
                </Button>

                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() =>
                    setRange({ from: undefined, to: undefined })
                  }
                >
                  초기화
                </Button>
              </HStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Box>
    </Flex>
  );
}
