// 어디서든 공용으로 쓰기
import { useLocation } from "react-router-dom";

function useLoginTypeFromRoute() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/dashboard")) return "admin";
  if (pathname.startsWith("/data")) return "user";
  return null;
}
