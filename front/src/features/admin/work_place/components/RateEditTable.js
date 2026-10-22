import { useEffect, useRef, useState } from "react";
import { Box, Grid } from "@chakra-ui/react";

import CommonTable from "../../../common/mytable";

const FIXED_PROPS = new Set(["position", "left", "right", "zIndex", "boxShadow"]);

const cleanProps = (props = {}) =>
  Object.fromEntries(Object.entries(props).filter(([key]) => !FIXED_PROPS.has(key)));

const cleanColumn = (column) => ({
  ...column,
  headerProps: cleanProps(column.headerProps),
  cellProps:
    typeof column.cellProps === "function"
      ? (row) => cleanProps(column.cellProps(row))
      : cleanProps(column.cellProps),
});

const compactColumn = (column) => ({
  ...cleanColumn(column),
  headerProps: { ...cleanProps(column.headerProps), px: 0, textAlign: "center" },
  cellProps:
    typeof column.cellProps === "function"
      ? (row) => ({ ...cleanProps(column.cellProps(row)), px: 0, textAlign: "center" })
      : { ...cleanProps(column.cellProps), px: 0, textAlign: "center" },
});

const tableSizing = {
  tableLayout: "fixed",
  sx: {
    "thead tr": { height: "60px" },
    "tbody tr": { height: "64px" },
    "th, td": { py: 0 },
  },
};

const pane = { p: 0, borderRadius: 0, boxShadow: "none" };

export default function RateEditTable({ columns, data, checkedItems, onCheck }) {
  const rateScrollRef = useRef(null);
  const tableScrollRef = useRef(null);
  const [scrollContentWidth, setScrollContentWidth] = useState("100%");

  const leftColumns = columns.filter((column) => column.key === "work_place").map(cleanColumn);
  const rateColumns = columns
    .filter((column) =>
      ![
        "work_place",
        "effective_start_date",
        "effective_end_date",
        "manage",
      ].includes(column.key)
    )
    .map(cleanColumn);
  const rightColumns = columns
    .filter((column) =>
      ["effective_start_date", "effective_end_date", "manage"].includes(column.key)
    )
    .map(compactColumn);
  const hasManageColumn = rightColumns.some((column) => column.key === "manage");
  const disabledRowIds = new Set(
    data.filter((row) => row.isPlaceholder).map((row) => row.rate_uuid)
  );
  const rightPaneWidth = hasManageColumn
    ? { base: "230px", xl: "350px" }
    : { base: "160px", xl: "260px" };

  useEffect(() => {
    const rateScroller = rateScrollRef.current;
    const tableScroller = tableScrollRef.current;
    if (!rateScroller || !tableScroller) return undefined;

    const updateScrollWidth = () => {
      const overflowWidth = Math.max(0, rateScroller.scrollWidth - rateScroller.clientWidth);
      setScrollContentWidth(`${tableScroller.clientWidth + overflowWidth}px`);
    };

    updateScrollWidth();
    const observer = new ResizeObserver(updateScrollWidth);
    observer.observe(rateScroller);
    observer.observe(tableScroller);
    return () => observer.disconnect();
  }, [rateColumns.length, data.length]);

  const syncFromRates = (event) => {
    if (tableScrollRef.current) tableScrollRef.current.scrollLeft = event.currentTarget.scrollLeft;
  };

  const syncFromTable = (event) => {
    if (rateScrollRef.current) rateScrollRef.current.scrollLeft = event.currentTarget.scrollLeft;
  };

  return (
    <Grid
      templateColumns={{
        base: `200px minmax(180px, 1fr) ${rightPaneWidth.base}`,
        xl: `312px minmax(240px, 1fr) ${rightPaneWidth.xl}`,
      }}
      minW="610px"
      bg="white"
    >
      <Box bg="white" overflow="hidden">
        <CommonTable
          columns={leftColumns}
          data={data}
          rowKey="rate_uuid"
          selectable
          selectionWidth={{ base: "50px", xl: "72px" }}
          checkedItems={checkedItems}
          disabledRowIds={disabledRowIds}
          onCheck={onCheck}
          tableProps={{ ...tableSizing, w: { base: "200px", xl: "312px" } }}
          containerProps={{ ...pane, overflow: "hidden" }}
        />
      </Box>

      <Box minW={0} overflow="hidden">
        <CommonTable
          columns={rateColumns}
          data={data}
          rowKey="rate_uuid"
          containerRef={rateScrollRef}
          tableProps={{ ...tableSizing, w: { base: "640px", xl: "1536px" } }}
          containerProps={{
            ...pane,
            w: "100%",
            maxW: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            overscrollBehaviorX: "contain",
            onScroll: syncFromRates,
            scrollbarWidth: "none",
            sx: {
              "&::-webkit-scrollbar": { display: "none" },
            },
          }}
        />
      </Box>

      <Box bg="white" overflow="hidden">
        <CommonTable
          columns={rightColumns}
          data={data}
          rowKey="rate_uuid"
          tableProps={{ ...tableSizing, w: rightPaneWidth }}
          containerProps={{ ...pane, overflow: "hidden" }}
        />
      </Box>

      <Box
        ref={tableScrollRef}
        gridColumn="1 / -1"
        h="10px"
        overflowX="scroll"
        overflowY="hidden"
        overscrollBehaviorX="contain"
        onScroll={syncFromTable}
        bg="gray.100"
        sx={{
          "&::-webkit-scrollbar": { height: "10px" },
          "&::-webkit-scrollbar-track": { background: "#EDF2F7" },
          "&::-webkit-scrollbar-thumb": { background: "#A0AEC0", borderRadius: "999px" },
        }}
      >
        <Box w={scrollContentWidth} h="1px" />
      </Box>
    </Grid>
  );
}
