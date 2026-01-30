import { createContext, useContext, useState } from "react";
import { useNotifySocket } from "../ws/useNotifySocket";
import { useUser } from "../login/js/userContext";
import { getAccessToken } from "../api/token";

const AlarmContext = createContext(null);

export function AlarmProvider({ children }) {
  const [alarms, setAlarms] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { loading, userUuid } = useUser();
  const token = getAccessToken();

  useNotifySocket({
    token: !loading && token && userUuid ? token : null,
    uuid: userUuid,
    onMessage: (data) => {
      console.log("📩 WS DATA:", data.count);

      // ✅ 서버에서 count만 주는 경우
      if (typeof data.count === "number") {
        setUnreadCount(data.count);
      }

      // (선택) 알람 상세도 같이 오는 경우
      if (data.type === "ALARM") {
        setAlarms((prev) => [
          {
            id: data.id,
            title: data.title,
            date: data.date,
            time: data.time,
            read: false,
          },
          ...prev,
        ]);
      }
    },
  });

  return (
    <AlarmContext.Provider
        value={{
            alarms,
            unreadCount,      // 🔥 이름 맞춤
            setUnreadCount,
        }}
        >
      {children}
    </AlarmContext.Provider>
  );
}

export function useAlarm() {
  return useContext(AlarmContext);
}
