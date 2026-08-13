import { useMemo } from "react";

import { userPlaceListColumns } from "../constants/dailyPayColumns";

export const formatWon = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toLocaleString()}원`;
};

const average = (arr) => {
  const valid = arr.filter((v) => v !== "" && v != null && !Number.isNaN(Number(v)));
  if (!valid.length) return null;

  return Math.round(
    valid.reduce((sum, value) => sum + Number(value), 0) / valid.length
  );
};

const averageRate = (rates, key) => average(rates.map((rate) => rate?.[key]));

const averageRateWithFallback = (rates, key, fallbackKey) =>
  average(rates.map((rate) => rate?.[key] ?? rate?.[fallbackKey]));

export default function useDailyPayDerivedData({
  adminWorkPlaces,
  data,
  workPlacesLoading,
}) {
  const mergedData = useMemo(() => {
    return data?.map((user) => {
      const rates = user.rates || [];
      const workPlaces = rates.map((rate) => rate.work_place).filter(Boolean);

      return {
        user_uuid: user.user_uuid,
        user_name: user.user_name,
        work_place: workPlaces.join(" / "),
        base_hourly_wage: averageRate(rates, "base_hourly_wage"),
        overtime_hourly_wage: averageRate(rates, "overtime_hourly_wage"),
        meal_ot_hourly_wage: averageRate(rates, "meal_ot_hourly_wage"),
        special_hourly_wage: averageRate(rates, "special_hourly_wage"),
        day_special_hourly_wage: averageRateWithFallback(
          rates,
          "day_special_hourly_wage",
          "special_hourly_wage"
        ),
        night_special_hourly_wage: averageRateWithFallback(
          rates,
          "night_special_hourly_wage",
          "special_hourly_wage"
        ),
        overnight_hourly_wage: averageRate(rates, "overnight_hourly_wage"),
        overnight_ot_hourly_wage: averageRate(rates, "overnight_ot_hourly_wage"),
        early_hourly_wage: averageRate(rates, "early_hourly_wage"),
      };
    }) || [];
  }, [data]);

  const summary = useMemo(() => {
    const places = new Set();
    data?.forEach((user) => {
      user.rates?.forEach((rate) => {
        if (rate.work_place) places.add(rate.work_place);
      });
    });

    return {
      users: mergedData.length,
      places: places.size,
      averageBasePay: average(mergedData.map((row) => row.base_hourly_wage)),
    };
  }, [data, mergedData]);

  const displayColumns = useMemo(() => (
    userPlaceListColumns.map((column) => ({
      ...column,
      render:
        column.key.includes("wage")
          ? (value) => formatWon(value)
          : column.render,
    }))
  ), []);

  const statCards = useMemo(() => ([
    { label: "등록 직원(명)", value: `${summary.users.toLocaleString()}` },
    {
      label: "근무지 수",
      value: workPlacesLoading
        ? "..."
        : `${adminWorkPlaces.length.toLocaleString()}`,
    },
    { label: "평균 기본일급", value: formatWon(summary.averageBasePay) },
  ]), [adminWorkPlaces.length, summary.averageBasePay, summary.users, workPlacesLoading]);

  return {
    displayColumns,
    mergedData,
    statCards,
    summary,
  };
}
