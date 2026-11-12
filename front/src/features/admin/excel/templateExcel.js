import { exportPreservedFinanceTemplate } from "./preservedFinanceExcel";
import { exportPreservedTemplate } from "./preservedTemplateExcel";

const safeSheetName = (value, fallback) => {
  const name = String(value || fallback).replace(/[\\/?*[\]:]/g, " ").trim();
  return (name || fallback).slice(0, 31);
};

const monthLabel = (month) => {
  const [year, value] = String(month || "").split("-");
  return year && value ? `${year}년 ${Number(value)}월` : "선택 기간";
};

const todayFileDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const excelColumn = (columnNumber) => {
  let number = columnNumber;
  let result = "";
  while (number > 0) {
    number -= 1;
    result = String.fromCharCode(65 + (number % 26)) + result;
    number = Math.floor(number / 26);
  }
  return result;
};

const excelTextWidth = (value, minimum = 12, maximum = 30) => {
  const width = [...String(value || "")]
    .reduce((sum, character) => sum + (character.charCodeAt(0) > 127 ? 2 : 1), 0) + 2;
  return Math.min(maximum, Math.max(minimum, width));
};

const groupWorkDays = (workDays = []) => {
  const groups = new Map();
  workDays.forEach((item) => {
    const key = item.user_uuid || item.user_name || "미등록";
    if (!groups.has(key)) groups.set(key, { name: item.user_name || "", rows: [] });
    groups.get(key).rows.push(item);
  });
  return [...groups.values()]
    .map((group) => ({
      ...group,
      rows: [...group.rows].sort((a, b) =>
        String(a.work_date || "").localeCompare(String(b.work_date || ""))
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
};

const salaryAmount = (item) => Number(item?.salary?.amount ?? item?.salary_amount ?? 0) || 0;

export async function exportFinanceTemplate({ type, rows, startMonth, endMonth }) {
  return exportPreservedFinanceTemplate({ type, rows, startMonth, endMonth });
}

export async function exportSalaryTemplate({ workDays = [], salaryRows = [], month }) {
  const employees = salaryRows.length
    ? salaryRows.map((row) => ({
        name: row.user_name || "",
        residentNumber: row.resident_number || "",
        amount: Number(row.total_amount || 0),
      }))
    : groupWorkDays(workDays).map((employee) => ({
        ...employee,
        residentNumber: "",
        amount: employee.rows.reduce((sum, item) => sum + salaryAmount(item), 0),
      }));
  const sheets = [];

  for (let page = 0; page < Math.max(1, Math.ceil(employees.length / 2)); page += 1) {
    const cells = [{ address: "A1", value: `${monthLabel(month)} 급·상여지급대장` }];
    employees.slice(page * 2, page * 2 + 2).forEach((employee, index) => {
      const row = 5 + index;
      cells.push(
        { address: `A${row}`, type: "number", value: page * 2 + index + 1 },
        { address: `B${row}`, value: "" },
        { address: `C${row}`, value: employee.name },
        { address: `D${row}`, value: employee.residentNumber },
        { address: `G${row}`, type: "number", value: employee.amount },
        { address: `H${row}`, type: "number", value: employee.amount },
        { address: `K${row}`, type: "number", value: employee.amount },
        ...["L", "M", "N", "O", "P", "Q"].map((column) => ({
          address: `${column}${row}`,
          type: "number",
          value: 0,
        }))
      );
    });
    [5, 6].forEach((row) => {
      if (employees[page * 2 + row - 5]) return;
      ["A", "B", "C", "D", "G", "H", "K", "L", "M", "N", "O", "P", "Q"].forEach((column) => {
        cells.push({ address: `${column}${row}`, value: "" });
      });
    });
    cells.push({
      address: "G7",
      type: "number",
      value: employees
        .slice(page * 2, page * 2 + 2)
        .reduce((sum, employee) => sum + employee.amount, 0),
    });
    sheets.push({ name: `급여대장${page + 1}`, cells });
  }

  return exportPreservedTemplate({
    templateName: "salary_template.xlsx",
    sheets,
    fileName: `salary_ledger_${todayFileDate()}.xlsx`,
  });
}

const WORK_TYPE_ROW = {
  "평일주간": 13,
  "주간": 13,
  "평일잔업": 14,
  "평일 잔업": 14,
  "중식연장": 15,
  "중식 연장": 15,
  "주간 특근": 16,
  "야간 특근": 17,
  "평일야간": 18,
  "야간": 18,
  "야간잔업": 19,
  "야간 잔업": 19,
  "조기출근": 20,
  "조기 출근": 20,
};

const USER_PAY_DAY_COUNT_TYPES = new Set([
  "평일주간",
  "주간",
  "주간 특근",
  "야간 특근",
  "평일야간",
  "야간",
]);

const USER_PAY_LABEL_BY_ROW = {
  13: "평일주간",
  14: "평일잔업",
  15: "중식연장",
  16: "주간특근",
  17: "야간특근",
  18: "평일야간",
  19: "야간잔업",
  20: "조기출근",
};

const DAILY_PAY_LABEL_BY_ROW = {
  ...USER_PAY_LABEL_BY_ROW,
  21: "기존확정급여",
};

const normalizedWorkType = (detail, workDay) => {
  const label = String(detail?.work_type || "").trim();
  if (label === "특근" || label === "휴일 특근") {
    return String(workDay?.work_shift || "").includes("야간")
      ? "야간 특근"
      : "주간 특근";
  }
  return label;
};

export async function exportUserPayTemplate({ workDays, month }) {
  const [year, monthNumber] = String(month).split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  const employees = groupWorkDays(workDays);
  const sheets = (employees.length ? employees : [{ name: "급여명세", rows: [] }]).map((employee, index) => {
    const cells = [
      { address: "FC1", value: "" },
      { address: "B2", value: `${year} 년  ${monthNumber}월 급여명세서` },
      { address: "B4", value: `업무기간 (${year}.${monthNumber}.1 ~ ${year}.${monthNumber}.${lastDay})` },
      { address: "D5", value: employee.name },
      { address: "F5", value: "" },
      { address: "D6", value: "" },
      { address: "F6", value: "" },
      { address: "D7", value: "" },
      { address: "F7", value: "" },
    ];
    const summary = {};
    Object.values(WORK_TYPE_ROW).forEach((row) => {
      summary[row] = { amount: 0, quantity: 0, units: new Set() };
    });
    let legacyAmount = 0;

    employee.rows.forEach((item) => {
      const salary = item.salary || {};
      if (!salary.details_available) {
        legacyAmount += Number(salary.amount || 0);
        return;
      }

      (salary.detail_amounts || []).forEach((detail) => {
        const label = normalizedWorkType(detail, item);
        const row = WORK_TYPE_ROW[label];
        if (!row) return;
        const minutes = Number(detail.minutes) || 0;
        const quantity = USER_PAY_DAY_COUNT_TYPES.has(label)
          ? (minutes ? 1 : 0)
          : minutes / 60;
        const amount = Number(detail.amount) || 0;
        summary[row].quantity += quantity;
        summary[row].amount += amount;
        if (quantity) summary[row].units.add(Math.round(amount / quantity));
      });
    });

    Object.entries(USER_PAY_LABEL_BY_ROW).forEach(([rowKey, label]) => {
      const row = Number(rowKey);
      const values = summary[row];
      const units = [...values.units];
      cells.push(
        { address: `J${row}`, value: label },
        { address: `K${row}`, type: "number", value: values.quantity },
        {
          address: `L${row}`,
          type: units.length > 1 ? "text" : "number",
          value: units.length === 1 ? units[0] : units.length ? "복수 단가" : 0,
        },
        { address: `M${row}`, type: "number", value: values.amount }
      );
    });
    cells.push(
      { address: "J22", value: "기존 확정 급여(상세 없음)" },
      { address: "M22", type: "number", value: legacyAmount }
    );
    return { name: safeSheetName(employee.name, `급여명세${index + 1}`), cells };
  });
  return exportPreservedTemplate({
    templateName: "user_pay_template.xlsx",
    sheets,
    dimensionRef: "B1:M34",
    fileName: `salary_${todayFileDate()}.xlsx`,
  });
}

export async function exportDailyPayRates(payRows = [], { month } = {}) {
  const employeesWithWork = payRows.filter(
    (employee) => Array.isArray(employee?.rows) && employee.rows.length > 0
  );
  if (!employeesWithWork.length) {
    throw new Error("선택한 달에 근무내역이 있는 직원이 없습니다.");
  }

  const employeeRows = employeesWithWork.map((employee) => {
    const workplaces = new Map();
    (employee.rows || []).forEach((payRow) => {
      const workplaceName = payRow.work_place || "미지정";
      if (!workplaces.has(workplaceName)) {
        workplaces.set(workplaceName, { name: workplaceName, values: {} });
      }
      const workplace = workplaces.get(workplaceName);
      const workType = normalizedWorkType({ work_type: payRow.work_type }, payRow);
      const legacyAmount = workType === "기존 확정 급여";
      const targetRow = legacyAmount ? 21 : WORK_TYPE_ROW[workType];
      if (!targetRow) return;
      if (!workplace.values[targetRow]) {
        workplace.values[targetRow] = {
          amount: 0,
          legacyAmount,
          quantity: 0,
          unitPrices: new Set(),
        };
      }
      const value = workplace.values[targetRow];
      value.quantity += Number(payRow.quantity) || 0;
      value.amount += Number(payRow.amount) || 0;
      if (payRow.unit_price != null) value.unitPrices.add(Number(payRow.unit_price) || 0);
    });

    workplaces.forEach((workplace) => {
      Object.values(workplace.values).forEach((value) => {
        const unitPrices = [...value.unitPrices];
        value.unitPrice = unitPrices.length === 1
          ? unitPrices[0]
          : value.quantity
            ? value.amount / value.quantity
            : 0;
      });
    });
    return {
      name: employee.user_name || "",
      totalAmount: Number(employee.total_amount) || 0,
      workplaces,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, "ko"));
  const [year, monthNumber] = String(month || "").split("-").map(Number);
  const lastDay = year && monthNumber ? new Date(year, monthNumber, 0).getDate() : "";
  const sheets = employeeRows.map((employee) => {
      const workplaces = [...employee.workplaces.values()]
        .sort((a, b) => a.name.localeCompare(b.name, "ko"));
      const blockCount = Math.max(2, workplaces.length);
      const amountColumns = Array.from({ length: blockCount }, (_, index) => excelColumn(13 + index * 5));
      const columnWidths = { 4: excelTextWidth(employee.name, 16.375) };
      const cells = [
        { address: "FC1", value: "" },
        { address: "B2", value: `${year || ""}년 ${monthNumber || ""}월 직원별 일급 기준표` },
        {
          address: "B4",
          value: year && monthNumber ? `업무기간 (${year}.${monthNumber}.1 ~ ${year}.${monthNumber}.${lastDay})` : "업무기간",
        },
        { address: "D5", value: employee.name },
        { address: "E5", value: "근무지 수" },
        { address: "F5", type: "number", value: workplaces.length },
        { address: "D6", value: "" },
        { address: "F6", value: "" },
        { address: "D7", value: "" },
        { address: "F7", value: "" },
      ];

      for (let index = 0; index < blockCount; index += 1) {
        const workplace = workplaces[index];
        const startColumn = 10 + index * 5;
        const itemColumn = excelColumn(startColumn);
        const quantityColumn = excelColumn(startColumn + 1);
        const rateColumn = excelColumn(startColumn + 2);
        const amountColumn = excelColumn(startColumn + 3);
        columnWidths[startColumn] = excelTextWidth(workplace?.name, 12.125);
        columnWidths[startColumn + 1] = 8;
        columnWidths[startColumn + 2] = 14;
        columnWidths[startColumn + 3] = 14;
        cells.push({ address: `${itemColumn}11`, value: workplace?.name || "" });

        Object.entries(DAILY_PAY_LABEL_BY_ROW).forEach(([row, label]) => {
          const value = workplace?.values[row] || {};
          cells.push(
            { address: `${itemColumn}${row}`, value: label },
            { address: `${quantityColumn}${row}`, type: "number", value: value.quantity || 0 },
            { address: `${rateColumn}${row}`, type: "number", value: value.unitPrice || 0 }
          );
          cells.push(value.legacyAmount
            ? { address: `${amountColumn}${row}`, type: "number", value: value.amount || 0 }
            : {
                address: `${amountColumn}${row}`,
                type: "formula",
                value: `${quantityColumn}${row}*${rateColumn}${row}`,
              });
        });
        cells.push({
          address: `${amountColumn}25`,
          type: "formula",
          value: `SUM(${amountColumn}13:${amountColumn}24)`,
        });
      }

      Object.keys(DAILY_PAY_LABEL_BY_ROW).forEach((row) => {
        cells.push({
          address: `D${row}`,
          type: "formula",
          value: `SUM(${amountColumns.map((column) => `${column}${row}`).join(",")})`,
        });
      });
      cells.push(
        { address: "C21", value: "기존확정급여" },
        { address: "D23", type: "formula", value: "SUM(D13:D22)" }
      );
      const lastAmountColumn = amountColumns[amountColumns.length - 1];
      return {
        name: safeSheetName(employee.name, "일급관리"),
        cells,
        repeatPayBlocks: Math.max(0, workplaces.length - 2),
        dimensionRef: `B1:${lastAmountColumn}34`,
        columnWidths,
      };
    });
  return exportPreservedTemplate({
    templateName: "user_pay_template.xlsx",
    sheets,
    fileName: `daily_pay_${month || todayFileDate()}.xlsx`,
  });
}

const WORKLOAD_ROW_OFFSET = {
  "평일주간": 0,
  "주간": 0,
  "평일잔업": 1,
  "평일 잔업": 1,
  "중식연장": 2,
  "중식 연장": 2,
  "주간 특근": 3,
  "야간 특근": 4,
  "평일야간": 5,
  "야간": 5,
  "야간잔업": 6,
  "야간 잔업": 6,
  "조기출근": 7,
  "조기 출근": 7,
  "평일 연장": 8,
  "평일연장": 8,
};

export async function exportWorkloadTemplate({ workDays, month, workPlace = "" }) {
  const sheets = [];
  const [year, monthNumber] = String(month).split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const dayCountTypes = new Set([
    "평일주간",
    "주간",
    "주간 특근",
    "야간 특근",
    "평일야간",
    "야간",
  ]);
  const workplaceGroups = new Map();
  workDays.forEach((item) => {
    const workplaceName = item.work_place || workPlace || "미지정";
    if (!workplaceGroups.has(workplaceName)) workplaceGroups.set(workplaceName, []);
    workplaceGroups.get(workplaceName).push(item);
  });
  if (!workplaceGroups.size) workplaceGroups.set(workPlace || "전체", []);
  const workplaces = [...workplaceGroups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ko"));

  workplaces.forEach(([workplaceName, workplaceRows]) => {
    const employees = groupWorkDays(workplaceRows);
    const pageCount = Math.max(1, Math.ceil(employees.length / 2));
    for (let page = 0; page < pageCount; page += 1) {
    const cells = [{
      address: "D2",
      value: `${year}년 ${monthNumber}월 ${workplaceName} 근무 현황`,
    }];
    for (let day = 1; day <= 31; day += 1) {
      const column = excelColumn(15 + day);
      if (day <= lastDay) {
        const date = new Date(year, monthNumber - 1, day);
        cells.push(
          { address: `${column}3`, value: weekdays[date.getDay()] },
          { address: `${column}4`, value: `${String(monthNumber).padStart(2, "0")}/${String(day).padStart(2, "0")}` }
        );
      } else {
        cells.push(
          { address: `${column}3`, value: "" },
          { address: `${column}4`, value: "" }
        );
      }
    }

    [5, 14].forEach((startRow) => {
      cells.push(
        { address: `C${startRow}`, value: "" },
        { address: `D${startRow}`, value: "" }
      );
      for (let offset = 0; offset < 9; offset += 1) {
        for (let day = 1; day <= 31; day += 1) {
          const column = excelColumn(15 + day);
          cells.push({ address: `${column}${startRow + offset}`, value: "" });
        }
      }
    });

    employees.slice(page * 2, page * 2 + 2).forEach((employee, employeeIndex) => {
      const startRow = employeeIndex === 0 ? 5 : 14;
      cells.push(
        { address: `C${startRow}`, type: "number", value: page * 2 + employeeIndex + 1 },
        { address: `D${startRow}`, value: employee.name }
      );
      const totals = new Map();
      employee.rows.forEach((item) => {
        const day = new Date(item.work_date).getDate();
        const column = excelColumn(15 + day);
        (item.details || []).forEach((detail) => {
          const workType = normalizedWorkType(detail, item);
          const offset = WORKLOAD_ROW_OFFSET[workType];
          if (offset == null) return;
          const minutes = Number(detail.minutes) || 0;
          const value = dayCountTypes.has(workType)
            ? (minutes ? 1 : 0)
            : minutes / 60;
          const address = `${column}${startRow + offset}`;
          if (value) totals.set(address, (totals.get(address) || 0) + value);
        });
      });
      totals.forEach((value, address) => {
        cells.push({ address, type: "number", value });
      });
    });
      sheets.push({
        name: safeSheetName(
          `${workplaceName}${pageCount > 1 ? `_${page + 1}` : ""}`,
          `근무기록${sheets.length + 1}`
        ),
        cells,
      });
    }
  });

  return exportPreservedTemplate({
    templateName: "workload_template.xlsx",
    sheets,
    removeLinks: true,
    fileName: `approval_${todayFileDate()}.xlsx`,
  });
}

