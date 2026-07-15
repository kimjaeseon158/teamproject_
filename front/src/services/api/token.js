// src/api/tokenStore.js

let accessToken = null;

// access token 저장
export function setAccessToken(token) {
  accessToken = token;
}

// 저장된 access token 가져오기
export function getAccessToken() {
  return accessToken;
}

// 로그아웃 등에서 초기화할 때
export function clearAccessToken() {
  accessToken = null;
}
