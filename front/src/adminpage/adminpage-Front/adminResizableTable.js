import { useState, useRef, useCallback } from "react";

export function useResizableTable(initialColumnWidths, initialRowHeights) {
  const [columnWidths, setColumnWidths] = useState(initialColumnWidths);
  const [rowHeights, setRowHeights] = useState(initialRowHeights);

  const resizingCol = useRef(null);
  const resizingRow = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startWidth = useRef(0);
  const startHeight = useRef(0);

  // 열 너비 조절
  const onColumnMouseDown = useCallback((e, colKey) => {
    e.preventDefault();
    resizingCol.current = colKey;
    startX.current = e.clientX;
    startWidth.current = columnWidths[colKey];

    const onMouseMove = (eMove) => {
      const deltaX = eMove.clientX - startX.current;
      const newWidth = Math.max(startWidth.current + deltaX, 50);
      setColumnWidths((prev) => ({
        ...prev,
        [resizingCol.current]: newWidth,
      }));
    };

    const onMouseUp = () => {
      resizingCol.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [columnWidths]);

  // 행 높이 조절
  const onRowMouseDown = useCallback((e, rowKey) => {
    e.preventDefault();
    resizingRow.current = rowKey;
    startY.current = e.clientY;
    startHeight.current = rowHeights[rowKey] || 40;

    const onMouseMove = (eMove) => {
      const deltaY = eMove.clientY - startY.current;
      const newHeight = Math.max(startHeight.current + deltaY, 30);
      setRowHeights((prev) => ({
        ...prev,
        [resizingRow.current]: newHeight,
      }));
    };

    const onMouseUp = () => {
      resizingRow.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [rowHeights]);

  // 열 너비 자동 조절 (더블 클릭)
  const handleColumnDoubleClick = useCallback((colKey, data) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = "16px Arial";

    const texts = data.map((row) => String(row[colKey] ?? ""));
    texts.push(colKey);

    const maxWidth = texts.reduce((max, text) => {
      const w = context.measureText(text).width;
      return w > max ? w : max;
    }, 0);

    const adjustedWidth = Math.ceil(maxWidth + 40);

    setColumnWidths((prev) => ({
      ...prev,
      [colKey]: adjustedWidth,
    }));
  }, []);

  return {
    columnWidths,
    rowHeights,
    onColumnMouseDown,
    onRowMouseDown,
    handleColumnDoubleClick,
    setRowHeights,
  };
}
