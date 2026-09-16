import { isApprovedStatus, isRejectedStatus } from "./approveUtils";

export const getStatusColor = (status) => {
  if (isApprovedStatus(status)) return "green";
  if (isRejectedStatus(status)) return "red";
  return "yellow";
};

export const getWorkTypeColor = (type) => {
  if (String(type || "").includes("야간")) return "purple";
  if (String(type || "").includes("특근")) return "orange";
  return "blue";
};

