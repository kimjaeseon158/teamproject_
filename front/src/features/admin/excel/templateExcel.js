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

const removeBrokenWorkbookLinks = (workbook) => {
  if (!workbook?.Workbook) return;

  // workload 원본에는 삭제된 외부 세금표를 가리키는 이름 범위가 남아 있다.
  // SheetJS로 다시 저장하면 외부 파일은 제외되지만 이름만 남아 Excel 복구가 발생한다.
  workbook.Workbook.Names = [];
  delete workbook.Deps;
};

const safeSheetName = (value, fallback) => {
  const name = String(value || fallback).replace(/[\\/?*[\]:]/g, " ").trim();
  return (name || fallback).slice(0, 31);
};

const replaceWorkbookSheets = (workbook, sheets) => {
  if (!sheets.length) return;
  const XLSX = requireXlsx();
  const primaryName = workbook.SheetNames[0];
  workbook.Sheets[primaryName] = sheets[0].sheet;

  sheets.slice(1).forEach(({ name, sheet }, index) => {
    let nextName = safeSheetName(name, `Sheet${index + 2}`);
    let suffix = index + 2;
    while (workbook.Sheets[nextName]) {
      nextName = `${safeSheetName(name, "Sheet").slice(0, 27)}_${suffix}`;
      suffix += 1;
    }
    XLSX.utils.book_append_sheet(workbook, sheet, nextName);
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
  }));
  const sheets = [];

  for (let page = 0; page < Math.max(1, Math.ceil(employees.length / 2)); page += 1) {
    const sheet = cloneSheet(baseSheet);
    setCell(sheet, "A1", `${monthLabel(month)} 급·상여지급대장`);
    employees.slice(page * 2, page * 2 + 2).forEach((employee, index) => {
      const row = 5 + index;
      setCell(sheet, `A${row}`, page * 2 + index + 1);
      setCell(sheet, `B${row}`, "");
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
  download(workbook, `salary_ledger_${todayFileDate()}.xlsx`);
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
  const workbook = await loadTemplate("user_pay_template.xlsx");
  const baseSheet = workbook.Sheets[workbook.SheetNames[0]];
  const [year, monthNumber] = String(month).split("-").map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  const employees = groupWorkDays(workDays);
  const sheets = (employees.length ? employees : [{ name: "급여명세", rows: [] }]).map((employee, index) => {
    const sheet = cloneSheet(baseSheet);
    delete sheet.FC1;
    sheet["!ref"] = "A1:M34";
    setCell(sheet, "B2", `${year} 년  ${monthNumber}월 급여명세서`);
    setCell(sheet, "B4", `업무기간 (${year}.${monthNumber}.1 ~ ${year}.${monthNumber}.${lastDay})`);
    setCell(sheet, "D5", employee.name);
    setCell(sheet, "F5", "");
    setCell(sheet, "D6", "");
    setCell(sheet, "F6", "");
    setCell(sheet, "D7", "");
    setCell(sheet, "F7", "");
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
      setCell(sheet, `J${row}`, label);
      setCell(sheet, `K${row}`, values.quantity);
      setCell(sheet, `L${row}`, units.length === 1 ? units[0] : units.length ? "복수 단가" : 0);
      setCell(sheet, `M${row}`, values.amount);
    });
    setCell(sheet, "J22", "기존 확정 급여(상세 없음)");
    setCell(sheet, "M22", legacyAmount);
    return { name: safeSheetName(employee.name, `급여명세${index + 1}`), sheet };
  });
  replaceWorkbookSheets(workbook, sheets);
  download(workbook, `salary_${todayFileDate()}.xlsx`);
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

export async function exportWorkloadTemplate({ workDays, month }) {
  const XLSX = requireXlsx();
  const workbook = await loadTemplate("workload_template.xlsx");
  removeBrokenWorkbookLinks(workbook);
  const baseSheet = workbook.Sheets[workbook.SheetNames[0]];
  const employees = groupWorkDays(workDays);
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

  for (let page = 0; page < Math.max(1, Math.ceil(employees.length / 2)); page += 1) {
    const sheet = cloneSheet(baseSheet);
    setCell(sheet, "D2", `${year}년 ${monthNumber}월 전체 근무 현황`);
    for (let day = 1; day <= 31; day += 1) {
      const column = XLSX.utils.encode_col(14 + day);
      if (day <= lastDay) {
        const date = new Date(year, monthNumber - 1, day);
        setCell(sheet, `${column}3`, weekdays[date.getDay()]);
        setCell(sheet, `${column}4`, `${String(monthNumber).padStart(2, "0")}/${String(day).padStart(2, "0")}`);
      } else {
        setCell(sheet, `${column}3`, "");
        setCell(sheet, `${column}4`, "");
      }
    }

    [5, 14].forEach((startRow) => {
      setCell(sheet, `C${startRow}`, "");
      setCell(sheet, `D${startRow}`, "");
      for (let offset = 0; offset < 9; offset += 1) {
        for (let day = 1; day <= 31; day += 1) {
          const column = XLSX.utils.encode_col(14 + day);
          setCell(sheet, `${column}${startRow + offset}`, "");
        }
      }
    });

    employees.slice(page * 2, page * 2 + 2).forEach((employee, employeeIndex) => {
      const startRow = employeeIndex === 0 ? 5 : 14;
      setCell(sheet, `C${startRow}`, page * 2 + employeeIndex + 1);
      setCell(sheet, `D${startRow}`, employee.name);
      employee.rows.forEach((item) => {
        const day = new Date(item.work_date).getDate();
        const column = XLSX.utils.encode_col(14 + day);
        (item.details || []).forEach((detail) => {
          const workType = normalizedWorkType(detail, item);
          const offset = WORKLOAD_ROW_OFFSET[workType];
          if (offset == null) return;
          const minutes = Number(detail.minutes) || 0;
          const value = dayCountTypes.has(workType)
            ? (minutes ? 1 : 0)
            : minutes / 60;
          const address = `${column}${startRow + offset}`;
          const previousValue = Number(sheet[address]?.v) || 0;
          setCell(sheet, address, value ? previousValue + value : previousValue || "");
        });
      });
    });
    sheets.push({ name: `근무기록${page + 1}`, sheet });
  }

  replaceWorkbookSheets(workbook, sheets);
  download(workbook, `approval_${todayFileDate()}.xlsx`);
}
