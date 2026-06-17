import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import { useState, useMemo, useEffect } from "react";
import { useApproveList } from "../../features/admin/work_day/hook/useApproveList";
import ApproveFilterBar from "../../features/admin/work_day/section/ApproveFilterBar";
import ApproveTable from "../../features/admin/work_day/section/ApproveTable";
import ApproveDetailModal from "../../features/admin/work_day/section/ApproveDetailModal";
import ApprovePagination from "../../features/admin/work_day/section/ApprovePagination";
import { toYMD } from "../../features/admin/work_day/utils/approveUtils";
import { getMonthRange, toMonthValue } from "../../features/admin/work_day/utils/approveDateUtils";
import { exportApprovalSalaryExcel } from "../../features/admin/api/google/GoogleDrive";
import ExcelExportModal from "../../features/admin/total_pay/section/ExcelExportModal";
import excelIcon from "../../assets/img/excel.png";

const APPROVAL_PAGE_SIZE = 10;

export default function ApprovePage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const exportDisclosure = useDisclosure();

  const { rows, loading, fetchList } = useApproveList(toast);

  const [exportLoading, setExportLoading] = useState(false);

  const [status, setStatus] = useState("대기");
  const [workPlace, setWorkPlace] = useState("");
  const [workType, setWorkType] = useState("");
  const [userName, setUserName] = useState("");
  const [extraWork, setExtraWork] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 🔥 현재 달의 시작일~종료일로 초기화
  const initialRange = useMemo(() => {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { from, to };
  }, []);

  const [range, setRange] = useState(initialRange);
  const [selectedMonth, setSelectedMonth] = useState(toMonthValue(initialRange.from));

  const handleMonthChange = (monthValue) => {
    setSelectedMonth(monthValue);
    setRange(getMonthRange(monthValue));
  };

  const handleRangeChange = (nextRange) => {
    setSelectedMonth("");
    setRange(nextRange || { from: undefined, to: undefined });
  };

  const handleRangeReset = () => {
    setSelectedMonth("");
    setRange({ from: undefined, to: undefined });
  };

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

  const sortedRows = useMemo(() => {
    const nextRows = [...rows];
    const direction = sortOrder === "asc" ? 1 : -1;

    nextRows.sort((a, b) => {
      if (sortField === "totalWorkMinutes") {
        return ((Number(a.totalWorkMinutes) || 0) - (Number(b.totalWorkMinutes) || 0)) * direction;
      }

      return String(a[sortField] || "").localeCompare(String(b[sortField] || ""), "ko") * direction;
    });

    return nextRows;
  }, [rows, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / APPROVAL_PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * APPROVAL_PAGE_SIZE;
    return sortedRows.slice(start, start + APPROVAL_PAGE_SIZE);
  }, [currentPage, sortedRows]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  // 🔥 페이지 진입 시 자동 조회
  useEffect(() => {
    if (range.from && range.to) {
      fetchList({
        status: "대기",
        workPlace: "",
        workType: "",
        userName: "",
        extraWork: "",
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

    setCurrentPage(1);
    fetchList({
      status,
      workPlace,
      workType,
      userName,
      extraWork,
      startDate: toYMD(range.from),
      endDate: toYMD(range.to ?? range.from),
    });
  };

  const handleSort = (field) => {
    setCurrentPage(1);
    setSortField((prevField) => {
      if (prevField === field) {
        setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
        return prevField;
      }

      setSortOrder(field === "date" ? "desc" : "asc");
      return field;
    });
  };

  const handleResetFilters = () => {
    setStatus("대기");
    setWorkPlace("");
    setWorkType("");
    setUserName("");
    setExtraWork("");
    setSortField("date");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const handleExcelExport = async (_workPlace, date) => {
    try {
      setExportLoading(true);
      const result = await exportApprovalSalaryExcel(date);

      if (!result.success) {
        throw new Error(result.message || "엑셀 생성에 실패했습니다.");
      }

      toast({
        title: "엑셀 생성 완료",
        description: result.message || "승인관리 엑셀 파일이 Google Drive에 생성되었습니다.",
        status: "success",
        duration: 3000,
      });
      exportDisclosure.onClose();
    } catch (err) {
      toast({
        title: "엑셀 생성 실패",
        description: err.message || "잠시 후 다시 시도해주세요.",
        status: "error",
        duration: 3000,
      });
    } finally {
      setExportLoading(false);
    }
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
        <HStack spacing={2} justify={{ base: "flex-start", md: "flex-end" }}>
          <Tooltip label="승인관리 엑셀 생성" hasArrow>
            <Button
              leftIcon={<DownloadIcon />}
              rightIcon={<Image src={excelIcon} w="22px" h="22px" alt="excel" />}
              colorScheme="green"
              variant="outline"
              size="sm"
              minW="92px"
              onClick={exportDisclosure.onOpen}
            >
              Excel
            </Button>
          </Tooltip>
        </HStack>
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
          userName={userName}
          setUserName={setUserName}
          extraWork={extraWork}
          setExtraWork={setExtraWork}
          range={range}
          setRange={handleRangeChange}
          rangeLabel={rangeLabel}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
          onRangeReset={handleRangeReset}
          onReset={handleResetFilters}
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
          rows={paginatedRows}
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
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          pb="40px"
        />
        <ApprovePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={sortedRows.length}
          pageSize={APPROVAL_PAGE_SIZE}
          onChange={setCurrentPage}
        />
      </Box>

      <ApproveDetailModal
        employee={selectedEmployee}
        isOpen={isOpen}
        onClose={onClose}
        toast={toast}
        refresh={handleSearch}
      />
      <ExcelExportModal
        isOpen={exportDisclosure.isOpen}
        onClose={exportDisclosure.onClose}
        onConfirm={handleExcelExport}
        loading={exportLoading}
        showWorkPlace={false}
      />
    </Box>
  );
}
