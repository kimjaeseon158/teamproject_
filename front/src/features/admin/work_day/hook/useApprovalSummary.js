import { useMemo } from "react";

import { APPROVAL_STATUS } from "../constants/approvalConstants";
import { isRejectedStatus } from "../utils/approveUtils";

export default function useApprovalSummary(rows) {
  return useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += 1;
        if (row.status === APPROVAL_STATUS.PENDING) acc.pending += 1;
        if (row.status === APPROVAL_STATUS.APPROVED) acc.approved += 1;
        if (isRejectedStatus(row.status)) acc.rejected += 1;
        if (row.workShift === "주간") acc.day += 1;
        if (row.workShift === "야간") acc.night += 1;
        if (String(row.workType || "").includes("특근")) acc.special += 1;
        return acc;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0, day: 0, night: 0, special: 0 }
    );
  }, [rows]);
}
