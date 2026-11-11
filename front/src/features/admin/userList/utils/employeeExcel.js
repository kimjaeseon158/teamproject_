import { formatPhoneNumber, formatResidentNumber, validateEmployeeForm } from "./format";

const normalizeText = (value) => String(value ?? "").trim();
const EXPECTED_HEADERS = ["번호", "이름", "주민등록번호", "통신사", "전화번호", "주소", "아이디"];

const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "");
const MAX_BULK_EMPLOYEES = 100;

const joinAddress = (employee) =>
  [employee?.address, employee?.address_detail]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");

const TEMPLATE_VERSION = "20261111-user-layout-v3";
const TEMPLATE_PATH = `${process.env.PUBLIC_URL || ""}/templates/employee_registration.xlsx?v=${TEMPLATE_VERSION}`;

const clearCellValue = (cell) => {
  if (!cell) return;
  delete cell.v;
  delete cell.w;
  delete cell.f;
  delete cell.t;
};

export async function downloadEmployeeExcel(employees) {
  if (!window.XLSX) throw new Error("엑셀 처리 모듈을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.");

  const templateResponse = await fetch(TEMPLATE_PATH, { cache: "no-store" });
  if (!templateResponse.ok) throw new Error("직원등록 엑셀 템플릿을 불러오지 못했습니다.");
  const workbook = window.XLSX.read(await templateResponse.arrayBuffer(), {
    type: "array",
    cellStyles: true,
  });
  const employeeSheet = workbook.Sheets["직원등록"];
  if (!employeeSheet) throw new Error("템플릿에서 '직원등록' 시트를 찾을 수 없습니다.");

  const rows = employees.map((employee, index) => [
    index + 1,
    normalizeText(employee?.user_name),
    digitsOnly(employee?.resident_number),
    normalizeCarrier(employee?.mobile_carrier),
    digitsOnly(employee?.phone_number),
    joinAddress(employee),
    normalizeText(employee?.user_id),
  ]);

  const originalRange = window.XLSX.utils.decode_range(employeeSheet["!ref"] || "A1:G2");
  const lastDataRow = Math.max(originalRange.e.r, rows.length + 1);
  for (let row = 2; row <= lastDataRow; row += 1) {
    for (let column = 0; column < EXPECTED_HEADERS.length; column += 1) {
      const address = window.XLSX.utils.encode_cell({ r: row, c: column });
      if (!employeeSheet[address] && row <= rows.length + 1) {
        const styleSourceAddress = window.XLSX.utils.encode_cell({
          r: Math.min(originalRange.e.r - 1, 1000),
          c: column,
        });
        employeeSheet[address] = { ...(employeeSheet[styleSourceAddress] || {}) };
      }
      clearCellValue(employeeSheet[address]);
    }
  }

  rows.forEach((values, index) => {
    for (let column = 0; column < EXPECTED_HEADERS.length; column += 1) {
      const address = window.XLSX.utils.encode_cell({ r: index + 2, c: column });
      employeeSheet[address].v = values[column];
      employeeSheet[address].t = column === 0 ? "n" : "s";
      delete employeeSheet[address].w;
    }
  });
  employeeSheet["!ref"] = window.XLSX.utils.encode_range({
    s: originalRange.s,
    e: { r: Math.max(originalRange.e.r, rows.length + 1), c: Math.max(originalRange.e.c, 6) },
  });

  const today = new Date();
  const date = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("");
  window.XLSX.writeFile(workbook, `employee_list_${date}.xlsx`, {
    compression: true,
    cellStyles: true,
  });
}

const getDigits = (cell, length) => {
  const raw = String(cell?.v ?? "").replace(/\D/g, "");
  if (!raw) return "";
  if (cell?.t === "n" && raw.length < length) return raw.padStart(length, "0");
  return raw;
};

const normalizeCarrier = (value) => {
  const compact = normalizeText(value).replace(/\s/g, "").toUpperCase();
  if (compact === "SKT") return "SKT";
  if (compact === "KT") return "KT";
  if (["LGU+", "LGU", "LG"].includes(compact)) return "LG U+";
  if (["알뜰폰", "MVNO"].includes(compact)) return "알뜰폰";
  return normalizeText(value);
};

const cellAt = (sheet, row, column) =>
  sheet[window.XLSX.utils.encode_cell({ r: row, c: column })];

