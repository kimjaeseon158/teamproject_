import JSZip from "jszip";

const TEMPLATE_BASE = `${process.env.PUBLIC_URL || ""}/templates`;
const OFFICE_REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const PACKAGE_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const SPREADSHEET_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const CONTENT_TYPE_NS = "http://schemas.openxmlformats.org/package/2006/content-types";
const WORKSHEET_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml";
const WORKSHEET_REL_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet";
const TARGET_ROWS = [3, 4, 5, 6, 7, 9, 10, 11, 12, 13];

export const parseXml = (xml) => {
  const document = new DOMParser().parseFromString(xml, "application/xml");
  if (document.querySelector("parsererror")) {
    throw new Error("엑셀 템플릿 XML을 읽지 못했습니다.");
  }
  return document;
};

export const serializeXml = (document) =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${new XMLSerializer().serializeToString(document.documentElement)}`;

export const directChildren = (element, localName) =>
  [...element.children].filter((child) => child.localName === localName);

const removeCellValue = (cell) => {
  [...cell.children].forEach((child) => {
    if (["f", "v", "is"].includes(child.localName)) cell.removeChild(child);
  });
};

export const ensureCell = (document, address) => {
  const rowNumber = Number(address.match(/\d+/)?.[0]);
  const sheetData = document.getElementsByTagNameNS(SPREADSHEET_NS, "sheetData")[0];
  let row = [...sheetData.children].find(
    (candidate) => candidate.localName === "row" && Number(candidate.getAttribute("r")) === rowNumber
  );

  if (!row) {
    row = document.createElementNS(SPREADSHEET_NS, "row");
    row.setAttribute("r", String(rowNumber));
    const nextRow = [...sheetData.children].find(
      (candidate) => Number(candidate.getAttribute("r")) > rowNumber
    );
    sheetData.insertBefore(row, nextRow || null);
  }

  let cell = [...row.children].find(
    (candidate) => candidate.localName === "c" && candidate.getAttribute("r") === address
  );
  if (!cell) {
    cell = document.createElementNS(SPREADSHEET_NS, "c");
    cell.setAttribute("r", address);
    row.appendChild(cell);
  }
  return cell;
};

export const setTextCell = (document, address, value) => {
  const cell = ensureCell(document, address);
  removeCellValue(cell);
  if (value === "" || value == null) {
    cell.removeAttribute("t");
    return;
  }

  cell.setAttribute("t", "inlineStr");
  const inlineString = document.createElementNS(SPREADSHEET_NS, "is");
  const text = document.createElementNS(SPREADSHEET_NS, "t");
  text.textContent = String(value);
  inlineString.appendChild(text);
  cell.appendChild(inlineString);
};

export const setNumberCell = (document, address, value) => {
  const cell = ensureCell(document, address);
  removeCellValue(cell);
  if (value === "" || value == null || !Number.isFinite(Number(value))) {
    cell.removeAttribute("t");
    return;
  }

  cell.setAttribute("t", "n");
  const number = document.createElementNS(SPREADSHEET_NS, "v");
  number.textContent = String(Number(value));
  cell.appendChild(number);
};

export const setFormulaCell = (document, address, formula) => {
  const cell = ensureCell(document, address);
  removeCellValue(cell);
  cell.removeAttribute("t");
  const formulaNode = document.createElementNS(SPREADSHEET_NS, "f");
  formulaNode.textContent = String(formula || "").replace(/^=/, "");
  cell.appendChild(formulaNode);
};

const excelDateSerial = (value) => {
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(1899, 11, 30)) / 86400000);
};

const setDateCell = (document, address, value) => {
  const serial = excelDateSerial(value);
  if (serial == null) setTextCell(document, address, value || "");
  else setNumberCell(document, address, serial);
};

const fillFinanceSheet = (sourceXml, rows, page, income) => {
  const document = parseXml(sourceXml);
  TARGET_ROWS.forEach((rowNumber, index) => {
    const item = rows[index];
    setNumberCell(document, `B${rowNumber}`, item ? page * TARGET_ROWS.length + index + 1 : "");
    setDateCell(document, `C${rowNumber}`, item?.date || "");
    setTextCell(document, `D${rowNumber}`, item?.name || "");
    setTextCell(document, `E${rowNumber}`, item?.detail || "");
    setNumberCell(document, `F${rowNumber}`, item ? Number(item.amount || 0) : "");
    setTextCell(document, `G${rowNumber}`, item ? (income ? item.note || "" : item.paymentMethod || "") : "");
  });
  return serializeXml(document);
};

export const removeCalculationChain = (zip, workbookDocument, relationshipsDocument, contentTypesDocument) => {
  zip.remove("xl/calcChain.xml");
  directChildren(relationshipsDocument.documentElement, "Relationship")
    .filter((relationship) => relationship.getAttribute("Type")?.endsWith("/calcChain"))
    .forEach((relationship) => relationship.remove());
  directChildren(contentTypesDocument.documentElement, "Override")
    .filter((override) => override.getAttribute("PartName") === "/xl/calcChain.xml")
    .forEach((override) => override.remove());

  let calcProperties = workbookDocument.getElementsByTagNameNS(SPREADSHEET_NS, "calcPr")[0];
  if (!calcProperties) {
    calcProperties = workbookDocument.createElementNS(SPREADSHEET_NS, "calcPr");
    workbookDocument.documentElement.appendChild(calcProperties);
  }
  calcProperties.setAttribute("calcMode", "auto");
  calcProperties.setAttribute("fullCalcOnLoad", "1");
  calcProperties.setAttribute("forceFullCalc", "1");
};

const nextRelationshipId = (relationshipsDocument) => {
  const used = directChildren(relationshipsDocument.documentElement, "Relationship")
    .map((relationship) => Number(relationship.getAttribute("Id")?.replace(/^rId/, "")))
    .filter(Number.isFinite);
  return `rId${Math.max(0, ...used) + 1}`;
};

export const addWorksheet = ({
  contentTypesDocument,
  pageIndex,
  relationshipsDocument,
  sheetName,
  workbookDocument,
  worksheetRelationshipsXml,
  worksheetXml,
  zip,
}) => {
  const worksheetNumber = pageIndex + 1;
  const worksheetPath = `xl/worksheets/sheet${worksheetNumber}.xml`;
  const relationshipId = nextRelationshipId(relationshipsDocument);
  const relationship = relationshipsDocument.createElementNS(PACKAGE_REL_NS, "Relationship");
  relationship.setAttribute("Id", relationshipId);
  relationship.setAttribute("Type", WORKSHEET_REL_TYPE);
  relationship.setAttribute("Target", `worksheets/sheet${worksheetNumber}.xml`);
  relationshipsDocument.documentElement.appendChild(relationship);

  const sheets = workbookDocument.getElementsByTagNameNS(SPREADSHEET_NS, "sheets")[0];
  const existingIds = [...sheets.children]
    .map((sheet) => Number(sheet.getAttribute("sheetId")))
    .filter(Number.isFinite);
  const sheet = workbookDocument.createElementNS(SPREADSHEET_NS, "sheet");
  sheet.setAttribute("name", sheetName);
  sheet.setAttribute("sheetId", String(Math.max(0, ...existingIds) + 1));
  sheet.setAttributeNS(OFFICE_REL_NS, "r:id", relationshipId);
  sheets.appendChild(sheet);

  const override = contentTypesDocument.createElementNS(CONTENT_TYPE_NS, "Override");
  override.setAttribute("PartName", `/${worksheetPath}`);
  override.setAttribute("ContentType", WORKSHEET_CONTENT_TYPE);
  contentTypesDocument.documentElement.appendChild(override);
  zip.file(worksheetPath, worksheetXml);
  if (worksheetRelationshipsXml) {
    zip.file(`xl/worksheets/_rels/sheet${worksheetNumber}.xml.rels`, worksheetRelationshipsXml);
  }
};

const sortRowsByDate = (rows = []) =>
  rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const aTime = new Date(a.row?.date).getTime();
      const bTime = new Date(b.row?.date).getTime();
      if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) return aTime - bTime;
      if (Number.isFinite(aTime) !== Number.isFinite(bTime)) return Number.isFinite(aTime) ? -1 : 1;
      return a.index - b.index;
    })
    .map(({ row }) => row);

export const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export async function buildPreservedFinanceWorkbook({ type, rows }) {
  const income = type === "income";
  const templateName = income ? "income_template.xlsx" : "expense_template.xlsx";
  const response = await fetch(`${TEMPLATE_BASE}/${templateName}`);
  if (!response.ok) throw new Error("엑셀 템플릿을 불러오지 못했습니다.");

  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  const [workbookXml, relationshipsXml, contentTypesXml, originalWorksheetXml, worksheetRelationshipsXml] = await Promise.all([
    zip.file("xl/workbook.xml")?.async("string"),
    zip.file("xl/_rels/workbook.xml.rels")?.async("string"),
    zip.file("[Content_Types].xml")?.async("string"),
    zip.file("xl/worksheets/sheet1.xml")?.async("string"),
    zip.file("xl/worksheets/_rels/sheet1.xml.rels")?.async("string"),
  ]);
  if (!workbookXml || !relationshipsXml || !contentTypesXml || !originalWorksheetXml) {
    throw new Error("엑셀 템플릿의 필수 구성이 없습니다.");
  }

  const workbookDocument = parseXml(workbookXml);
  const relationshipsDocument = parseXml(relationshipsXml);
  const contentTypesDocument = parseXml(contentTypesXml);
  const sourceRows = sortRowsByDate(Array.isArray(rows) ? rows : []);
  const pageCount = Math.max(1, Math.ceil(sourceRows.length / TARGET_ROWS.length));
  const baseSheetName = income ? "수입" : "지출";

  removeCalculationChain(zip, workbookDocument, relationshipsDocument, contentTypesDocument);
  for (let page = 0; page < pageCount; page += 1) {
    const pageRows = sourceRows.slice(page * TARGET_ROWS.length, (page + 1) * TARGET_ROWS.length);
    const worksheetXml = fillFinanceSheet(originalWorksheetXml, pageRows, page, income);
    if (page === 0) zip.file("xl/worksheets/sheet1.xml", worksheetXml);
    else {
      addWorksheet({
        contentTypesDocument,
        pageIndex: page,
        relationshipsDocument,
        sheetName: `${baseSheetName}${page + 1}`,
        workbookDocument,
        worksheetRelationshipsXml,
        worksheetXml,
        zip,
      });
    }
  }

  zip.file("xl/workbook.xml", serializeXml(workbookDocument));
  zip.file("xl/_rels/workbook.xml.rels", serializeXml(relationshipsDocument));
  zip.file("[Content_Types].xml", serializeXml(contentTypesDocument));

  return zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
  });
}

export async function exportPreservedFinanceTemplate({ type, rows, startMonth, endMonth }) {
  const workbookBytes = await buildPreservedFinanceWorkbook({ type, rows });
  const blob = new Blob([workbookBytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const period = startMonth === endMonth ? startMonth : `${startMonth}_${endMonth}`;
  downloadBlob(blob, `${type}_${period}.xlsx`);
}
