import { Box, Flex, useDisclosure, useToast } from "@chakra-ui/react";
import { useUser } from "../../login/js/userContext";
import { useCompanyIncome } from "../hooks/useCompanyIncome";
import { useState } from "react";

import CompanyTableSection from "../sections/company/CompanyTableSection";
import CompanyChartSection from "../sections/CompanyChartSection";
import CompanyAddModal from "../sections/company/CompanyAddModal";
import CompanyEditModal from "../sections/company/CompanyEditModal";
import DateRangeModal from "../sections/DateRangeModal";

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
