import JSZip from "jszip";

import {
  addWorksheet,
  directChildren,
  downloadBlob,
  parseXml,
  removeCalculationChain,
  serializeXml,
  setFormulaCell,
  setNumberCell,
  setTextCell,
} from "./preservedFinanceExcel";

const TEMPLATE_BASE = `${process.env.PUBLIC_URL || ""}/templates`;
const SPREADSHEET_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";

const columnNumber = (letters) =>
  [...letters].reduce((value, letter) => value * 26 + letter.charCodeAt(0) - 64, 0);

const columnLetters = (value) => {
  let number = value;
  let result = "";
  while (number > 0) {
    number -= 1;
    result = String.fromCharCode(65 + (number % 26)) + result;
    number = Math.floor(number / 26);
  }
  return result;
};

const translateFormula = (formula, columnOffset, rowOffset = 0) =>
  String(formula || "").replace(/(\$?)([A-Z]{1,3})(\$?)(\d+)/g, (
    match,
    absoluteColumn,
    letters,
    absoluteRow,
    row
  ) => {
    const translatedColumn = absoluteColumn ? letters : columnLetters(columnNumber(letters) + columnOffset);
    const translatedRow = absoluteRow ? row : String(Number(row) + rowOffset);
    return `${absoluteColumn}${translatedColumn}${absoluteRow}${translatedRow}`;
  });

const expandSharedFormulas = (document) => {
  const cells = [...document.getElementsByTagNameNS(SPREADSHEET_NS, "c")];
  const sharedFormulas = new Map();
  cells.forEach((cell) => {
    const formula = [...cell.children].find((child) => child.localName === "f");
    if (formula?.getAttribute("t") === "shared" && formula.textContent) {
      sharedFormulas.set(formula.getAttribute("si"), {
        address: cell.getAttribute("r"),
        formula: formula.textContent,
      });
    }
  });

  cells.forEach((cell) => {
    const formula = [...cell.children].find((child) => child.localName === "f");
    if (formula?.getAttribute("t") !== "shared") return;
    if (!formula.textContent) {
      const base = sharedFormulas.get(formula.getAttribute("si"));
      const baseAddress = base?.address?.match(/^([A-Z]+)(\d+)$/);
      const cellAddress = cell.getAttribute("r")?.match(/^([A-Z]+)(\d+)$/);
      if (base && baseAddress && cellAddress) {
        formula.textContent = translateFormula(
          base.formula,
          columnNumber(cellAddress[1]) - columnNumber(baseAddress[1]),
          Number(cellAddress[2]) - Number(baseAddress[2])
        );
      }
    }
    formula.removeAttribute("t");
    formula.removeAttribute("si");
    formula.removeAttribute("ref");
  });
};

const rebuildPayColumns = (document, repeatCount, widthOverrides = {}) => {
  const columns = document.getElementsByTagNameNS(SPREADSHEET_NS, "cols")[0];
  if (!columns) return;
  const definitions = [...columns.children];
  const definitionFor = (columnNumberValue) => definitions.find((column) =>
    Number(column.getAttribute("min")) <= columnNumberValue &&
    Number(column.getAttribute("max")) >= columnNumberValue
  );
  const lastDynamicColumn = 18 + repeatCount * 5;
  const sourceFor = (columnNumberValue) => {
    if (columnNumberValue <= 18) return columnNumberValue;
    const position = (columnNumberValue - 19) % 5;
    return position === 0 ? 14 : 14 + position;
  };

  while (columns.firstChild) columns.removeChild(columns.firstChild);
  for (let columnNumberValue = 1; columnNumberValue <= lastDynamicColumn; columnNumberValue += 1) {
    const source = definitionFor(sourceFor(columnNumberValue));
    if (!source) continue;
    const clone = source.cloneNode(true);
    clone.setAttribute("min", String(columnNumberValue));
    clone.setAttribute("max", String(columnNumberValue));
    if (widthOverrides[columnNumberValue] != null) {
      clone.setAttribute("width", String(widthOverrides[columnNumberValue]));
      clone.setAttribute("customWidth", "1");
      clone.removeAttribute("bestFit");
    }
    columns.appendChild(clone);
  }
  const trailingSource = definitionFor(Math.max(23, lastDynamicColumn + 1));
  if (trailingSource && lastDynamicColumn < 16384) {
    const trailing = trailingSource.cloneNode(true);
    trailing.setAttribute("min", String(lastDynamicColumn + 1));
    trailing.setAttribute("max", "16384");
    columns.appendChild(trailing);
  }
};

