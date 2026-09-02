import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@chakra-ui/react";

import { NOTIFICATION_MESSAGES } from "../../../../constants/notificationMessages";
import { useUser } from "../../../auth/userContext";
import { fetchBoardContacts } from "../api/boardContacts";

const INITIALS = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

const getInitial = (name) => {
  const code = name?.charCodeAt(0);
  if (!code || code < 0xac00 || code > 0xd7a3) return "#";
  return INITIALS[Math.floor((code - 0xac00) / 588)];
};

export default function useBoardContacts() {
  const toast = useToast();
  const { loginType } = useUser();
  const [contacts, setContacts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (name = "") => {
    setLoading(true);
    try {
      setContacts(await fetchBoardContacts({ loginType, name }, { toast }));
    } catch (error) {
      toast({
        title: "연락처 조회에 실패했습니다.",
        description: error.message,
        status: "error",
      });
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [loginType, toast]);

  useEffect(() => { load(); }, [load]);

  const groups = useMemo(() => {
    const result = new Map();
    contacts.forEach((contact) => {
      const initial = getInitial(contact.user_name);
      result.set(initial, [...(result.get(initial) || []), contact]);
    });
    return Array.from(result, ([initial, items]) => ({ initial, items }));
  }, [contacts]);

  const copyPhoneNumber = async (phoneNumber) => {
    if (!phoneNumber) {
      toast({
        title: NOTIFICATION_MESSAGES.contacts.phoneNumberMissing,
        status: "warning",
        duration: 1600,
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(phoneNumber);
      toast({
        title: NOTIFICATION_MESSAGES.contacts.copySuccess,
        status: "success",
        duration: 1600,
      });
    } catch (error) {
      toast({
        title: NOTIFICATION_MESSAGES.contacts.copyFailed,
        description: error.message,
        status: "error",
        duration: 2200,
      });
    }
  };

  return {
    contacts,
    groups,
    keyword,
    loading,
    copyPhoneNumber,
    search: () => load(keyword),
    setKeyword,
  };
}
