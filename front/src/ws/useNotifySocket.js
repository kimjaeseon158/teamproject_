import { useEffect, useRef } from "react";

export function useNotifySocket({ token, uuid, role, onMessage }) {
  const wsRef = useRef(null);
  const retryRef = useRef(0);
  const timerRef = useRef(null);

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    console.log("🔔 [WS EFFECT]", { token, uuid, role });

    // ✅ role까지 반드시 있어야 연결
    if (!token || !uuid || !role) {
      console.warn("[WS] skip connect", { token, uuid, role });
      return;
    }

    let cancelled = false;
    retryRef.current = 0;

    const connect = () => {
      if (cancelled) return;

      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;

      // ✅ 서버 routing과 정확히 맞추기
      const wsUrl =
        role === "admin"
          ? `ws://localhost:8000/ws/admin/request-monitor/?admin_uuid=${uuid}`
          : `ws://localhost:8000/ws/user/request-monitor/?user_uuid=${uuid}`;

      console.log("🔌 WS CONNECT TRY:", wsUrl);

      const ws = new WebSocket(wsUrl,[token]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WS CONNECTED", { uuid, role });
        retryRef.current = 0;
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          console.log("📩 WS MESSAGE:", data);
          onMessageRef.current?.(data);
        } catch {
          console.warn("[WS] parse error", e.data);
        }
      };

      ws.onerror = (err) => {
        console.error("❌ WS ERROR", err);
      };

      ws.onclose = (e) => {
        console.warn("⚠️ WS CLOSED", e.code, e.reason);

        if (cancelled) return;

        const delay = Math.min(3000 * 2 ** retryRef.current, 12000);
        retryRef.current += 1;

        timerRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      cancelled = true;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;
    };
  }, [token, uuid, role]); // 🔥 role 반드시 포함

  return {};
}
