import { useEffect, useMemo, useState } from "react";
import { useToast } from "@chakra-ui/react";

import { useAdminData } from "../../userList/hook/useAdminData";
import { useDailyPay } from "../../work_place/hook/useWorkList";
import { useTotalFinance } from "../../total_pay/hook/useTotalFinance";
import { login as googleLogin } from "../../api/google/googleAuth";
import useApproveCalendar from "./useApproveCalendar";
import useApproveSummary from "./useApproveSummary";
import useGoogleLinkStatus from "../../api/google/useGoogleLinkStatus";
import useOverviewWorkPlaces from "./useOverviewWorkPlaces";
import {
  DEFAULT_OVERVIEW_WIDGETS,
  OVERVIEW_STORAGE_KEY,
  OVERVIEW_WIDGET_LABELS,
} from "../constants/overviewWidgets";
import { average, formatMonth, formatNumber } from "../utils/overviewFormat";

const loadWidgets = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(OVERVIEW_STORAGE_KEY));
    return { ...DEFAULT_OVERVIEW_WIDGETS, ...(saved || {}) };
  } catch {
    return DEFAULT_OVERVIEW_WIDGETS;
  }
};

export default function useOverviewPage() {
  const toast = useToast();
  const [widgets, setWidgets] = useState(loadWidgets);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [peopleData, setPeopleData] = useState([]);

  const googleStatus = useGoogleLinkStatus();
  const adminWorkPlaces = useOverviewWorkPlaces(toast);
  const { events, loading: approvalLoading, rawData: pendingList } =
    useApproveCalendar(currentDate, toast);
  const approvalSummary = useApproveSummary(pendingList);
  const {
    data: dailyPayData,
    loading: dailyPayLoading,
    fetchDailyPay,
  } = useDailyPay();
  const { setApiMonth, threeMonthData } = useTotalFinance({ toast });

  useAdminData(setPeopleData);

  useEffect(() => {
    fetchDailyPay({}, toast);
  }, [fetchDailyPay, toast]);

  useEffect(() => {
    setApiMonth(formatMonth(currentDate));
  }, [currentDate, setApiMonth]);

  useEffect(() => {
    localStorage.setItem(OVERVIEW_STORAGE_KEY, JSON.stringify(widgets));
  }, [widgets]);

  const dailyPaySummary = useMemo(() => {
    const basePays = [];

    dailyPayData.forEach((user) => {
      user.rates?.forEach((rate) => {
        if (rate.base_hourly_wage != null) basePays.push(rate.base_hourly_wage);
      });
    });

    return {
      users: dailyPayData.length,
      places: adminWorkPlaces.length,
      averageBasePay: average(basePays),
    };
  }, [adminWorkPlaces.length, dailyPayData]);

  const financeTotal = useMemo(
    () => threeMonthData.reduce((sum, item) => sum + Number(item.total || 0), 0),
    [threeMonthData]
  );

  const currentMonthPay = useMemo(() => {
    const currentMonth = formatMonth(currentDate);
    return (
      threeMonthData.find((item) => item.key === currentMonth)?.total ??
      threeMonthData[threeMonthData.length - 1]?.total ??
      0
    );
  }, [currentDate, threeMonthData]);

  const pendingPreview = useMemo(() => pendingList.slice(0, 5), [pendingList]);

  const kpis = useMemo(
    () => [
      {
        label: "전체 직원(명)",
        value: formatNumber(peopleData.length),
        color: "blue.400",
        path: "/dashboard/admin",
      },
      {
        label: "승인 대기(건)",
        value: formatNumber(approvalSummary.total),
        color: "orange.400",
        path: "/dashboard/approval",
      },
      {
        label: "오늘 근무(건)",
        value: formatNumber(events.length),
        color: "green.400",
        path: "/dashboard/approval",
      },
      {
        label: "근무지",
        value: formatNumber(dailyPaySummary.places),
        color: "teal.400",
        path: "/dashboard/daily-pay",
      },
      {
        label: "평균 주간(원)",
        value: formatNumber(dailyPaySummary.averageBasePay),
        color: "purple.400",
        path: "/dashboard/daily-pay",
      },
      {
        label: `${currentDate.getMonth() + 1}월 지급액`,
        value: formatNumber(currentMonthPay),
        color: "red.400",
        path: "/dashboard/total-sales",
      },
    ],
    [
      approvalSummary.total,
      currentDate,
      currentMonthPay,
      dailyPaySummary.averageBasePay,
      dailyPaySummary.places,
      events.length,
      peopleData.length,
    ]
  );

  const hiddenWidgets = useMemo(
    () => Object.entries(OVERVIEW_WIDGET_LABELS).filter(([key]) => !widgets[key]),
    [widgets]
  );

  const rightPanelRows = useMemo(() => {
    const rowTemplates = [
      widgets.approvalQueue ? "1fr" : null,
      widgets.finance ? "1.45fr" : null,
      widgets.employeeSnapshot ? "0.55fr" : null,
    ].filter(Boolean);

    const count = rowTemplates.length || 1;
    return rowTemplates.join(" ") || `repeat(${count}, minmax(0, 1fr))`;
  }, [widgets]);

  const handleMonthChange = (ym) => {
    const [year, month] = ym.split("-").map(Number);
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const moveMonth = (amount) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + amount, 1)
    );
  };

  const showWidget = (key) => {
    setWidgets((prev) => ({ ...prev, [key]: true }));
  };

  const hideWidget = (key) => {
    setWidgets((prev) => ({ ...prev, [key]: false }));
  };

  const refresh = () => {
    fetchDailyPay({}, toast);
    setCurrentDate((prev) => new Date(prev));
  };

  const handleGoogleLogin = () => {
    googleLogin();
  };

  return {
    approvalLoading,
    approvalSummary,
    currentDate,
    dailyPayLoading,
    dailyPaySummary,
    events,
    financeTotal,
    googleStatus,
    handleGoogleLogin,
    handleMonthChange,
    hiddenWidgets,
    hideWidget,
    kpis,
    moveMonth,
    pendingPreview,
    refresh,
    rightPanelRows,
    showWidget,
    threeMonthData,
    widgets,
  };
}
