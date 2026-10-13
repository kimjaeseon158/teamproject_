import {
  Button,
  Flex,
  Input,
  Select,
} from "@chakra-ui/react";

import { EXTRA_WORK_TYPES } from "../../../common/workTypes";
import { APPROVAL_STATUS } from "../constants/approvalConstants";
import ApprovalRangePicker from "./ApprovalRangePicker";

export default function ApproveDesktopFilterBar({
  status,
  setStatus,
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
  rangeLabel,
  selectedMonth,
  onMonthChange,
  onReset,
  onSearch,
  loading,
}) {
  const isFilterDisabled = loading || workPlacesLoading;


  return (
    <Flex gap={3} align="center" wrap="wrap">
      <Select
        size="sm"
        w={{ base: "100%", md: "150px" }}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        isDisabled={loading}
      >
        <option value={APPROVAL_STATUS.ALL}>전체</option>
        <option value={APPROVAL_STATUS.APPROVED}>승인</option>
        <option value={APPROVAL_STATUS.PENDING}>대기</option>
        <option value={APPROVAL_STATUS.REJECTED}>반려</option>
      </Select>

      <Select
        size="sm"
        w={{ base: "100%", md: "220px" }}
        value={workPlace}
        onChange={(e) => setWorkPlace(e.target.value)}
        isDisabled={isFilterDisabled}
      >
        <option value="">
          {workPlacesLoading ? "근무지 불러오는 중..." : "근무지 전체"}
        </option>
        {workPlaces.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </Select>

      <Select
        size="sm"
        w={{ base: "100%", md: "180px" }}
        value={workType}
        onChange={(e) => setWorkType(e.target.value)}
        isDisabled={loading}
      >
        <option value="">근무구분 전체</option>
        <option value="주간">주간</option>
        <option value="야간">야간</option>
        <option value="주간 특근">주간 특근</option>
        <option value="야간 특근">야간 특근</option>
      </Select>

      <Select
        size="sm"
        w={{ base: "100%", md: "170px" }}
        value={extraWork}
        onChange={(e) => setExtraWork(e.target.value)}
        isDisabled={loading}
      >
        <option value="">추가근무 전체</option>
        {EXTRA_WORK_TYPES.map((type) => (
          <option key={type.value} value={type.submitLabel}>
            {type.label}
          </option>
        ))}
      </Select>

      <Input
        size="sm"
        w={{ base: "100%", md: "170px" }}
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="직원명 검색"
        isDisabled={loading}
      />

      <Button size="sm" colorScheme="blue" onClick={onSearch} isLoading={loading}>
        조회
      </Button>

      <Button
        size="sm"
        variant="outline"
        color="gray.700"
        borderColor="gray.500"
        borderWidth="1px"
        fontWeight="600"
        _hover={{ bg: "gray.50", borderColor: "gray.600" }}
        onClick={onReset}
        isDisabled={loading}
      >
        초기화
      </Button>

      <ApprovalRangePicker
        ml={{ base: 0, md: "auto" }}
        range={range}
        setRange={setRange}
        rangeLabel={rangeLabel}
        selectedMonth={selectedMonth}
        onMonthChange={onMonthChange}
        loading={loading}
      />
    </Flex>
  );
}
