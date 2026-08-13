export const APPROVAL_PAGE_SIZE = 10;

export const APPROVAL_INITIAL_STATUS = "대기";

export const APPROVAL_STATUS = {
  ALL: "전체",
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
};

export const APPROVAL_SUMMARY_CARDS = [
  { key: "pending", label: "대기", color: "orange" },
  { key: "approved", label: "승인", color: "green" },
  { key: "rejected", label: "반려", color: "red" },
  { key: "selected", label: "선택", color: "blue" },
];
