import { useToast } from "@chakra-ui/react";
import { useUser } from "../../features/auth/userContext";
import { useCompanyIncome } from "../../features/admin/total_pay/hook/useCompanyIncome";

import FinanceManagementPage from "../../features/admin/total_pay/section/FinanceManagementPage";

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

  return (
    <FinanceManagementPage
        type="income" data={incomeData} total={totalIncome} range={range} setRange={setRange}
        onSave={saveIncomeItems}
        onUpdate={updateIncomeItem}
      />
  );
}
