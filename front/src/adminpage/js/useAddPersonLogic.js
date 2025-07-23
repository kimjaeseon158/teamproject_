// src/adminpage/js/useAddPersonLogic.js
import { useEffect, useState, useCallback } from "react";
import { Panel_PostData } from "./admnsdbPost";
import { formatPhoneNumber, formatResidentNumber  } from "../js/utils";

export function useAddPersonLogic(existingEmployees, onSave, onClose) {
  const [formData, setFormData] = useState({
    employeeNumber: "",
    people: "",
    rsdnNmbr: "",
    maskedRsdnNmbr: "",
    phoneNumber: "",
    id: "",
    pw: "",
    carrier: "",
    address: "",
    addressDetail: ""
  });

  const generateEmployeeNumber = useCallback(() => {
    if (!existingEmployees || existingEmployees.length === 0) return "E0001";

    const numbers = existingEmployees
      .map((e) => {
        const empNum = e?.employee_number;
        const match = empNum?.match(/^E(\d{4})$/);
        return match ? parseInt(match[1]) : null;
      })
      .filter((num) => num !== null);

    if (numbers.length === 0) return "E0001";

    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;
    return `E${String(nextNumber).padStart(4, "0")}`;
  }, [existingEmployees]);

  useEffect(() => {
    const newNumber = generateEmployeeNumber();
    setFormData((prev) => ({ ...prev, employeeNumber: newNumber }));
  }, [existingEmployees, generateEmployeeNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "rsdnNmbr") {
      const formatted = formatResidentNumber(value);
      setFormData((prev) => ({
        ...prev,
        rsdnNmbr: formatted,
        maskedRsdnNmbr: formatted,
      }));
    }

    else if (name === "phoneNumber") {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        phoneNumber: formatted,
      }));
    }

    else {
      // 일반 입력 필드 처리
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // formData에서 필요한 값들 비구조화 할당
    const {
      people,
      rsdnNmbr,
      phoneNumber,
      employeeNumber,
      id,
      pw,
      carrier,
      address,
      addressDetail,
    } = formData;

    // 필수 필드 체크
    if (!people || !rsdnNmbr || !phoneNumber) {
      alert("모든 필드를 입력하세요");
      return;
    }

    const panel_post_data = {
      data_type: "user_login_info",
      data: {
        employee_number: employeeNumber,
        user_name: people,
        user_id: id,
        password: pw,
        phone_number: phoneNumber,
        mobile_carrier: carrier,
        resident_number: rsdnNmbr,
        address: address + " " + addressDetail,
      },
    };

    try {
      const result = await Panel_PostData(panel_post_data);
      console.log("전송 응답:", result);

      if (result?.data?.success === true || result?.message?.includes("처리 완료")) {
        alert("사원 정보 등록이 완료 되었습니다.");

        const newPerson = {
          employee_number: employeeNumber,
          user_name: people,
          phone_number: phoneNumber,
          mobile_carrier: carrier,
          resident_number: rsdnNmbr,
          address: address + " " + addressDetail,
        };

        onSave(newPerson);
        onClose();
      } else {
        const errorMsg = result?.data?.message || result?.message || "서버에서 실패 응답을 받았습니다.";
        alert("등록 실패: " + errorMsg);
      }
    } catch (err) {
      console.error("서버 오류:", err);
      alert("서버 요청 실패: 네트워크 또는 서버 오류입니다.");
    }
  };


  return {
    formData,
    handleChange,
    handleSubmitBase: handleSubmit,
    setFormData,
  };
}

