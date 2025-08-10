import React, { useEffect, useState } from "react";
import { gapi } from "gapi-script";

const CLIENT_ID = "150097873816-sjo6bj7v2u1n7usqkn5us3eq878665f8.apps.googleusercontent.com";
const API_KEY = "AIzaSyCGRWAVWoRJuCslUhRcoWxMJkyIZ7jUJRw";
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

export default function Overview() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    function start() {
        console.log("gapi.client.init 시작");
        gapi.client
        .init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
            scope: SCOPES,
        })
        .then(() => {
            console.log("gapi.client.init 성공");
            gapi.auth2.getAuthInstance().signIn().then(() => {
            console.log("로그인 성공");
            listUpcomingEvents();
            });
        })
        .catch(e => console.error("gapi.client.init 실패:", e));
    }

    gapi.load("client:auth2", () => {
        console.log("gapi.load 완료");
        start();
    });
    }, []);

  const listUpcomingEvents = () => {
    gapi.client.calendar.events
      .list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 10,
        orderBy: "startTime",
      })
      .then((response) => {
        const events = response.result.items;
        setEvents(events);
      });
  };

  return (
    <div>
      <h2>Upcoming Google Calendar Events</h2>
      {events.length === 0 && <p>No upcoming events found.</p>}
      <ul>
        {events.map((event) => {
          const start = event.start.dateTime || event.start.date;
          return (
            <li key={event.id}>
              {start} — {event.summary}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
