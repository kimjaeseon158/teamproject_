const TEMPLATE_BASE = `${process.env.PUBLIC_URL || ""}/templates`;

const requireXlsx = () => {
  if (!window.XLSX) {
    throw new Error("엑셀 처리 모듈을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.");
  }
  return window.XLSX;
};

const loadTemplate = async (name) => {
  const XLSX = requireXlsx();
  const response = await fetch(`${TEMPLATE_BASE}/${name}`);
  if (!response.ok) throw new Error("엑셀 템플릿을 불러오지 못했습니다.");
  return XLSX.read(await response.arrayBuffer(), {
    type: "array",
    cellDates: true,
    cellStyles: true,
  });
};

const setCell = (sheet, address, value) => {
  const original = sheet[address] || {};
  const numeric = typeof value === "number" && Number.isFinite(value);
  sheet[address] = { ...original, t: numeric ? "n" : "s", v: value ?? "" };
  delete sheet[address].f;
  delete sheet[address].w;
};

const cloneSheet = (sheet) => JSON.parse(JSON.stringify(sheet));

const safeSheetName = (value, fallback) => {
  const name = String(value || fallback).replace(/[\\/?*[\]:]/g, " ").trim();
  return (name || fallback).slice(0, 31);
};

const replaceWorkbookSheets = (workbook, sheets) => {
  workbook.SheetNames = [];
  workbook.Sheets = {};
  sheets.forEach(({ name, sheet }, index) => {
    let nextName = safeSheetName(name, `Sheet${index + 1}`);
    while (workbook.Sheets[nextName]) nextName = `${nextName.slice(0, 27)}_${index + 1}`;
    workbook.SheetNames.push(nextName);
    workbook.Sheets[nextName] = sheet;
  });
};

const download = (workbook, fileName) => {
  requireXlsx().writeFile(workbook, fileName, {
    bookType: "xlsx",
    cellStyles: true,
    compression: true,
  });
};

const monthLabel = (month) => {
  const [year, value] = String(month || "").split("-");
  return year && value ? `${year}년 ${Number(value)}월` : "선택 기간";
};

const toDateText = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const todayFileDate = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const groupWorkDays = (workDays = []) => {
  const groups = new Map();
  workDays.forEach((item) => {
    const key = item.user_uuid || item.user_name || "미등록";
    if (!groups.has(key)) groups.set(key, { name: item.user_name || "", rows: [] });
    groups.get(key).rows.push(item);
  });
  return [...groups.values()];
};

const salaryAmount = (item) => Number(item?.salary?.amount ?? item?.salary_amount ?? 0) || 0;

export async function exportFinanceTemplate({ type, rows, startMonth, endMonth }) {
  const income = type === "income";
  const workbook = await loadTemplate(income ? "income_template.xlsx" : "expense_template.xlsx");
  const baseSheet = workbook.Sheets[workbook.SheetNames[0]];
  const pages = [];
  const pageSize = 10;
  const sourceRows = Array.isArray(rows) ? rows : [];
  const pageCount = Math.max(1, Math.ceil(sourceRows.length / pageSize));

  for (let page = 0; page < pageCount; page += 1) {
    const sheet = cloneSheet(baseSheet);
    const pageRows = sourceRows.slice(page * pageSize, (page + 1) * pageSize);
    const targetRows = [3, 4, 5, 6, 7, 9, 10, 11, 12, 13];
    targetRows.forEach((rowNumber, index) => {
      const item = pageRows[index];
      setCell(sheet, `B${rowNumber}`, item ? page * pageSize + index + 1 : "");
      setCell(sheet, `C${rowNumber}`, item ? toDateText(item.date) : "");
      setCell(sheet, `D${rowNumber}`, item ? (item.name || "") : "");
      setCell(sheet, `E${rowNumber}`, item ? (item.detail || "") : "");
      setCell(sheet, `F${rowNumber}`, item ? Number(item.amount || 0) : "");
      setCell(sheet, `G${rowNumber}`, item ? (income ? (item.note || "") : (item.paymentMethod || "")) : "");
    });
    pages.push({ name: pageCount > 1 ? `${income ? "수입" : "지출"}${page + 1}` : income ? "수입" : "지출", sheet });
  }

  replaceWorkbookSheets(workbook, pages);
  download(workbook, `${income ? "income" : "expense"}_${startMonth}${startMonth !== endMonth ? `_${endMonth}` : ""}.xlsx`);
}

export async function exportSalaryTemplate({ workDays, month }) {
  const workbook = await loadTemplate("salary_template.xlsx");
  const baseSheet = workbook.Sheets[workbook.SheetNames[0]];
  const employees = groupWorkDays(workDays).map((employee) => ({
    ...employee,
    amount: employee.rows.reduce((sum, item) => sum + salaryAmount(item), 0),
    workPlace: employee.rows.find((item) => item.work_place)?.work_place || "",
  }));
  const sheets = [];

  for (let page = 0; page < Math.max(1, Math.ceil(employees.length / 2)); page += 1) {
    const sheet = cloneSheet(baseSheet);
    setCell(sheet, "A1", `${monthLabel(month)} 급·상여지급대장`);
    employees.slice(page * 2, page * 2 + 2).forEach((employee, index) => {
      const row = 5 + index;
      setCell(sheet, `A${row}`, page * 2 + index + 1);
      setCell(sheet, `B${row}`, employee.workPlace);
      setCell(sheet, `C${row}`, employee.name);
      setCell(sheet, `H${row}`, employee.amount);
      setCell(sheet, `K${row}`, employee.amount);
      setCell(sheet, `L${row}`, 0);
      setCell(sheet, `M${row}`, 0);
      setCell(sheet, `N${row}`, 0);
      setCell(sheet, `O${row}`, 0);
      setCell(sheet, `P${row}`, 0);
      setCell(sheet, `Q${row}`, 0);
    });
    sheets.push({ name: `급여대장${page + 1}`, sheet });
  }

  replaceWorkbookSheets(workbook, sheets);
  download(workbook, `approval_${todayFileDate()}.xlsx`);
}

