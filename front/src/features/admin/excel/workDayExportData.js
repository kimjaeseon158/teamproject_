import { getAdminWorkDays } from "../work_day/api/adminWorkday";
import { APPROVAL_STATUS } from "../work_day/constants/approvalConstants";

const monthRange = (month) => {
  const [year, value] = String(month || "").split("-").map(Number);
  if (!year || !value) throw new Error("내보낼 연월을 선택해 주세요.");
  const lastDay = new Date(year, value, 0).getDate();
  return {
    start: `${year}-${String(value).padStart(2, "0")}-01`,
    end: `${year}-${String(value).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
};

export async function fetchApprovedWorkDays(month, workPlace = "", toast) {
  const range = monthRange(month);
  const pageSize = 50;
  const requestPage = (page) => getAdminWorkDays(
    {
      status: APPROVAL_STATUS.APPROVED,
      start_date: range.start,
      end_date: range.end,
      work_place: workPlace,
      page,
      page_size: pageSize,
    },
    { toast }
  );

  const firstPage = await requestPage(1);
  const totalPages = Math.max(1, Number(firstPage.pagination?.total_pages) || 1);
  if (totalPages === 1) return firstPage.data;

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => requestPage(index + 2))
  );
  return [
    ...firstPage.data,
    ...remainingPages.flatMap((response) => response.data),
  ];
}
