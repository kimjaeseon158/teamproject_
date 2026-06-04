import {
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState, useMemo, useEffect } from "react";
import { useApproveList } from "../../features/admin/work_day/hook/useApproveList";
import ApproveFilterBar from "../../features/admin/work_day/section/ApproveFilterBar";
import ApproveTable from "../../features/admin/work_day/section/ApproveTable";
import ApproveDetailModal from "../../features/admin/work_day/section/ApproveDetailModal";
import { toYMD } from "../../features/admin/work_day/utils/approveUtils";

export default function ApprovePage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { rows, loading, fetchList } = useApproveList(toast);

  const [status, setStatus] = useState("대기");
  const [workPlace, setWorkPlace] = useState("");
  const [workType, setWorkType] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // 🔥 현재 달의 시작일~종료일로 초기화
  const initialRange = useMemo(() => {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { from, to };
  }, []);

  const [range, setRange] = useState(initialRange);

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.status === "대기") acc.pending += 1;
        if (row.status === "승인") acc.approved += 1;
        if (row.status === "거절" || row.status === "반려") acc.rejected += 1;
        if (row.workType === "주간") acc.day += 1;
        if (row.workType === "야간") acc.night += 1;
        if (row.workType === "특근") acc.special += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0, day: 0, night: 0, special: 0 }
    );
  }, [rows]);

  // 🔥 페이지 진입 시 자동 조회
  useEffect(() => {
    if (range.from && range.to) {
      fetchList({
        status: "대기",
        workPlace: "",
        workType: "",
        startDate: toYMD(range.from),
        endDate: toYMD(range.to),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔥 rangeLabel 정상 처리
  const rangeLabel = useMemo(() => {
    if (!range?.from) return "날짜 선택";
    if (!range?.to) return toYMD(range.from);
    return `${toYMD(range.from)} ~ ${toYMD(range.to)}`;
  }, [range]);

  const handleSearch = () => {
    if (!range?.from) {
      toast({
        title: "날짜를 선택해주세요",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    fetchList({
      status,
      workPlace,
      workType,
      startDate: toYMD(range.from),
      endDate: toYMD(range.to ?? range.from),
    });
  };

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 6 }}>
      <Flex justify="space-between" align={{ base: "stretch", md: "center" }} direction={{ base: "column", md: "row" }} gap={4} mb={5}>
        <Box>
          <HStack spacing={3} mb={2}>
            <Heading size="lg" color="gray.900">
              승인 관리
            </Heading>
            <Badge colorScheme={loading ? "gray" : "orange"} borderRadius="full" px={3} py={1}>
              {loading ? "조회 중" : `총 ${summary.total.toLocaleString()}건`}
            </Badge>
          </HStack>
          <Text color="gray.500" fontSize="sm">
            근무 내역을 조건별로 조회하고 승인 또는 반려 처리합니다.
          </Text>
        </Box>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mb={4}>
        {[
          { label: "대기", value: summary.pending, color: "orange" },
          { label: "승인", value: summary.approved, color: "green" },
          { label: "반려", value: summary.rejected, color: "red" },
          { label: "선택", value: selectedIds.size, color: "blue" },
        ].map((item) => (
          <Box key={item.label} bg="white" border="1px solid" borderColor="gray.100" borderRadius="lg" p={4} boxShadow="sm">
            <Text fontSize="xs" color="gray.500" fontWeight="800" mb={1}>
              {item.label}
            </Text>
            <Text fontSize="2xl" fontWeight="900" color={`${item.color}.500`}>
              {item.value.toLocaleString()}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <Box bg="white" border="1px solid" borderColor="gray.100" borderRadius="lg" p={4} boxShadow="sm">
        <ApproveFilterBar
          status={status}
          setStatus={setStatus}
          workPlace={workPlace}
          setWorkPlace={setWorkPlace}
          workType={workType}
          setWorkType={setWorkType}
          range={range}
          setRange={setRange}
          rangeLabel={rangeLabel}
          loading={loading}
          onSearch={handleSearch}
        />
      </Box>

      <Box mt={4} bg="white" border="1px solid" borderColor="gray.100" borderRadius="lg" boxShadow="sm" overflow="hidden">
        <Flex justify="space-between" align="center" px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
          <Box>
            <Heading size="sm" color="gray.800">
              승인 내역
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              주간 {summary.day} · 야간 {summary.night} · 특근 {summary.special}
            </Text>
          </Box>
          <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
            {rows.length.toLocaleString()}건
          </Badge>
        </Flex>
        <ApproveTable
          rows={rows}
          selectedIds={selectedIds}
          toggleAll={(c) =>
            setSelectedIds(c ? new Set(rows.map((r) => r.id)) : new Set())
          }
          toggleOne={(id, c) => {
            const next = new Set(selectedIds);
            c ? next.add(id) : next.delete(id);
            setSelectedIds(next);
          }}
          onRowClick={(emp) => {
            setSelectedEmployee(emp);
            onOpen();
          }}
          pb="40px"
        />
      </Box>

      <ApproveDetailModal
        employee={selectedEmployee}
        isOpen={isOpen}
        onClose={onClose}
        toast={toast}
        refresh={handleSearch}
      />
    </Box>
  );
}
