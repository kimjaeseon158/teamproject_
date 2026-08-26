import { Box, Flex, useDisclosure, useToast } from "@chakra-ui/react";
import { useUser } from "../../features/auth/userContext";
import { useCompanyIncome } from "../../features/admin/total_pay/hook/useCompanyIncome";
import { useState } from "react";

import CompanyTableSection from "../../features/admin/total_pay/section/company/CompanyTableSection";
import CompanyChartSection from "../../features/admin/total_pay/section/CompanyChartSection";
import CompanyAddModal from "../../features/admin/total_pay/section/company/CompanyAddModal";
import CompanyEditModal from "../../features/admin/total_pay/section/company/CompanyEditModal";
import DateRangeModal from "../../features/admin/total_pay/section/DateRangeModal";

export default function TotalEditCompanyPage() {
  const toast = useToast();
  const { userUuid, loading } = useUser();

  const {
    range, setRange,
    incomeData,
    totalIncome,
    saveIncomeItems,
    updateIncomeItem,
  } = useCompanyIncome({ user: userUuid, loading, toast });

  const [selectedIncomeRows, setSelectedIncomeRows] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const rangeModal = useDisclosure();
  const addModal = useDisclosure();
  const editModal = useDisclosure();

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Flex gap={6} flexWrap="wrap">
        <CompanyTableSection
          incomeData={incomeData}
          selectedRows={selectedIncomeRows}
          onSelectRow={(idx, checked) =>
            checked
              ? setSelectedIncomeRows([...selectedIncomeRows, incomeData[idx]])
              : setSelectedIncomeRows(selectedIncomeRows.filter((row) => row !== incomeData[idx]))
          }
          onRowClick={(idx) => {
            setEditIndex(idx);
            editModal.onOpen();
          }}
          onOpenRange={rangeModal.onOpen}
          onOpenAdd={addModal.onOpen}
        />

        <CompanyChartSection
          incomeData={incomeData}
          totalIncome={totalIncome}
        />
      </Flex>

      <DateRangeModal
        isOpen={rangeModal.isOpen}
        onClose={rangeModal.onClose}
        range={range}
        setRange={setRange}
        onApply={rangeModal.onClose}
      />

      <CompanyAddModal
        isOpen={addModal.isOpen}
        onClose={addModal.onClose}
        onSave={saveIncomeItems}
      />

      <CompanyEditModal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        data={incomeData[editIndex]}
        onSave={updateIncomeItem}
      />
    </Box>
  );
}
