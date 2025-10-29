// src/hooks/useGoogleLinkStatus.js
import { useEffect, useState } from "react";

export default function useGoogleLinkStatus() {
  const [state, setState] = useState({
    loading: true,      // 판별 중
    linked: false,      // 구글 연동 여부
    reason: null,       // 'unauthenticated' | 'server' | 'network' | null
    lastCheckedAt: null,
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/google_calendar_auth/events/", {
          method: "GET",
          credentials: "include", // 세션 쿠키 포함
        });

        if (!alive) return;

        if (res.status === 200) {
          setState({
            loading: false,
            linked: true,
            reason: null,
            lastCheckedAt: Date.now(),
          });
        } else if (res.status === 401 || res.status === 403) {
          setState({
            loading: false,
            linked: false,
            reason: "unauthenticated", // 앱 세션 없음 or 구글 미연동
            lastCheckedAt: Date.now(),
          });
        } else if (res.status >= 500) {
          setState({
            loading: false,
            linked: false,
            reason: "server",
            lastCheckedAt: Date.now(),
          });
        } else {
          // 기타 응답은 서버 이슈로 처리
          setState({
            loading: false,
            linked: false,
            reason: "server",
            lastCheckedAt: Date.now(),
          });
        }
      } catch {
        // 게스트 모드, 3rd-party 쿠키/팝업 차단, 네트워크 등 판별 불가
        setState({
          loading: false,
          linked: false,
          reason: "network",
          lastCheckedAt: Date.now(),
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return state;
}
