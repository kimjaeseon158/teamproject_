import { useEffect, useRef, useState } from "react";

const MAX_RECONNECT_ATTEMPTS = 5;
const STABLE_CONNECTION_MS = 30000;

export default function useNoticeSocket({ token, enabled, onConnect, onMessage }) {
  const onConnectRef = useRef(onConnect);
  const onMessageRef = useRef(onMessage);
  const retryRef = useRef(0);
  const retryTimerRef = useRef(null);
  const stableTimerRef = useRef(null);
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    onConnectRef.current = onConnect;
    onMessageRef.current = onMessage;
  }, [onConnect, onMessage]);

  useEffect(() => {
    if (!enabled || !token) return;
    let closedByCleanup = false;
    let initialized = false;

    const scheduleReconnect = () => {
      if (closedByCleanup || retryTimerRef.current) return;
      if (retryRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.error("Notice WS reconnect stopped after repeated failures");
        return;
      }

      const delay = Math.min(1000 * 2 ** retryRef.current, 30000);
      retryRef.current += 1;
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        connect();
      }, delay);
    };

    const connect = () => {
      if (closedByCleanup) return;

      const currentSocket = socketRef.current;
      if (
        currentSocket?.readyState === WebSocket.CONNECTING ||
        currentSocket?.readyState === WebSocket.OPEN
      ) {
        return;
      }

      const baseUrl = process.env.REACT_APP_WS_BASE_URL;
      if (!baseUrl) return;

      const ws = new WebSocket(`${baseUrl}/user/notices/`, [token]);
      socketRef.current = ws;

      ws.onopen = () => {
        clearTimeout(stableTimerRef.current);
        stableTimerRef.current = setTimeout(() => {
          if (socketRef.current === ws && ws.readyState === WebSocket.OPEN) {
            retryRef.current = 0;
          }
        }, STABLE_CONNECTION_MS);
        if (!initialized) {
          initialized = true;
          onConnectRef.current?.();
        }
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
        clearTimeout(stableTimerRef.current);
        if (socketRef.current === ws) socketRef.current = null;
        setConnected(false);
        if (closedByCleanup || event.code === 1000 || event.code === 1008) return;
        scheduleReconnect();
      };
      ws.onerror = () => console.error("Notice WS ERROR");
    };

    connect();
    return () => {
      closedByCleanup = true;
      clearTimeout(retryTimerRef.current);
      clearTimeout(stableTimerRef.current);
      retryTimerRef.current = null;
      try {
        socketRef.current?.close(1000, "cleanup");
      } catch {}
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled, token]);

  return { connected };
}