const clonePayBlocks = (document, repeatCount, widthOverrides) => {
  const sheetData = document.getElementsByTagNameNS(SPREADSHEET_NS, "sheetData")[0];
  const sourceStart = 15;
  const sourceEnd = 18;
  const sharedFormulas = new Map();
  [...sheetData.getElementsByTagNameNS(SPREADSHEET_NS, "c")].forEach((cell) => {
    const formula = [...cell.children].find((child) => child.localName === "f");
    if (formula?.getAttribute("t") === "shared" && formula.textContent) {
      sharedFormulas.set(formula.getAttribute("si"), {
        address: cell.getAttribute("r"),
        formula: formula.textContent,
      });
    }
  });

  for (let repeat = 0; repeat < repeatCount; repeat += 1) {
    const targetStart = 20 + repeat * 5;
    const offset = targetStart - sourceStart;
    [...sheetData.children].forEach((row) => {
      const rowNumber = Number(row.getAttribute("r"));
      if (rowNumber < 11 || rowNumber > 25) return;
      const sourceCells = [...row.children].filter((cell) => {
        const letters = cell.getAttribute("r")?.match(/^[A-Z]+/)?.[0];
        const number = letters ? columnNumber(letters) : 0;
        return number >= sourceStart && number <= sourceEnd;
      });
      sourceCells.forEach((sourceCell) => {
        const clone = sourceCell.cloneNode(true);
        const sourceAddress = sourceCell.getAttribute("r");
        const match = sourceAddress.match(/^([A-Z]+)(\d+)$/);
        clone.setAttribute("r", `${columnLetters(columnNumber(match[1]) + offset)}${match[2]}`);
        const formula = [...clone.children].find((child) => child.localName === "f");
        if (formula) {
          let formulaText = formula.textContent;
          if (!formulaText && formula.getAttribute("t") === "shared") {
            const base = sharedFormulas.get(formula.getAttribute("si"));
            const baseAddress = base?.address?.match(/^([A-Z]+)(\d+)$/);
            if (base && baseAddress) {
              formulaText = translateFormula(
                base.formula,
                columnNumber(match[1]) - columnNumber(baseAddress[1]),
                Number(match[2]) - Number(baseAddress[2])
              );
            }
          }
          formula.removeAttribute("t");
          formula.removeAttribute("si");
          formula.removeAttribute("ref");
          formula.textContent = translateFormula(formulaText, offset);
        }
        row.appendChild(clone);
      });
    });

  }
  if (repeatCount || widthOverrides) rebuildPayColumns(document, repeatCount, widthOverrides);
};

const uniqueSheetName = (requestedName, usedNames) => {
  const base = String(requestedName || "Sheet").replace(/[\\/?*[\]:]/g, "_").slice(0, 31) || "Sheet";
  if (!usedNames.has(base)) {
    usedNames.add(base);
    return base;
  }
  for (let index = 2; index < 1000; index += 1) {
    const suffix = `_${index}`;
    const candidate = `${base.slice(0, 31 - suffix.length)}${suffix}`;
    if (!usedNames.has(candidate)) {
      usedNames.add(candidate);
      return candidate;
    }
  }
  throw new Error("엑셀 시트 이름을 만들지 못했습니다.");
};

const applyCells = (sourceXml, cells, dimensionRef, repeatPayBlocks = 0, columnWidths) => {
  const document = parseXml(sourceXml);
  expandSharedFormulas(document);
  clonePayBlocks(document, repeatPayBlocks, columnWidths);
  cells.forEach(({ address, type = "text", value }) => {
    if (type === "number") setNumberCell(document, address, value);
    else if (type === "formula") setFormulaCell(document, address, value);
    else setTextCell(document, address, value);
  });
  if (dimensionRef) {
    const dimension = document.getElementsByTagNameNS(SPREADSHEET_NS, "dimension")[0];
    dimension?.setAttribute("ref", dimensionRef);
  }
  return serializeXml(document);
};

