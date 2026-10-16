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

const writeClipboardText = async (value) => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch (error) {
      // HTTP or browser permission restrictions can block the modern API.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, value.length);
  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) throw new Error("Clipboard copy failed");
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
    const digits = String(phoneNumber || "").replace(/\D/g, "");
    if (!digits) {
      toast({
        title: NOTIFICATION_MESSAGES.contacts.phoneNumberMissing,
        status: "warning",
        duration: 1600,
      });
      return;
    }

    try {
      await writeClipboardText(digits);
      toast({
        title: "복사되었습니다.",
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
    reset: () => {
      setKeyword("");
      load("");
    },
    search: () => load(keyword),
    setKeyword,
  };
}
