import AdminInformation from "../../feactures/admin/userList/components/AdminInformation.js";
import AddPersonModal from "../../feactures/admin/userList/components/AddPersonModal.js";
import AddButton from "../../common/AddButton.js";
import  CommonTable  from "../../feactures/admin/common/mytable.js";


import { useAdminState } from "../../feactures/admin/userList/hook/useAdminState.js";
import { useAdminData } from "../../feactures/admin/userList/hook/useAdminData.js";
import { useAdminHandlers } from "../../feactures/admin/userList/hook/useAdminHandlers.js";
import { user_listColmns } from "../../feactures/admin/userList/constants/user_listColmns.js";

import { Modal } from "@chakra-ui/react";


export default function EmployeeList() {
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