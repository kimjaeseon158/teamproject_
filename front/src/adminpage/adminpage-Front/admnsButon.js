import React from "react";
import AddButton from "./adminAddBtn";
import "../css/admnsButon.css"
import { useAdminPanelLogic } from "../js/useAdminpanelLogic";
import AddWagePanel from "../adminpage-Front/addPanel";

const AdminPanel = ({ onClose, locations : initLocations }) => {
  const {
    locations,
    daily_Pay,
    showAddPanel,
    setShowAddPanel,
    handleWageChange,
    handleDeletLocation,
    handleSave,
    handleAddNewCompany,
  } = useAdminPanelLogic(initLocations, onClose);

    return (
    <form className="adminpanelBk">
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
                onChange={(e) => handleWageChange(location, e.target.value)}
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
          <button onClick={handleSave}>수정</button>
          <button onClick={onClose}>닫기</button>
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
