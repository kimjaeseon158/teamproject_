import { useEffect, useRef, useState } from "react";

const MAX_RECONNECT_ATTEMPTS = 5;
const STABLE_CONNECTION_MS = 30000;

export function useNotifySocket({ token, uuid, loginType, onMessage }) {
  const wsRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const retryRef = useRef(0);
  const retryTimerRef = useRef(null);
  const stableTimerRef = useRef(null);
  const messageSeqRef = useRef(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!token || !uuid || !loginType) return;

    let closedByCleanup = false;

    const scheduleReconnect = () => {
      if (closedByCleanup || retryTimerRef.current) return;
      if (retryRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.error("WS reconnect stopped after repeated failures");
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

      const currentSocket = wsRef.current;
      if (
        currentSocket?.readyState === WebSocket.CONNECTING ||
        currentSocket?.readyState === WebSocket.OPEN
      ) {
        return;
      }

      const baseUrl = process.env.REACT_APP_WS_BASE_URL;
      if (!baseUrl) return;

      const wsUrl =
        loginType === "admin"
          ? `${baseUrl}/admin/request-monitor/?admin_uuid=${uuid}`
          : `${baseUrl}/user/request-monitor/?user_uuid=${uuid}`;

      const ws = new WebSocket(wsUrl, [token]);
      wsRef.current = ws;

      ws.onopen = () => {
        clearTimeout(stableTimerRef.current);
        stableTimerRef.current = setTimeout(() => {
          if (wsRef.current === ws && ws.readyState === WebSocket.OPEN) {
            retryRef.current = 0;
          }
        }, STABLE_CONNECTION_MS);
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          messageSeqRef.current += 1;
          onMessageRef.current?.(data);
        } catch {
          console.warn("WS parse error");
        }
      };

      ws.onclose = (event) => {
        clearTimeout(stableTimerRef.current);
        if (wsRef.current === ws) wsRef.current = null;
        setConnected(false);

        if (closedByCleanup) return;
        if (event.code === 1000 || event.code === 1008) return;
        scheduleReconnect();
      };

      ws.onerror = () => {
        console.error("WS ERROR");
      };
    };

    connect();

    return () => {
      closedByCleanup = true;
      clearTimeout(retryTimerRef.current);
      clearTimeout(stableTimerRef.current);
      retryTimerRef.current = null;
      try {
        wsRef.current?.close(1000, "cleanup");
      } catch {}
      wsRef.current = null;
      setConnected(false);
    };
  }, [token, uuid, loginType]);

  return { connected };
}
