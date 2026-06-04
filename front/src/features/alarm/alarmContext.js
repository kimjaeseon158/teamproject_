import { createContext, useContext } from "react";
import { useUser } from "../auth/userContext";

const AlarmContext = createContext(null);

export function AlarmProvider({ children }) {
  const { alarmCount, alarms, wsConnected } = useUser();
  return (
    <AlarmContext.Provider
      value={{
        alarms: Array.isArray(alarms) ? alarms : [],
        unreadCount:
          typeof alarmCount === "number" ? alarmCount : 0,
        wsConnected,
        markAsRead: () => {},
      }}
    >
      {children}
    </AlarmContext.Provider>
  );
}

export function useAlarm() {
  return useContext(AlarmContext);
}