export async function parseEmployeeExcel(file) {
  if (!window.XLSX) throw new Error("엑셀 처리 모듈을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.");

  const workbook = window.XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.Sheets["직원등록"];
  if (!sheet) throw new Error("'직원등록' 시트를 찾을 수 없습니다.");

  const range = window.XLSX.utils.decode_range(sheet["!ref"] || "A1:G1");
  let headerRow = -1;
  for (let row = range.s.r; row <= Math.min(range.e.r, range.s.r + 10); row += 1) {
    const headers = EXPECTED_HEADERS.map((_, column) => normalizeText(cellAt(sheet, row, column)?.v));
    if (EXPECTED_HEADERS.every((header, index) => headers[index] === header)) {
      headerRow = row;
      break;
    }
  }
  if (headerRow < 0) {
    throw new Error("번호, 이름, 주민등록번호, 통신사, 전화번호, 주소, 아이디 헤더를 찾을 수 없습니다.");
  }

  const employees = [];
  const employeeNumbers = [];
  const errors = [];
  const allowedCarriers = new Set(["SKT", "KT", "LG U+", "알뜰폰"]);
  const phoneRows = new Map();
  const userIdRows = new Map();

  for (let row = headerRow + 1; row <= range.e.r; row += 1) {
    const cells = Array.from({ length: 7 }, (_, column) => cellAt(sheet, row, column));
    if (!cells.some((cell) => normalizeText(cell?.v))) continue;

    const residentDigits = getDigits(cells[2], 13);
    const phoneDigits = getDigits(cells[4], 11);
    const employee = {
      user_name: normalizeText(cells[1]?.v),
      resident_number: formatResidentNumber(residentDigits),
      mobile_carrier: normalizeCarrier(cells[3]?.v),
      phone_number: formatPhoneNumber(phoneDigits),
      address: normalizeText(cells[5]?.v),
      user_id: normalizeText(cells[6]?.v),
    };

    const employeeNumber = normalizeText(cells[0]?.v) || String(row - headerRow);
    const rowErrors = validateEmployeeForm(employee, { requireUserId: true });
    const invalidFields = new Set();
    const messages = [];
    Object.entries(rowErrors).forEach(([field, message]) => {
      if (field === "resident_number") invalidFields.add("주민등록번호");
      else if (field === "phone_number") invalidFields.add("전화번호");
      else messages.push(message);
    });

    if (residentDigits.length > 13) {
      invalidFields.add("주민등록번호");
    }
    if (phoneDigits.length > 11) {
      invalidFields.add("전화번호");
    }

    if (employee.mobile_carrier && !allowedCarriers.has(employee.mobile_carrier)) {
      invalidFields.add("통신사");
    }
    if (employee.user_name.length > 50) messages.push("이름은 50자 이하여야 합니다.");
    if (employee.user_id.length > 50) messages.push("아이디는 50자 이하여야 합니다.");

    if (invalidFields.size) {
      messages.unshift(`${[...invalidFields].join(", ")} 기준이 잘못되었습니다.`);
    }

    if (messages.length) {
      errors.push(`${employeeNumber}번${employee.user_name ? ` (${employee.user_name})` : ""} : ${[...new Set(messages)].join(" ")}`);
    }
    employees.push(employee);
    employeeNumbers.push(employeeNumber);

    if (phoneDigits.length === 11) {
      const rows = phoneRows.get(phoneDigits) || [];
      rows.push({ employeeNumber, residentDigits });
      phoneRows.set(phoneDigits, rows);
    }
    if (employee.user_id) {
      const rows = userIdRows.get(employee.user_id) || [];
      rows.push({ employeeNumber, residentDigits });
      userIdRows.set(employee.user_id, rows);
    }
  }

  if (!employees.length) errors.push("등록할 직원 정보가 없습니다.");
  if (employees.length > MAX_BULK_EMPLOYEES) {
    errors.push(`한 번에 최대 ${MAX_BULK_EMPLOYEES}명까지 등록할 수 있습니다. 파일을 나누어 주세요.`);
  }
  phoneRows.forEach((rows) => {
    const residents = new Set(rows.map(({ residentDigits }) => residentDigits));
    if (residents.size > 1) {
      errors.push(`${rows.map(({ employeeNumber }) => employeeNumber).join(", ")}번: 서로 다른 직원이 동일한 전화번호를 사용하고 있습니다.`);
    }
  });
  userIdRows.forEach((rows) => {
    const residents = new Set(rows.map(({ residentDigits }) => residentDigits));
    if (residents.size > 1) {
      errors.push(`${rows.map(({ employeeNumber }) => employeeNumber).join(", ")}번: 서로 다른 직원이 동일한 아이디를 사용하고 있습니다.`);
    }
  });
  return { employees, employeeNumbers, errors };
}

