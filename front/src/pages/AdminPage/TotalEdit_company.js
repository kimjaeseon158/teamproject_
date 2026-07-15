import { Box, Flex, useDisclosure, useToast } from "@chakra-ui/react";
import { useUser } from "../../feactures/auth/userContext";
import { useCompanyIncome } from "../../feactures/admin/total_pay/hook/useCompanyIncome";
import { useState } from "react";

import CompanyTableSection from "../../feactures/admin/total_pay/section/company/CompanyTableSection";
import CompanyChartSection from "../../feactures/admin/total_pay/section/CompanyChartSection";
import CompanyAddModal from "../../feactures/admin/total_pay/section/company/CompanyAddModal";
import CompanyEditModal from "../../feactures/admin/total_pay/section/company/CompanyEditModal";
import DateRangeModal from "../../feactures/admin/total_pay/section/DateRangeModal";

export default function TotalEditCompanyPage() {
  const toast = useToast();
  const { user, loading } = useUser();

  const {
    range, setRange,
    incomeData, setIncomeData,
    totalIncome,
    saveFinalList,
  } = useCompanyIncome({ user, loading, toast });

  const [finalList, setFinalList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const rangeModal = useDisclosure();
  const addModal = useDisclosure();
  const editModal = useDisclosure();

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Flex gap={6} flexWrap="wrap">
        <CompanyTableSection
          incomeData={incomeData}
          finalList={finalList}
          onSelectRow={(idx, checked) =>
            checked
              ? setFinalList([...finalList, incomeData[idx]])
              : setFinalList(finalList.filter((f) => f !== incomeData[idx]))
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
      />

      <CompanyAddModal
        isOpen={addModal.isOpen}
        onClose={addModal.onClose}
        onSave={saveFinalList}
      />

      <CompanyEditModal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        data={incomeData[editIndex]}
        onSave={(updated) => {
          const next = [...incomeData];
          next[editIndex] = updated;
          setIncomeData(next);
        }}
      />
    </Box>
  );
}
