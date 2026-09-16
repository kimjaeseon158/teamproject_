import { Box, Button, Flex, HStack, Input, Select, Text, Collapse } from "@chakra-ui/react";
import { useState } from "react";
import MonthPicker from "../../../common/MonthPicker";
import { EXTRA_WORK_TYPES } from "../../../common/workTypes";
import { APPROVAL_STATUS } from "../constants/approvalConstants";

export default function ApproveMobileFilterBar({
  status,
  onStatusChange,
  workPlace,
  setWorkPlace,
  workPlaces = [],
  workPlacesLoading = false,
  workType,
  setWorkType,
  userName,
  setUserName,
  extraWork,
  setExtraWork,
  range,
  setRange,
  selectedMonth,
  onMonthChange,
  onReset,
  onSearch,
  loading,
}) {
  const [expanded, setExpanded] = useState(false);
  const isFilterDisabled = loading || workPlacesLoading;
  return (
    <Box>
      <HStack mb={3}>
        <Box flex={1} minW={0}><MonthPicker value={selectedMonth} onChange={onMonthChange} width="100%" size="md" placement="bottom-start" /></Box>
        <Button variant="outline" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>필터 {expanded ? "접기" : "+"}</Button>
      </HStack>
      <HStack mb={3}>
        <Input aria-label="직원명 검색" placeholder="직원 이름 검색" value={userName} onChange={(e) => setUserName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }} isDisabled={loading} />
        <Button colorScheme="teal" onClick={onSearch} isLoading={loading}>조회</Button>
      </HStack>
      <Collapse in={expanded} animateOpacity>
        <Box pb={4}>
          <Select mb={2} aria-label="근무지" value={workPlace} onChange={(e) => setWorkPlace(e.target.value)} isDisabled={isFilterDisabled}><option value="">근무지 전체</option>{workPlaces.map((loc) => <option key={loc} value={loc}>{loc}</option>)}</Select>
          <HStack mb={2}>
            <Select aria-label="근무구분" value={workType} onChange={(e) => setWorkType(e.target.value)}><option value="">근무구분 전체</option>{["주간", "야간", "주간 특근", "야간 특근"].map((value) => <option key={value}>{value}</option>)}</Select>
            <Select aria-label="추가근무" value={extraWork} onChange={(e) => setExtraWork(e.target.value)}><option value="">추가근무 전체</option>{EXTRA_WORK_TYPES.map((type) => <option key={type.value} value={type.submitLabel}>{type.label}</option>)}</Select>
          </HStack>
          <Text fontSize="xs" color="gray.500" mb={1}>조회 기간</Text>
          <HStack>
            <Input minW={0} aria-label="시작일" type="date" value={range?.from ? `${range.from.getFullYear()}-${String(range.from.getMonth() + 1).padStart(2, "0")}-${String(range.from.getDate()).padStart(2, "0")}` : ""} onChange={(e) => setRange({ ...range, from: e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined })} />
            <Input minW={0} aria-label="종료일" type="date" value={range?.to ? `${range.to.getFullYear()}-${String(range.to.getMonth() + 1).padStart(2, "0")}-${String(range.to.getDate()).padStart(2, "0")}` : ""} onChange={(e) => setRange({ ...range, to: e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined })} />
          </HStack>
          <Button mt={2} size="sm" variant="ghost" onClick={onReset}>조건 초기화</Button>
        </Box>
      </Collapse>
      <Flex borderBottomWidth="1px" borderColor="gray.200" role="group" aria-label="승인 상태">
        {[APPROVAL_STATUS.PENDING, APPROVAL_STATUS.APPROVED, APPROVAL_STATUS.REJECTED, APPROVAL_STATUS.ALL].map((value) => <Button key={value} flex={1} borderRadius={0} h="46px" variant="ghost" color={status === value ? "teal.600" : "gray.500"} borderBottomWidth="2px" borderColor={status === value ? "teal.500" : "transparent"} aria-pressed={status === value} isDisabled={loading} onClick={() => onStatusChange(value)}>{value}</Button>)}
      </Flex>
    </Box>
  );
}
