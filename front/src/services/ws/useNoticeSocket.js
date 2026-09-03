import { useEffect, useRef, useState } from "react";

export default function useNoticeSocket({ token, enabled, onConnect, onMessage }) {
  const onConnectRef = useRef(onConnect);
  const onMessageRef = useRef(onMessage);
  const retryRef = useRef(0);
  const retryTimerRef = useRef(null);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    onConnectRef.current = onConnect;
    onMessageRef.current = onMessage;
  }, [onConnect, onMessage]);

  useEffect(() => {
    if (!enabled || !token) return;
    let closedByCleanup = false;

    const connect = () => {
      const baseUrl = process.env.REACT_APP_WS_BASE_URL;
      if (!baseUrl) return;

      const ws = new WebSocket(`${baseUrl}/user/notices/`, [token]);
      socketRef.current = ws;
      onConnectRef.current?.();

      ws.onopen = () => {
        retryRef.current = 0;
        setConnected(true);
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (typeof data?.title === "string" && data.title.trim()) {
            onMessageRef.current?.(data);
          }
        } catch {
          console.warn("Notice WS parse error");
        }
      };
      ws.onclose = (event) => {
        setConnected(false);
        if (closedByCleanup || event.code === 1000 || event.code === 1008) return;
        const delay = Math.min(1000 * 2 ** retryRef.current, 30000);
        retryRef.current += 1;
        retryTimerRef.current = setTimeout(connect, delay);
      };
      ws.onerror = () => console.error("Notice WS ERROR");
    };

    connect();
    return () => {
      closedByCleanup = true;
      clearTimeout(retryTimerRef.current);
      try {
        socketRef.current?.close(1000, "cleanup");
      } catch {}
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled, token]);

  return { connected };
}