const removeExternalLinks = (zip, workbookDocument, relationshipsDocument, contentTypesDocument) => {
  Object.keys(zip.files)
    .filter((path) => path.startsWith("xl/externalLinks/"))
    .forEach((path) => zip.remove(path));

  directChildren(workbookDocument.documentElement, "externalReferences")
    .forEach((node) => node.remove());
  directChildren(workbookDocument.documentElement, "definedNames")
    .forEach((node) => node.remove());
  directChildren(relationshipsDocument.documentElement, "Relationship")
    .filter((node) => node.getAttribute("Type")?.endsWith("/externalLink"))
    .forEach((node) => node.remove());
  directChildren(contentTypesDocument.documentElement, "Override")
    .filter((node) => node.getAttribute("PartName")?.startsWith("/xl/externalLinks/"))
    .forEach((node) => node.remove());
};

export async function buildPreservedTemplateWorkbook({
  dimensionRef,
  removeLinks = false,
  sheets,
  templateName,
}) {
  const response = await fetch(`${TEMPLATE_BASE}/${templateName}`);
  if (!response.ok) throw new Error("엑셀 템플릿을 불러오지 못했습니다.");

  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  const [workbookXml, relationshipsXml, contentTypesXml, sourceWorksheetXml, worksheetRelationshipsXml] = await Promise.all([
    zip.file("xl/workbook.xml")?.async("string"),
    zip.file("xl/_rels/workbook.xml.rels")?.async("string"),
    zip.file("[Content_Types].xml")?.async("string"),
    zip.file("xl/worksheets/sheet1.xml")?.async("string"),
    zip.file("xl/worksheets/_rels/sheet1.xml.rels")?.async("string"),
  ]);
  if (!workbookXml || !relationshipsXml || !contentTypesXml || !sourceWorksheetXml) {
    throw new Error("엑셀 템플릿의 필수 구성이 없습니다.");
  }

  const workbookDocument = parseXml(workbookXml);
  const relationshipsDocument = parseXml(relationshipsXml);
  const contentTypesDocument = parseXml(contentTypesXml);
  removeCalculationChain(zip, workbookDocument, relationshipsDocument, contentTypesDocument);
  if (removeLinks) {
    removeExternalLinks(zip, workbookDocument, relationshipsDocument, contentTypesDocument);
  }

  const outputSheets = sheets.length ? sheets : [{ name: "Sheet1", cells: [] }];
  const usedSheetNames = new Set();
  outputSheets.forEach((sheet, pageIndex) => {
    const sheetName = uniqueSheetName(sheet.name, usedSheetNames);
    const worksheetXml = applyCells(
      sourceWorksheetXml,
      sheet.cells,
      sheet.dimensionRef || dimensionRef,
      sheet.repeatPayBlocks || 0,
      sheet.columnWidths
    );
    if (pageIndex === 0) {
      zip.file("xl/worksheets/sheet1.xml", worksheetXml);
      const firstSheet = workbookDocument.getElementsByTagNameNS(SPREADSHEET_NS, "sheet")[0];
      firstSheet?.setAttribute("name", sheetName);
      return;
    }
    addWorksheet({
      contentTypesDocument,
      pageIndex,
      relationshipsDocument,
      sheetName,
      workbookDocument,
      worksheetRelationshipsXml,
      worksheetXml,
      zip,
    });
  });

  zip.file("xl/workbook.xml", serializeXml(workbookDocument));
  zip.file("xl/_rels/workbook.xml.rels", serializeXml(relationshipsDocument));
  zip.file("[Content_Types].xml", serializeXml(contentTypesDocument));
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}

export async function exportPreservedTemplate(options) {
  const workbookBytes = await buildPreservedTemplateWorkbook(options);
  const blob = new Blob([workbookBytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(blob, options.fileName);
}
