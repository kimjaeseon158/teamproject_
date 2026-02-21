import { useState } from "react";

const AddDailyPayPanel = ({ onSave, onClose }) => {
  const [company, setCompany] = useState("");
  const [dailyPay, setDailyPay] = useState("");

  /* =========================
     일급 입력 핸들러 (정수만)
  ========================= */
  const handleDailyPayChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setDailyPay("");
      return;
    }

    const numberValue = Number(value);
    if (
      Number.isInteger(numberValue) &&
      numberValue >= 0
    ) {
      setDailyPay(value);
    }
  };

  /* =========================
     저장
  ========================= */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!company.trim() || dailyPay === "") {
      alert("회사명과 일급을 입력하세요.");
      return;
    }

    const pay = Number(dailyPay);
    if (!Number.isInteger(pay) || pay < 0) {
      alert("일급은 0 이상의 정수만 입력 가능합니다.");
      return;
    }

    onSave(company.trim(), pay);
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
          value={dailyPay}
          onChange={handleDailyPayChange}
          onKeyDown={(e) => {
            if (e.key === " ") e.preventDefault();
          }}
        />

        <button type="button" onClick={handleSubmit}>
          저장
        </button>
        <button type="button" onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  );
};

export default AddDailyPayPanel;
