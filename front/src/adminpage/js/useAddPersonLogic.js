// src/adminpage/js/useAddPersonLogic.js
import { useEffect, useState, useCallback } from "react";
import { Panel_PostData } from "./admnsdbPost";

export function useAddPersonLogic(existingEmployees, onSave, onClose) {
  const [formData, setFormData] = useState({
    employeeNumber: "",
    people: "",
    rsdnNmbr: "",
    maskedRsdnNmbr: "",
    phoneNumber: "",
    id: "",
    pw: "",
    carrier: "",  // 추가
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

    // 주민등록번호 포맷
    if (name === "rsdnNmbr") {
      const clean = value.replace(/[^0-9]/g, "").slice(0, 13);
      let formatted = clean;
      if (clean.length > 6) {
        formatted = clean.slice(0, 6) + "-" + clean.slice(6);
      }

      setFormData((prev) => ({
        ...prev,
        rsdnNmbr: formatted,
        maskedRsdnNmbr: formatted,
      }));
    }

    // 전화번호 포맷
    else if (name === "phoneNumber") {
      const clean = value.replace(/[^0-9]/g, "").slice(0, 11);
      let formatted = clean;

      if (clean.length >= 11) {
        // 3-4-4 자리 완전한 번호
        formatted = clean.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
      } else if (clean.length >= 7) {
        // 3-4-남은자리
        formatted = clean.replace(/(\d{3})(\d{4})(\d*)/, (_, g1, g2, g3) => {
          return g3 ? `${g1}-${g2}-${g3}` : `${g1}-${g2}`;
        });
      } else if (clean.length >= 4) {
        // 3-남은자리
        formatted = clean.replace(/(\d{3})(\d*)/, (_, g1, g2) => {
          return g2 ? `${g1}-${g2}` : g1;
        });
      } else {
        formatted = clean;
      }

      setFormData((prev) => ({
        ...prev,
        phoneNumber: formatted,
      }));
    }

    // 기본 처리
    else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { people, rsdnNmbr, phoneNumber, employeeNumber, id, pw, carrier, address, addressDetail } = formData;

    if (!people || !rsdnNmbr || !phoneNumber) {
      alert("모든 필드를 입력하세요");
      return;
    }

    const fullData = {
      people,
      rsdnNmbr,
      phoneNumber,
      company: employeeNumber,
      id,
      pw,
    };

    onSave(fullData);

    const panel_post_data = {
      data_type: "user_login_info",
      data: {
        employee_number: employeeNumber,
        user_name: people,
        user_id: id,
        password: pw,
        phone_number: phoneNumber,
        mobile_carrier : carrier,
        resident_number: rsdnNmbr,
        address : address + " " + addressDetail 
      },
    };

    try {
      const result = await Panel_PostData(panel_post_data);
      console.log("전송 성공", result);
      alert("사원 정보 등록이 완료 되었습니다.")
    } catch (err) {
      console.error(err);
      alert("데이터 전송 실패");
    }
  };

  return {
    formData,
    handleChange,
    handleSubmitBase: handleSubmit, 
    setFormData,
  };
}