const WORK_TYPE_ROW = {
  "평일주간": 13,
  "주간": 13,
  "평일잔업": 14,
  "중식연장": 15,
  "주간 특근": 16,
  "야간 특근": 17,
  "평일야간": 18,
  "야간": 18,
  "야간잔업": 19,
  "조기출근": 20,
};

export async function exportUserPayTemplate({ workDays, month }) {
  const workbook = await loadTemplate("user_pay_template.xlsx");
  const baseSheet = workbook.Sheets[workbook.SheetNames[0]];
  const [year, monthNumber] = String(month).split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  const employees = groupWorkDays(workDays);
  const sheets = (employees.length ? employees : [{ name: "급여명세", rows: [] }]).map((employee, index) => {
    const sheet = cloneSheet(baseSheet);
    setCell(sheet, "B2", `${year} 년  ${monthNumber}월 급여명세서`);
    setCell(sheet, "B4", `업무기간 (${year}.${monthNumber}.1 ~ ${year}.${monthNumber}.${lastDay})`);
    setCell(sheet, "C5", employee.name);
    setCell(sheet, "D6", employee.rows.find((item) => item.work_place)?.work_place || "");
    const quantities = {};
    const rates = {};
    employee.rows.forEach((item) => {
      (item.details || []).forEach((detail) => {
        const label = String(detail.work_type || "").trim();
        const row = WORK_TYPE_ROW[label];
        if (!row) return;
        quantities[row] = (quantities[row] || 0) + (Number(detail.minutes) || 0) / 60;
        const rate = Number(detail.hourly_wage ?? detail.rate ?? 0) || 0;
        if (rate) rates[row] = rate;
      });
    });
    Object.entries(WORK_TYPE_ROW).forEach(([, row]) => {
      setCell(sheet, `K${row}`, quantities[row] || 0);
      if (rates[row]) setCell(sheet, `L${row}`, rates[row]);
    });
    return { name: safeSheetName(employee.name, `급여명세${index + 1}`), sheet };
  });
  replaceWorkbookSheets(workbook, sheets);
  download(workbook, `pay_statements_${month}.xlsx`);
}

export function exportDailyPayRates(rows = []) {
  const XLSX = requireXlsx();
  const headers = [
    "이름",
    "근무지",
    "주간(평균)",
    "야간(평균)",
    "평일 잔업(평균)",
    "야간 잔업(평균)",
    "주간 특근(평균)",
    "야간 특근(평균)",
    "조기출근(평균)",
    "중식연장(평균)",
  ];
  const values = rows.map((row) => [
    row.user_name || "",
    row.work_place || "",
    row.base_hourly_wage ?? "",
    row.overnight_hourly_wage ?? "",
    row.overtime_hourly_wage ?? "",
    row.overnight_ot_hourly_wage ?? "",
    row.day_special_hourly_wage ?? "",
    row.night_special_hourly_wage ?? "",
    row.early_hourly_wage ?? "",
    row.meal_ot_hourly_wage ?? "",
  ]);
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...values]);
  sheet["!cols"] = [
    { wch: 16 }, { wch: 24 },
    ...Array.from({ length: 8 }, () => ({ wch: 18 })),
  ];
  sheet["!autofilter"] = { ref: `A1:J${Math.max(1, values.length + 1)}` };
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "일급관리");
  download(workbook, `daily_pay_${todayFileDate()}.xlsx`);
}

const WORKLOAD_ROW_OFFSET = {
  "평일주간": 0,
  "주간": 0,
  "평일잔업": 1,
  "중식연장": 2,
  "주간 특근": 3,
  "야간 특근": 4,
  "평일야간": 5,
  "야간": 5,
  "야간잔업": 6,
  "조기출근": 7,
  "평일 연장": 8,
};

export async function exportWorkloadTemplate({ workDays, month }) {
  const XLSX = requireXlsx();
  const workbook = await loadTemplate("workload_template.xlsx");
  const baseSheet = workbook.Sheets[workbook.SheetNames[0]];
  const employees = groupWorkDays(workDays);
  const sheets = [];
  const [year, monthNumber] = String(month).split("-").map(Number);

  for (let page = 0; page < Math.max(1, Math.ceil(employees.length / 2)); page += 1) {
    const sheet = cloneSheet(baseSheet);
    setCell(sheet, "D2", `_${String(year).slice(-2)}년 ${monthNumber}월 근무 기록표`);
    employees.slice(page * 2, page * 2 + 2).forEach((employee, employeeIndex) => {
      const startRow = employeeIndex === 0 ? 5 : 14;
      setCell(sheet, `D${startRow}`, employee.name);
      employee.rows.forEach((item) => {
        const day = new Date(item.work_date).getDate();
        const column = XLSX.utils.encode_col(14 + day);
        (item.details || []).forEach((detail) => {
          const offset = WORKLOAD_ROW_OFFSET[String(detail.work_type || "").trim()];
          if (offset == null) return;
          setCell(sheet, `${column}${startRow + offset}`, (Number(detail.minutes) || 0) / 60);
        });
      });
    });
    sheets.push({ name: `근무기록${page + 1}`, sheet });
  }

  replaceWorkbookSheets(workbook, sheets);
  download(workbook, `workload_${month}.xlsx`);
}
