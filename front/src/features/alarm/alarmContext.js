import { createContext, useContext } from "react";
import { useUser } from "../auth/userContext";

const AlarmContext = createContext(null);

export function AlarmProvider({ children }) {
  const {
    alarms,
    combinedAlarmCount,
    noticeAlarms,
    noticeWsConnected,
    wsConnected,
    markNoticeAsRead,
  } = useUser();
  const mergedAlarms = [
    ...(Array.isArray(noticeAlarms) ? noticeAlarms : []),
    ...(Array.isArray(alarms) ? alarms : []),
  ];
  const markAsRead = (id) => {
    const target = mergedAlarms.find((alarm) => alarm.id === id);
    if (target?.type === "notice") {
      markNoticeAsRead?.(target.title);
    }
  };
  return (
    <AlarmContext.Provider
      value={{
        alarms: mergedAlarms,
        unreadCount: typeof combinedAlarmCount === "number" ? combinedAlarmCount : 0,
        wsConnected: wsConnected || noticeWsConnected,
        markAsRead,
      }}
    >
      {children}
    </AlarmContext.Provider>
  );
}

export function useAlarm() {
  return useContext(AlarmContext);
}
