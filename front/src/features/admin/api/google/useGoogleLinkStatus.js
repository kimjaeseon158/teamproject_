import { useEffect, useState } from "react";

import { ApiRawGet } from "../../../../services/api/requestJson";
import { clearGoogleLinked, markGoogleLinked } from "./googleLinkStorage";
import { googleEventsUrl } from "./googleApiConfig";

const toCalendarEvents = (events = []) =>
  events.map((event) => ({
    id: event.id,
    title: event.summary || "(제목 없음)",
    start: new Date(event.start?.dateTime || event.start?.date),
    end: new Date(event.end?.dateTime || event.end?.date),
    description: event.description || "",
    location: event.location || "",
  }));

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

      if (authResult === "failed" || authResult === "invalid_state") {
        clearGoogleLinked();
      }

      try {
        const res = await ApiRawGet(googleEventsUrl);
        if (!alive) return;

        if (res?.status === 200) {
          const data = await res.json();

          markGoogleLinked();
          setState({
            loading: false,
            linked: true,
            reason: null,
            lastCheckedAt: Date.now(),
            events: toCalendarEvents(data?.events),
          });
          return;
        }

        clearGoogleLinked();
        setState({
          loading: false,
          linked: false,
          reason: res?.status >= 500 ? "server" : "unverified",
          lastCheckedAt: Date.now(),
          events: [],
        });
      } catch {
        if (!alive) return;

        clearGoogleLinked();
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
