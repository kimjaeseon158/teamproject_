import { ApiGet, toQueryString } from "../../../services/api/requestJson";

export const getIncomeExcelExportData = (startMonth, endMonth, toast) =>
  ApiGet(
    `/api/income-excel-export/${toQueryString({
      start_month: startMonth,
      end_month: endMonth,
    })}`,
    { toast }
  );

export const getExpenseExcelExportData = (startMonth, endMonth, toast) => {
  const [year, month] = String(endMonth || "").split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();

  return ApiGet(
    `/api/expense-filtered/${toQueryString({
      start_date: `${startMonth}-01`,
      end_date: `${endMonth}-${String(lastDay).padStart(2, "0")}`,
    })}`,
    { toast }
  );
};

export const getWorkplaceExcelExportData = (date, workPlace, toast) =>
  ApiGet(
    `/api/workplace-excel-export/${toQueryString({
      date,
      work_place: workPlace,
    })}`,
    { toast }
  );

export const getSalaryExcelExportData = (date, toast) =>
  ApiGet(
    `/api/salary-excel-export/${toQueryString({ date })}`,
    { toast }
  );

export const getUserPayExcelExportData = (date, userUuids = [], toast) =>
  ApiGet(
    `/api/user-pay-excel-export/${toQueryString({
      date,
      user_uuid: userUuids.length ? userUuids.join(",") : "",
    })}`,
    { toast }
  );
