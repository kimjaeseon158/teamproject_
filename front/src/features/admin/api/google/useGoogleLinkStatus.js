import { useEffect, useState } from "react";

const GOOGLE_LINKED_KEY = "googleLinked";

export default function useGoogleLinkStatus() {
  const [state, setState] = useState({
    loading: true,
    linked: false,
    reason: null,
    lastCheckedAt: null,
    events: [],
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      const params = new URLSearchParams(window.location.search);
      const authResult = params.get("google_auth");

      if (authResult === "success") {
        localStorage.setItem(GOOGLE_LINKED_KEY, "1");
      } else if (authResult === "failed" || authResult === "invalid_state") {
        localStorage.removeItem(GOOGLE_LINKED_KEY);
      }

      try {
        const res = await fetch("/api/google_calendar_auth/events/", {
          method: "GET",
          credentials: "include",
        });

        if (!alive) return;

        if (res.status === 200) {
          const data = await res.json();
          const asEvents = (data?.events ?? []).map((event) => ({
            id: event.id,
            title: event.summary || "(제목 없음)",
            start: new Date(event.start?.dateTime || event.start?.date),
            end: new Date(event.end?.dateTime || event.end?.date),
            description: event.description || "",
            location: event.location || "",
          }));

          localStorage.setItem(GOOGLE_LINKED_KEY, "1");
          setState({
            loading: false,
            linked: true,
            reason: null,
            lastCheckedAt: Date.now(),
            events: asEvents,
          });
          return;
        }

        const locallyLinked = localStorage.getItem(GOOGLE_LINKED_KEY) === "1";
        setState({
          loading: false,
          linked: locallyLinked,
          reason: locallyLinked ? null : res.status >= 500 ? "server" : "unauthenticated",
          lastCheckedAt: Date.now(),
          events: [],
        });
      } catch {
        if (!alive) return;

        const locallyLinked = localStorage.getItem(GOOGLE_LINKED_KEY) === "1";
        setState({
          loading: false,
          linked: locallyLinked,
          reason: locallyLinked ? null : "network",
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
