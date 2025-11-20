// src/hooks/useGoogleLinkStatus.js
import { useEffect, useState } from "react";

export default function useGoogleLinkStatus() {
  const [state, setState] = useState({
    loading: true,      // 판별 중
    linked: false,      // 구글 연동 여부
    reason: null,       // 'unauthenticated' | 'server' | 'network' | null
    lastCheckedAt: null,
    events: [],         // 🔥 추가: 불러온 이벤트들
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/google_calendar_auth/events/", {
          method: "GET",
          credentials: "include",
        });

        if (!alive) return;

        if (res.status === 200) {
          // ✅ 여기서 한 번만 JSON 파싱 + 이벤트 변환까지 처리
          const data = await res.json();
          const asEvents = (data?.events ?? []).map((e) => ({
            id: e.id,
            title: e.summary || "(제목 없음)",
            start: new Date(e.start?.dateTime || e.start?.date),
            end: new Date(e.end?.dateTime || e.end?.date),
            description: e.description || "",
            location: e.location || "",
          }));

          setState({
            loading: false,
            linked: true,
            reason: null,
            lastCheckedAt: Date.now(),
            events: asEvents,
          });
        } else if (res.status === 401 || res.status === 403) {
          setState({
            loading: false,
            linked: false,
            reason: "unauthenticated",
            lastCheckedAt: Date.now(),
            events: [],   // 🔥 실패 케이스에서는 빈 배열
          });
        } else if (res.status >= 500) {
          setState({
            loading: false,
            linked: false,
            reason: "server",
            lastCheckedAt: Date.now(),
            events: [],
          });
        } else {
          setState({
            loading: false,
            linked: false,
            reason: "server",
            lastCheckedAt: Date.now(),
            events: [],
          });
        }
      } catch {
        setState({
          loading: false,
          linked: false,
          reason: "network",
          lastCheckedAt: Date.now(),
          events: [],
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return state;
}
