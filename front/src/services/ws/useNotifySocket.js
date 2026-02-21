import { useEffect, useRef, useState } from "react";

export function useNotifySocket({ token, uuid, loginType, onMessage }) {
  const wsRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const retryRef = useRef(0);
  const retryTimerRef = useRef(null);
  const messageSeqRef = useRef(0); // 🔥 여기

  const [connected, setConnected] = useState(false);

  // 최신 onMessage 유지
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!token || !uuid || !loginType) return;

    let closedByCleanup = false;

    const connect = () => {
      try {
        wsRef.current?.close(1000, "reconnect");
      } catch {}
      wsRef.current = null;

      const wsUrl =
        loginType === "admin"
          ? `ws://localhost:8000/ws/admin/request-monitor/?admin_uuid=${uuid}`
          : `ws://localhost:8000/ws/user/request-monitor/?user_uuid=${uuid}`;

      const ws = new WebSocket(wsUrl, [token]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WS CONNECTED:", loginType);
        retryRef.current = 0;
        setConnected(true);
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);

          // 🔥 메시지 순번 누적
          messageSeqRef.current += 1;

          console.log(
            `📥 WS RAW DATA #${messageSeqRef.current} @ ${new Date().toLocaleTimeString()}`,
            data
          );

          onMessageRef.current?.(data);
        } catch {
          console.warn("❌ WS parse error:", e.data);
        }
      };

      ws.onclose = (e) => {
        console.warn("⚠️ WS CLOSED:", e.code, e.reason);
        setConnected(false);

        if (closedByCleanup) return;
        if (e.code === 1000 || e.code === 1008) return;

        const delay = Math.min(1000 * 2 ** retryRef.current, 30000);
        retryRef.current += 1;

        console.log(`🔁 WS RECONNECT IN ${delay}ms`);
        retryTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        console.error("❌ WS ERROR");
      };
    };

    connect();

    return () => {
      closedByCleanup = true;
      clearTimeout(retryTimerRef.current);
      try {
        wsRef.current?.close(1000, "cleanup");
      } catch {}
      wsRef.current = null;
      setConnected(false);
    };
  }, [token, uuid, loginType]);

  return { connected };
}
