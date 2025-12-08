import { useState, useEffect } from "react";
import locationsList from "../../calenderTest/js/locationsList";
import { formatPhoneNumber, formatResidentNumber } from "../js/utils";

export function useAdminInformationLogic(person, onClose, onSave) {
  const [formData, setFormData] = useState({
    ...person,
    phone_number: person?.phone_number || "010-", // 기본값 설정
  });

  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    setFormData({
      ...person,
      phone_number: person?.phone_number || "010-", // 모달 열릴 때도 기본값 유지
    });
  }, [person]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 현재 커서 위치 기록
    const cursorPosition = e.target.selectionStart;

    let formatted_Value = value;

    if (name === "phone_number") {
      formatted_Value = formatPhoneNumber(value);
    } else if (name === "resident_number") {
      formatted_Value = formatResidentNumber(value);
    }

    setFormData((prev) => ({ ...prev, [name]: formatted_Value }));

    // 🔥 다음 렌더링 후 커서 위치 복원
    requestAnimationFrame(() => {
      const input = document.querySelector(`input[name="${name}"]`);
      if (input) {
        let newCursorPosition = cursorPosition;

        // 하이픈 추가 때문에 길이가 변하는 경우 커서 위치 조정
        if (formatted_Value.length > value.length) {
          newCursorPosition++;
        }

        input.selectionStart = input.selectionEnd = newCursorPosition;
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { user_name, resident_number, address, phone_number } = formData;

    // 필수 입력 확인
    if (!user_name || !resident_number || !address || !phone_number) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    // 주민등록번호 유효성 검사: 6자리-7자리
    if (!/^\d{6}-?\d{7}$/.test(resident_number)) {
      alert("주민등록번호 형식이 올바르지 않습니다. 예: 901010-1234567");
      return;
    }

    // 전화번호 유효성 검사
    if (!/^01[016789]-\d{3,4}-\d{4}$/.test(phone_number)) {
      alert("전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678");
      return;
    }

    onSave(formData); // 저장
    onClose(); // 닫기
  };

  const handleShowPanel = () => {
    setShowPanel(true);
  };

  const handleBackFromPanel = () => {
    setShowPanel(false);
  };

  return {
    formData,
    showPanel,
    setShowPanel,
    handleChange,
    handleSubmit,
    handleShowPanel,
    handleBackFromPanel,
    locationsList,
  };
}
