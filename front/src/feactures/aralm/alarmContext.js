import { createContext, useContext } from "react";
import { useUser } from "../auth/userContext";

const AlarmContext = createContext(null);

export function AlarmProvider({ children }) {
  const { alarmCount, alarms, wsConnected } = useUser();

  // 🔥 타입 안정성 보장
  const safeAlarms =
    wsConnected && Array.isArray(alarms) ? alarms : [];

  const unreadCount =
    wsConnected && typeof alarmCount === "number" ? alarmCount : 0;

  return (
    <AlarmContext.Provider
      value={{
        alarms: safeAlarms,
        unreadCount,
        wsConnected,
      }}
    >
      {children}
    </AlarmContext.Provider>
  );
}

export function useAlarm() {
  const ctx = useContext(AlarmContext);
  if (!ctx) {
    throw new Error("useAlarm must be used within AlarmProvider");
  }
  return ctx;
}
