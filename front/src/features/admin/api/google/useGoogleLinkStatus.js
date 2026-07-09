import { useEffect, useState } from "react";
import { clearGoogleLinked, markGoogleLinked } from "./googleLinkStorage";
import { googleEventsUrl } from "./googleApiConfig";

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
        markGoogleLinked();
      } else if (authResult === "failed" || authResult === "invalid_state") {
        clearGoogleLinked();
      }

      try {
        const res = await fetch(googleEventsUrl, {
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

          markGoogleLinked();
          setState({
            loading: false,
            linked: true,
            reason: null,
            lastCheckedAt: Date.now(),
            events: asEvents,
          });
          return;
        }

        if (res.status === 401 || res.status === 403) {
          clearGoogleLinked();
        }

        setState({
          loading: false,
          linked: false,
          reason: res.status >= 500 ? "server" : "unauthenticated",
          lastCheckedAt: Date.now(),
          events: [],
        });
      } catch {
        if (!alive) return;

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
