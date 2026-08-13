import { useEffect, useRef, useState } from "react";
import { WS_BASE, WS_ENABLED } from "../../config/api/apiEnv";

const buildSocketUrl = (loginType, uuid) => {
  const baseUrl = WS_BASE.replace(/\/$/, "");
  const wsPrefix = baseUrl.endsWith("/ws") ? "" : "/ws";
  const path =
    loginType === "admin"
      ? `/admin/request-monitor/?admin_uuid=${uuid}`
      : `/user/request-monitor/?user_uuid=${uuid}`;

  return `${baseUrl}${wsPrefix}${path}`;
};

export function useNotifySocket({ token, uuid, loginType, onMessage }) {
  const wsRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const retryRef = useRef(0);
  const retryTimerRef = useRef(null);
  const messageSeqRef = useRef(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!token || !uuid || !loginType || !WS_BASE || !WS_ENABLED) {
      setConnected(false);
      return;
    }

    let closedByCleanup = false;

    const connect = () => {
      try {
        wsRef.current?.close(1000, "reconnect");
      } catch {}

      wsRef.current = null;

      let ws;
      try {
        ws = new WebSocket(buildSocketUrl(loginType, uuid), [token]);
      } catch (error) {
        console.warn("WebSocket connection skipped", error);
        setConnected(false);
        return;
      }

      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
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
        setConnected(false);

        if (closedByCleanup) return;
        if (event.code === 1000 || event.code === 1008) return;

        const delay = Math.min(1000 * 2 ** retryRef.current, 30000);
        retryRef.current += 1;
        retryTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        console.error("WS ERROR");
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
