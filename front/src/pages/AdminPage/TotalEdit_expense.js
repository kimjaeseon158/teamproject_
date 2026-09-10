import { useToast } from "@chakra-ui/react";
import { useExpenseData } from "../../features/admin/total_pay/hook/useExpenseData";

import FinanceManagementPage from "../../features/admin/total_pay/section/FinanceManagementPage";

export default function ExpensePage() {
  const toast = useToast();

  const {
    range, setRange,
    expenseData,
    totalExpense,
    saveExpenseItems,
    updateExpenseItem,
  } = useExpenseData({ toast });

  return (
    <FinanceManagementPage
        type="expense" data={expenseData} total={totalExpense} range={range} setRange={setRange}
        onSave={saveExpenseItems}
        onUpdate={updateExpenseItem}
      />
  );
}
