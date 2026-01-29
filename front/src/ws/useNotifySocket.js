import { useEffect, useRef } from "react";

export function useNotifySocket({ token, uuid, onMessage }) {
  const wsRef = useRef(null);
  const retryRef = useRef(0);
  const timerRef = useRef(null);
  console.log(token, uuid)
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  console.log(token, uuid)
  useEffect(() => {
    if (!token || !uuid) {
      console.warn("[WS] skip connect", { token, uuid });
      return;
    }
    let cancelled = false;
    retryRef.current = 0; // 🔥 token/uuid 변경 시 리셋

    const connect = () => {
      if (cancelled) return;

      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;

      console.log("[WS] connecting...", { uuid });

      const ws = new WebSocket(
        `ws://localhost:8000/ws/requests/?uuid=${uuid}`,
        [token]
      );

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WS CONNECTED", { uuid });
        retryRef.current = 0;
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
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
  }, [token, uuid]);

  return {};
}
