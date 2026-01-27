// src/ws/useNotifySocket.js
import { useEffect, useRef } from "react";

export function useNotifySocket({ token, onMessage }) {
  const wsRef = useRef(null);
  const retryRef = useRef(0);
  const timerRef = useRef(null);

  // ✅ onMessage가 렌더마다 바뀌어도 소켓 재연결 안 하도록 ref로 보관
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!token) {
      console.warn("[WS] token is falsy -> skip connect");
      return;
    }

    let cancelled = false;

    const connect = () => {
      if (cancelled) return;

      // 혹시 이전 소켓이 남아있다면 정리
      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;

      console.log("[WS] connecting... retry:", retryRef.current);

      const ws = new WebSocket("ws://localhost:8000/ws/requests/", [token]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WS CONNECTED");
        retryRef.current = 0;
        try {
          ws.send(JSON.stringify({ type: "ping" }));
        } catch (e) {
          console.warn("[WS] send ping failed:", e);
        }
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          onMessageRef.current?.(data);
        } catch (err) {
          console.warn("[WS] message parse failed:", err, e.data);
        }
      };

      // ✅ 이게 없으면 “왜 안 붙는지” 영원히 모름
      ws.onerror = (err) => {
        console.error("[WS] onerror:", err);
      };

      ws.onclose = (e) => {
        console.warn("[WS] onclose:", {
          code: e.code,
          reason: e.reason,
          wasClean: e.wasClean,
        });

        if (cancelled) return;

        const delay = Math.min(3000 * 2 ** retryRef.current, 12000);
        retryRef.current += 1;

        console.log("[WS] reconnect scheduled in", delay, "ms");
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
      console.log("[WS] cleanup");
    };
  }, [token]); // ✅ onMessage는 deps에서 제거 (ref로 처리)

  return {};
}
