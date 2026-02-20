import { Box, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { useApproveList } from "../hooks/useApproveList";
import ApproveFilterBar from "../sections/ApproveFilterBar";
import ApproveTable from "../sections/approve/ApproveTable";
import ApproveDetailModal from "../sections/approve/ApproveDetailModal";
import { toYMD } from "../utils/approveUtils";

export default function ApprovePage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { rows, loading, fetchList } = useApproveList(toast);

  const [status, setStatus] = useState("대기");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // 🔥 range 초기값을 undefined로
  const [range, setRange] = useState({
    from: undefined,
    to: undefined,
  });

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
      startDate: toYMD(range.from),
      endDate: toYMD(range.to ?? range.from),
    });
  };

  return (
    <Box p={6}>
      <Text fontSize="20px" fontWeight="bold" mb={4}>
        사원 승인 페이지
      </Text>

      <ApproveFilterBar
        status={status}
        setStatus={setStatus}
        range={range}
        setRange={setRange}
        rangeLabel={rangeLabel}
        loading={loading}
        onSearch={handleSearch}
      />

      <Box mt={6}>
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
