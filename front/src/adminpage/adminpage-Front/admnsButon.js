import React, { useState } from "react";
import AddButton from "./adminAddBtn";
import "../css/admnsButon.css";
import AddWagePanel from "../adminpage-Front/addPanel";

const AdminPanel = ({ onClose, locations: initLocations }) => {
  const [locations, setLocations] = useState(initLocations || []);
  const [daily_Pay, setDailyPay] = useState(() => {
    const init = {};
    (initLocations || []).forEach((loc) => {
      init[loc] = ""; // 초기값 빈문자열
    });
    return init;
  });
  const [showAddPanel, setShowAddPanel] = useState(false);

  // 일급 입력 변경 시 숫자만 허용하고 업데이트
  const handledaily_PayChange = (location, value) => {
    if (value === "") {
      setDailyPay((prev) => ({ ...prev, [location]: "" }));
      return;
    }
    // 숫자만 정규식 체크 (빈 문자열도 허용)
    if (/^\d*$/.test(value)) {
      setDailyPay((prev) => ({ ...prev, [location]: value }));
    }
    // 숫자 아닌 입력은 무시
  };

  // 회사(지역) 삭제
  const handleDeletLocation = (location) => {
    setLocations((prev) => prev.filter((loc) => loc !== location));
    setDailyPay((prev) => {
      const copy = { ...prev };
      delete copy[location];
      return copy;
    });
  };

  // 저장 버튼 클릭 시 유효성 검사 후 저장 처리
  const handleSave = (e) => {
    e.preventDefault();

    for (const loc of locations) {
      const wage = daily_Pay[loc];
      if (!wage || !/^\d+$/.test(wage) || Number(wage) < 0) {
        alert(`${loc}의 일급은 0 이상의 정수여야 합니다.`);
        return;
      }
    }

    // 저장 로직 (예: 서버 통신 등) 여기서 실행
    alert("일급 정보가 저장되었습니다.");

    onClose(); // 모달 닫기
  };

  // 새 회사 추가
  const handleAddNewCompany = (company, wage) => {
    if (locations.includes(company)) {
      alert("이미 존재하는 회사명입니다.");
      return;
    }
    setLocations((prev) => [...prev, company]);
    setDailyPay((prev) => ({ ...prev, [company]: wage }));
  };

  return (
    <form className="adminpanelBk" onSubmit={handleSave}>
      <div className="modal-contents">
        <h2>일급 수정창</h2>
        <AddButton onAdd={() => setShowAddPanel(true)} />
        <div className="activeModal">
          {locations.map((location, idx) => (
            <div key={idx} className="location-wage-item">
              <span className="location-name">{location}</span>
              <input
                type="text"
                placeholder="일급 입력"
                value={daily_Pay[location]}
                onChange={(e) => handledaily_PayChange(location, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === " ") e.preventDefault(); // 스페이스바 막기
                }}
              />
              <span
                className="location-delete"
                style={{ cursor: "pointer", marginLeft: 8 }}
                onClick={() => handleDeletLocation(location)}
              >
                x
              </span>
            </div>
          ))}
        </div>
        <div className="panelBtn">
          <button type="submit">수정</button>
          <button type="button" onClick={onClose}>닫기</button>
        </div>

        {showAddPanel && (
          <AddWagePanel
            onSave={(company, wage) => {
              handleAddNewCompany(company, wage);
              setShowAddPanel(false);
            }}
            onClose={() => setShowAddPanel(false)}
          />
        )}
      </div>
    </form>
  );
};

export default AdminPanel;
