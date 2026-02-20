import "../css/adminPage.css";

import AdminInformation from "../components/AdminInformation";
import AddPersonModal from "../components/AddPersonModal";
import AddButton from "../../shared/AddButton";
import  CommonTable  from "../../shared/mytable.js";


import { useAdminState } from "../hooks/useAdminState";
import { useAdminData } from "../hooks/useAdminData";
import { useAdminHandlers } from "../hooks/useAdminHandlers";
import { user_listColmns } from "./user_listColmns";

import { Modal } from "@chakra-ui/react";

export default function Page() {
  const state = useAdminState();
  const handlers = useAdminHandlers(state);
  useAdminData(state.setPeopleData);
  return (
    <div className="adminPage_Bk">
      <AddButton
        onAdd={() => state.setShowAddModal(true)}
        onDelete={handlers.handleDeleteSelected}
        onSearch={() => state.setShowSearchModal(true)}
        disableDelete={Object.values(state.checkedItems).every(v => !v)}
        addLabel="새 직원 추가"
        deleteLabel="직원 삭제"
        searchLabel="직원 검색"
      />

      <CommonTable
        data={state.peopleData}
        columns={user_listColmns}
        selectable
        rowKey="user_uuid"
        checkedItems={state.checkedItems}
        onCheck={handlers.handleCheckboxChange}
        onRowClick={state.setSelectedPerson}
      />

      {state.selectedPerson && (
        <AdminInformation
          person={state.selectedPerson}
          onClose={() => state.setSelectedPerson(null)}
          onSave={handlers.handleSave}
        />
      )}

      {state.showAddModal && (
        <AddPersonModal
          isOpen
          onSave={(p) => {
            state.setPeopleData(prev => [...prev, p]);
            state.setShowAddModal(false);
          }}
          onClose={() => state.setShowAddModal(false)}
        />
      )}

      {state.showSearchModal && (
        <Modal isOpen onClose={() => state.setShowSearchModal(false)}>
          {/* 기존 검색 UI 그대로 */}
        </Modal>
      )}
    </div>
  );
}
