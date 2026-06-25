import { fetchWithAuth } from "../../../../services/api/fetchWithAuth";

/**
 * GET 諛⑹떇?쇰줈 ?ъ슜??由ъ뒪??議고쉶
 * -> data??荑쇰━?ㅽ듃留곸쑝濡?蹂?섑빐???꾨떖
 * -> refresh token ?먮룞 泥섎━
 */
export const Panel_PostData = async (data = {}, toast) => {
  try {
    const query = new URLSearchParams(data).toString();

    // ??GET + fetchWithAuth ?ъ슜
    const res = await fetchWithAuth(
      `/api/user-info-list/?${query}`,  // GET 諛⑹떇?쇰줈 data ?꾨떖
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
      { toast }
    );

    if (!res || !res.ok) {

      if (toast) {
        toast({
          title: "?좎? ?뺣낫 議고쉶 ?ㅽ뙣",
          description: `?곹깭 肄붾뱶: ${res?.status}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }

      return null;
    }

    const result = await res.json();
    return result;

  } catch (error) {
    console.error("Panel_PostData ?ㅽ듃?뚰겕 ?ㅻ쪟");

    if (toast) {
      toast({
        title: "?ㅽ듃?뚰겕 ?ㅻ쪟",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    throw error;
  }
};
