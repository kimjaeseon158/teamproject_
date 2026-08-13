import { useState, useRef, useCallback } from "react";

export function useResizableTable(initialcolumn_Widths, initialrow_Heights) {
  const [column_Widths, setcolumn_Widths] = useState(initialcolumn_Widths);
  const [row_Heights, setrow_Heights] = useState(initialrow_Heights);

  const resizing_Column = useRef(null);
  const resizing_Row = useRef(null);
  const start_X = useRef(0);
  const start_Y = useRef(0);
  const start_Width = useRef(0);
  const start_Height = useRef(0);

  // 열 너비 조절
  const onColumnMouseDown = useCallback((e, colKey) => {
    e.preventDefault();
    resizing_Column.current = colKey;
    start_X.current = e.clientX;
    start_Width.current = column_Widths[colKey];

    const onMouseMove = (eMove) => {
      const delta_X = eMove.clientX - start_X.current;
      const new_Width = Math.max(start_Width.current + delta_X, 50);
      setcolumn_Widths((prev) => ({
        ...prev,
        [resizing_Column.current]: new_Width,
      }));
    };

    const onMouseUp = () => {
      resizing_Column.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [column_Widths]);

  // 행 높이 조절
  const onRowMouseDown = useCallback((e, rowKey) => {
    e.preventDefault();
    resizing_Row.current = rowKey;
    start_Y.current = e.clientY;
    start_Height.current = row_Heights[rowKey] || 40;

    const onMouseMove = (eMove) => {
      const deltaY = eMove.clientY - start_Y.current;
      const newHeight = Math.max(start_Height.current + deltaY, 30);
      setrow_Heights((prev) => ({
        ...prev,
        [resizing_Row.current]: newHeight,
      }));
    };

    const onMouseUp = () => {
      resizing_Row.current = null;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [row_Heights]);

  // 열 너비 자동 조절 (더블 클릭)
  const handleColumnDoubleClick = useCallback((colKey, data) => {

    if (!Array.isArray(data) || data.length === 0) return;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");  
    context.font = "16px Arial";

    const texts = data.map((row) => String(row[colKey] ?? ""));
    texts.push(colKey);

    const max_Width = texts.reduce((max, text) => {
      const w = context.measureText(text).width;
      return w > max ? w : max;
    }, 0);

    const content_Width = Math.ceil(max_Width + 40);

    setcolumn_Widths((prev) => ({
      ...prev,
      [colKey]: content_Width,
    }));
  }, []);

  return {
    column_Widths,
    row_Heights,
    onColumnMouseDown,
    onRowMouseDown,
    handleColumnDoubleClick,
    setrow_Heights,
  };
}
