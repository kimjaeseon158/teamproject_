import { useMemo } from "react";

import { EMPTY_PLACE } from "../constants/rateFields";
import { average, averageWithFallback } from "../utils/rateFormat";

export default function useRateEditSummary(tableData) {
  return useMemo(
    () => ({
      places: tableData.filter(
        (row) => row.work_place && row.work_place !== EMPTY_PLACE
      ).length,
      base: average(tableData.map((row) => row.base_hourly_wage)),
      daySpecial: averageWithFallback(
        tableData,
        "day_special_hourly_wage",
        "special_hourly_wage"
      ),
      nightSpecial: averageWithFallback(
        tableData,
        "night_special_hourly_wage",
        "special_hourly_wage"
      ),
    }),
    [tableData]
  );
}
