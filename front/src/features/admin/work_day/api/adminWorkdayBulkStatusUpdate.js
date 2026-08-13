import { adminWorkdayStatusUpdate } from "./adminWorkdayStatusUpdate";

const toStatusPayload = (row) => ({
  user_uuid: row.user_uuid,
  work_date: row.date,
  work_shift: row.workShift || row.workType,
});

export async function adminWorkdayBulkStatusUpdate(
  rows,
  status,
  { toast, rejectReason = "" } = {}
) {
  return adminWorkdayStatusUpdate(
    {
      data: rows.map(toStatusPayload),
      status,
      ...(status === false ? { reject_reason: rejectReason } : {}),
    },
    { toast }
  );
}
