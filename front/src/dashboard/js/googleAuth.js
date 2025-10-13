// googleAuth.js
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
      setAccessToken(access_token);

      // ✅ 새 방식: fetchWithAuth 사용
      await sendTokenToBackend(access_token, toast);
    },
  });

  tokenClient.requestAccessToken({ prompt: "consent" });
}

export async function sendTokenToBackend(token, toast) {
  try {
    const res = await fetchWithAuth(
      "/api/", // ✅ 새 API 엔드포인트로 변경
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: token }),
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

    const data = await res.json();
    if (data.success) {
      toast({
        title: "Google 계정 인증 성공",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else {
      toast({
        title: "서버 인증 실패",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  } catch (err) {
    toast({
      title: "서버 통신 오류",
      description: err.message,
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
}
