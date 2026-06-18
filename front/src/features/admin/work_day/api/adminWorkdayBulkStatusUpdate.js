import { adminWorkdayStatusUpdate } from "./adminWorkdayStatusUpdate";

const toStatusPayload = (row, status, rejectReason = "") => ({
  user_uuid: row.user_uuid,
  work_date: row.date,
  work_shift: row.workShift || row.workType,
  status,
  ...(status === false ? { reject_reason: rejectReason } : {}),
});

export async function adminWorkdayBulkStatusUpdate(
  rows,
  status,
  { toast, rejectReason = "" } = {}
) {
  const results = await Promise.allSettled(
    rows.map((row) =>
      adminWorkdayStatusUpdate(toStatusPayload(row, status, rejectReason), { toast })
    )
  );

  const failed = results.filter((result) => result.status === "rejected");

  if (failed.length) {
    throw new Error(`${failed.length}건 처리에 실패했습니다.`);
  }

  return {
    success: true,
    count: rows.length,
  };
}
