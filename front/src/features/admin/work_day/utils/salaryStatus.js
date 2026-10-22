const BLOCKED_STATUSES = new Set([
  "rate_missing",
  "rate_overlap",
  "final_amount_missing",
]);

export const getSalaryStatusLabel = (status) => ({
  calculated: "예상 급여",
  confirmed: "확정 급여",
  rate_missing: "적용 단가 미설정",
  rate_overlap: "적용 단가 중복",
  final_amount_missing: "확정 금액 확인 필요",
  rejected: "반려",
}[status] || "급여 계산 대기");

export const canApproveSalary = (salary) =>
  !salary || !BLOCKED_STATUSES.has(salary.calculation_status);

export const formatSalaryAmount = (salary) => {
  if (salary?.amount == null) return getSalaryStatusLabel(salary?.calculation_status);
  return `${Number(salary.amount).toLocaleString()}원`;
};
