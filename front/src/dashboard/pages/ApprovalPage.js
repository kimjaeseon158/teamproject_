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

  const today = new Date();
  const [range, setRange] = useState({ from: today, to: today });

  const rangeLabel = useMemo(
    () => `${toYMD(range.from)} ~ ${toYMD(range.to ?? range.from)}`,
    [range]
  );

  const handleSearch = () => {
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
