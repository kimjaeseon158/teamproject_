import { formatPhoneNumber, formatResidentNumber, validateEmployeeForm } from "./format";

const normalizeText = (value) => String(value ?? "").trim();
const EXPECTED_HEADERS = ["번호", "이름", "주민등록번호", "통신사", "전화번호", "주소", "아이디"];

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

    if (invalidFields.size) {
      messages.unshift(`${[...invalidFields].join(", ")} 기준이 잘못되었습니다.`);
    }

    if (messages.length) {
      errors.push(`${employeeNumber}번${employee.user_name ? ` (${employee.user_name})` : ""} : ${[...new Set(messages)].join(" ")}`);
    }
    employees.push(employee);
    employeeNumbers.push(employeeNumber);
  }

  if (!employees.length) errors.push("등록할 직원 정보가 없습니다.");
  return { employees, employeeNumbers, errors };
}
