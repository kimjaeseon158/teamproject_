import React, { useEffect, useState } from "react";

const CLIENT_ID = "150097873816-sjo6bj7v2u1n7usqkn5us3eq878665f8.apps.googleusercontent.com";
const API_KEY = "AIzaSyCGRWAVWoRJuCslUhRcoWxMJkyIZ7jUJRw";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

export default function Overview() {
  const [events, setEvents] = useState([]);
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      window.gapi.load("client", async () => {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        });
        setGapiLoaded(true);
      });
    };
    document.body.appendChild(script);

    // GIS 스크립트는 index.html에서 미리 추가해 주세요
  }, []);

  useEffect(() => {
    if (!gapiLoaded) return;

    // GIS 로그인 버튼 초기화
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredentialResponse,
      // auto_select: false,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleSignInDiv"),
      { theme: "outline", size: "large" }
    );
  }, [gapiLoaded]);

  // 로그인 후 ID 토큰을 받아서 access token 요청
  function handleCredentialResponse(response) {
    const id_token = response.credential;

    // access token 요청
    window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse) => {
        if (tokenResponse.error) {
          console.error("토큰 요청 오류:", tokenResponse);
          return;
        }
        setAccessToken(tokenResponse.access_token);
      },
    }).requestAccessToken({ prompt: 'consent' }); // 사용자 동의 UI 강제 표시
  }

  useEffect(() => {
    if (!accessToken) return;

    // gapi에 토큰 직접 세팅 (비공식 API)
    window.gapi.client.setToken({ access_token: accessToken });

    // 캘린더 이벤트 불러오기
    window.gapi.client.calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: "startTime",
    }).then(response => {
      setEvents(response.result.items || []);
    }).catch(e => {
      console.error("캘린더 이벤트 불러오기 실패:", e);
    });
  }, [accessToken]);

  return (
    <div>
      <h2>Google Calendar Events</h2>
      <div id="googleSignInDiv"></div>

      {events.length === 0 ? (
        <p>로그인 후 이벤트가 표시됩니다.</p>
      ) : (
        <ul>
          {events.map(event => {
            const start = event.start.dateTime || event.start.date;
            return <li key={event.id}>{start} - {event.summary}</li>;
          })}
        </ul>
      )}
    </div>
  );
}