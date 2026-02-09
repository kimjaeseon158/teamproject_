import "../css/adminPage.css";

import AdminInformation from "../components/AdminInformation";
import AddPersonModal from "../components/AddPersonModal";
import AddButton from "../components/AddButton";
import AdminTable from "../components/AdminTable";

import { useAdminState } from "../hooks/useAdminState";
import { useAdminData } from "../hooks/useAdminData";
import { useAdminHandlers } from "../hooks/useAdminHandlers";

import { Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, Button, VStack
} from "@chakra-ui/react";

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
      />

      <AdminTable
        data={state.peopleData}
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
