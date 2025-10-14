// src/js/googleAuth.js
import { fetchWithAuth } from "../../api/fetchWithAuth";

export const CLIENT_ID = "150097873816-sjo6bj7v2u1n7usqkn5us3eq878665f8.apps.googleusercontent.com";
export const SCOPES = "https://www.googleapis.com/auth/calendar";

export function login(setAccessToken, toast) {
  if (!window.google?.accounts) {
    toast({
      title: "Google API 로딩 실패",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  const tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: async (tokenResponse) => {
      if (tokenResponse.error) {
        toast({
          title: "토큰 요청 오류",
          description: tokenResponse.error,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const access_token = tokenResponse.access_token;
      // 로컬 상태에만 저장 (백엔드로 토큰 전송하지 않음)
      if (typeof setAccessToken === "function") setAccessToken(access_token);

      // 서버는 토큰을 받지 않아도 된다고 하니, 알림용/상태 동기화용으로만 호출
      await sendTokenToBackend(undefined,toast);
    },
  });

  tokenClient.requestAccessToken({ prompt: "consent" });
}
export async function sendTokenToBackend(_maybeTokenIgnored, toast) {
  try {
    // 토큰을 전송하지 않음 — 단순 GET으로 상태 동기화/알림
    const res = await fetchWithAuth(
      "/api/google_calendar_auth/", // 백엔드 엔드포인트
      {
        method: "GET",
        headers: { "Accept": "application/json" },
      },
      { toast }
    );

    if (!res) {
      toast({
        title: "인증 실패",
        description: "서버 응답이 없습니다.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // JSON 여부 안전 체크
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await res.json();
      if (data && data.success) {
        toast({
          title: "Google 계정 인증(알림) 성공",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        toast({
          title: "서버 인증(알림) 실패",
          description: data && data.message ? data.message : undefined,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      // HTML/텍스트 등 JSON이 아닌 응답이 오면 로그로 확인
      const text = await res.text();
      console.error("서버 응답이 JSON이 아님:", text);
      toast({
        title: "서버 응답 오류",
        description: "서버가 JSON을 반환하지 않았습니다.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  } catch (err) {
    toast({
      title: "서버 통신 오류",
      description: err?.message || String(err),
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
}
