import React, { useState } from "react";

const Adddaily_PayPanel = ({ onSave, onClose }) => {
  const [company, setCompany] = useState("");
  const [daily_Pay, setdaily_Pay] = useState("");

  // 숫자만, 0 이상 정수만 입력 허용하는 onChange 핸들러
  const handleDailyPayChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setdaily_Pay("");
      return;
    }
    const numberValue = Number(value);
    if (!Number.isNaN(numberValue) && Number.isInteger(numberValue) && numberValue >= 0) {
      setdaily_Pay(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company.trim() || daily_Pay === "") {
      alert("회사명과 일급을 입력하세요.");
      return;
    }
    if (!Number.isInteger(Number(daily_Pay)) || Number(daily_Pay) < 0) {
      alert("일급은 0 이상의 정수만 입력 가능합니다.");
      return;
    }
    onSave(company.trim(), Number(daily_Pay));
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>회사 추가</h3>
        <input
          placeholder="회사명"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          placeholder="일급"
          value={daily_Pay}
          onChange={handleDailyPayChange}
          min="0"
          step="1"
          onKeyDown={(e) => {
            if (e.key === " ") e.preventDefault(); // 스페이스바 입력 차단
          }}
        />
        <button type="button" onClick={handleSubmit}>저장</button>
        <button type="button" onClick={onClose}>취소</button>
      </div>
    </div>
  );
};

export default Adddaily_PayPanel;
