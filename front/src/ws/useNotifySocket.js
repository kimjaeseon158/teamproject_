// src/ws/useNotifySocket.js
import { useEffect, useRef } from "react";

export function useNotifySocket({ token, onMessage }) {
  const wsRef = useRef(null);
  const retryRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    //cancelled 동작시(true) useEffect전체 종료
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;

      // 혹시 이전 소켓이 남아있다면 정리
      wsRef.current?.close();

      const ws = new WebSocket("ws://127.0.0.1:8000/ws/notify/", ["jwt", token]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WS CONNECTED");
        retryRef.current = 0;
        ws.send(JSON.stringify({ type: "ping" }));
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          onMessage?.(data);
        } catch {}
      };

      ws.onclose = () => {
        if (cancelled) return;
        const delay = Math.min(1000 * 2 ** retryRef.current, 5000);
        retryRef.current += 1;
        timerRef.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      //useEffect에 사용 이 종료되었음을 알림
      cancelled = true;
      //colse에 대한 시간 흐름을 단번에 제거
      if (timerRef.current) clearTimeout(timerRef.current);
      wsRef.current?.close();
    };
  }, [token, onMessage]);

  return {};
}
