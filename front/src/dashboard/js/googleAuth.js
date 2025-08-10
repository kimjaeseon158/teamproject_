// googleAuth.js
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
    callback: (tokenResponse) => {
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

      sendTokenToBackend(access_token, toast);
    },
  });

  tokenClient.requestAccessToken({ prompt: "consent" });
}

export function sendTokenToBackend(token, toast) {
  fetch("http://127.0.0.1:8000/api/items/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: token }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        toast({
          title: "서버 인증 성공",
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
    })
    .catch(() => {
      toast({
        title: "서버와 통신 중 오류 발생",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    });
}
