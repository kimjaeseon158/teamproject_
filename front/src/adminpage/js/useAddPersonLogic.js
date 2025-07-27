// src/adminpage/js/useAddPersonLogic.js
import { useEffect, useState, useCallback } from "react";
import { Panel_PostData } from "./admnsdbPost";
import { formatphone_Number, formatResidentNumber  } from "../js/utils";

export function useAddPersonLogic(existingEmployees, onSave, onClose) {
  const [formData, setFormData] = useState({
    employee_Number: "",
    people: "",
    resident_Number: "",
    masked_Resident_Number: "",
    phone_Number: "",
    id: "",
    pw: "",
    carrier: "",
    address: "",
    address_Detail: ""
  });

  const generate_employee_Number = useCallback(() => {
    if (!existingEmployees || existingEmployees.length === 0) return "E0001";

    const numbers = existingEmployees
      .map((e) => {
        const empNum = e?.employee_number;
        const match = empNum?.match(/^E(\d{4})$/);
        return match ? parseInt(match[1]) : null;
      })
      .filter((num) => num !== null);

    if (numbers.length === 0) return "E0001";

    const max_Number = Math.max(...numbers);
    const next_Number = max_Number + 1;
    return `E${String(next_Number).padStart(4, "0")}`;
  }, [existingEmployees]);

  useEffect(() => {
    const new_Number = generate_employee_Number();
    setFormData((prev) => ({ ...prev, employee_Number: new_Number }));
  }, [existingEmployees, generate_employee_Number]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "resident_Number") {
      const formatted = formatResidentNumber(value);
      setFormData((prev) => ({
        ...prev,
        resident_Number: formatted,
        masked_Resident_Number: formatted,
      }));
    }

    else if (name === "phone_Number") {
      const formatted = formatphone_Number(value);
      setFormData((prev) => ({
        ...prev,
        phone_Number: formatted,
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
      resident_Number,
      phone_Number,
      employee_Number,
      id,
      pw,
      carrier,
      address,
      address_Detail,
    } = formData;

    // 필수 필드 체크
    if (!people || !resident_Number || !phone_Number) {
      alert("모든 필드를 입력하세요");
      return;
    }

    const panel_post_data = {
      data_type: "user_login_info",
      data: {
        employee_number: employee_Number,
        user_name: people,
        user_id: id,
        password: pw,
        phone_number: phone_Number,
        mobile_carrier: carrier,
        resident_number: resident_Number,
        address: address + " " + address_Detail,
      },
    };

    try {
      const result = await Panel_PostData(panel_post_data);
      console.log("전송 응답:", result);

      if (result?.data?.success === true || result?.message?.includes("처리 완료")) {
        alert("사원 정보 등록이 완료 되었습니다.");

        const newPerson = {
          employee_number: employee_Number,
          user_name: people,
          phone_number: phone_Number,
          mobile_carrier: carrier,
          resident_number: resident_Number,
          address: address + " " + address_Detail,
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

