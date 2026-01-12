// src/ws/useNotifySocket.js
import { useEffect, useRef } from "react";

export function useNotifySocket({ token, onMessage }) {
  const wsRef = useRef(null);
  const retryRef = useRef(0);

  useEffect(() => {
    if (!token) return;

    const connect = () => {
      const ws = new WebSocket(
        `ws://127.0.0.1:8000/ws/notify/?token=${encodeURIComponent(token)}`
      );

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
        const delay = Math.min(1000 * 2 ** retryRef.current, 5000);
        retryRef.current += 1;
        setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [token, onMessage]);

  return {};
}
