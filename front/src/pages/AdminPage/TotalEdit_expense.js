import { Box, Flex, useDisclosure, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { useExpenseData } from "../../features/admin/total_pay/hook/useExpenseData";

import ExpenseTableSection from "../../features/admin/total_pay/section/expense/ExpenseTableSection";
import ExpenseChartSection from "../../features/admin/total_pay/section/ExpenseChartSection";
import ExpenseAddModal from "../../features/admin/total_pay/section/expense/ExpenseAddModal";
import ExpenseEditModal from "../../features/admin/total_pay/section/expense/ExpenseEditModal";
import ExpenseRangeModal from "../../features/admin/total_pay/section/expense/ExpenseRangeModal";

export default function ExpensePage() {
  const toast = useToast();

  const {
    range, setRange,
    expenseData, setExpenseData,
    totalExpense,
    saveFinalList,
  } = useExpenseData({ toast });

  const [finalList, setFinalList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const rangeModal = useDisclosure();
  const addModal = useDisclosure();
  const editModal = useDisclosure();

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Flex gap={6} flexWrap="wrap">
        <ExpenseTableSection
          expenseData={expenseData}
          finalList={finalList}
          onSelectRow={(idx, checked) =>
            checked
              ? setFinalList([...finalList, expenseData[idx]])
              : setFinalList(finalList.filter((f) => f !== expenseData[idx]))
          }
          onRowClick={(idx) => {
            setEditIndex(idx);
            editModal.onOpen();
          }}
          onOpenRange={rangeModal.onOpen}
          onOpenAdd={addModal.onOpen}
        />

        <ExpenseChartSection
          expenseData={expenseData}
          totalExpense={totalExpense}
        />
      </Flex>

      <ExpenseRangeModal
        isOpen={rangeModal.isOpen}
        onClose={rangeModal.onClose}
        range={range}
        setRange={setRange}
      />

      <ExpenseAddModal
        isOpen={addModal.isOpen}
        onClose={addModal.onClose}
        onSave={saveFinalList}
      />

      <ExpenseEditModal
        isOpen={editModal.isOpen}
        onClose={editModal.onClose}
        data={expenseData[editIndex]}
        onSave={(updated) => {
          const next = [...expenseData];
          next[editIndex] = updated;
          setExpenseData(next);
        }}
      />
    </Box>
  );
}