export function validateEmployeeImportAgainstExisting(employees, employeeNumbers, existingEmployees) {
  const employeesByResident = new Map();
  const employeesByPhone = new Map();
  const employeesByUserId = new Map();

  existingEmployees.forEach((employee) => {
    const residentNumber = digitsOnly(employee?.resident_number);
    const phoneNumber = digitsOnly(employee?.phone_number);
    const userId = normalizeText(employee?.user_id);
    if (residentNumber) employeesByResident.set(residentNumber, employee);
    if (phoneNumber) employeesByPhone.set(phoneNumber, employee);
    if (userId) employeesByUserId.set(userId, employee);
  });

  const errors = [];
  let createCount = 0;
  let updateCount = 0;
  let unchangedCount = 0;
  const unchangedIndexes = [];
  const actionableIndexes = [];
  const indexesByResident = new Map();

  employees.forEach((employee, index) => {
    const residentNumber = digitsOnly(employee?.resident_number);
    const indexes = indexesByResident.get(residentNumber) || [];
    indexes.push(index);
    indexesByResident.set(residentNumber, indexes);
  });

  const hasChanges = (employee, existing) =>
    normalizeText(employee?.user_name) !== normalizeText(existing?.user_name) ||
    normalizeText(employee?.user_id) !== normalizeText(existing?.user_id) ||
    digitsOnly(employee?.phone_number) !== digitsOnly(existing?.phone_number) ||
    normalizeCarrier(employee?.mobile_carrier) !== normalizeCarrier(existing?.mobile_carrier) ||
    normalizeText(employee?.address) !== normalizeText(existing?.address);

  indexesByResident.forEach((indexes, residentNumber) => {
    const existing = employeesByResident.get(residentNumber);
    if (!existing) {
      if (indexes.length > 1) {
        errors.push(`${indexes.map((index) => employeeNumbers[index]).join(", ")}번: 신규 직원의 주민등록번호가 중복되어 있습니다.`);
        return;
      }
      createCount += 1;
      actionableIndexes.push(indexes[0]);
      return;
    }

    const changedIndexes = indexes.filter((index) => hasChanges(employees[index], existing));
    if (changedIndexes.length > 1) {
      errors.push(`${changedIndexes.map((index) => employeeNumbers[index]).join(", ")}번: 같은 직원에 대한 서로 다른 수정 정보가 여러 개 있습니다.`);
      return;
    }

    if (changedIndexes.length === 1) {
      updateCount += 1;
      actionableIndexes.push(changedIndexes[0]);
      indexes.forEach((index) => {
        if (index !== changedIndexes[0]) unchangedIndexes.push(index);
      });
      unchangedCount += indexes.length - 1;
    } else {
      unchangedIndexes.push(...indexes);
      unchangedCount += indexes.length;
    }
  });

  actionableIndexes.forEach((index) => {
    const employee = employees[index];
    const residentNumber = digitsOnly(employee?.resident_number);
    const existingByPhone = employeesByPhone.get(digitsOnly(employee?.phone_number));
    const existingByUserId = employeesByUserId.get(normalizeText(employee?.user_id));
    const phoneOwnerResident = digitsOnly(existingByPhone?.resident_number);
    const userIdOwnerResident = digitsOnly(existingByUserId?.resident_number);

    if (existingByPhone && phoneOwnerResident !== residentNumber) {
      errors.push(`${employeeNumbers[index]}번${employee?.user_name ? ` (${employee.user_name})` : ""}: 전화번호가 다른 직원에게 이미 등록되어 있습니다.`);
    }
    if (existingByUserId && userIdOwnerResident !== residentNumber) {
      errors.push(`${employeeNumbers[index]}번${employee?.user_name ? ` (${employee.user_name})` : ""}: 아이디가 다른 직원에게 이미 등록되어 있습니다.`);
    }
  });

  return { errors, createCount, updateCount, unchangedCount, unchangedIndexes };
}
