import {
  deleteEmployees,
} from "../api/adminPageDelete";
import {
  updateEmployee,
} from "../api/adminPageUpdate";
import {
  fetchFilteredPeople,
} from "../api/adminPageLogic";
import {
  formatResidentNumber,
  formatPhoneNumber,
} from "../utils/format";

export function useAdminHandlers(state) {
  const {
    setPeopleData,
    checkedItems,
    setCheckedItems,
    setSelectedPerson,
    searchForm,
    setShowSearchModal,
  } = state;

  const handleCheckboxChange = (uuid) => {
    setCheckedItems((prev) => ({
      ...prev,
      [uuid]: !prev[uuid],
    }));
  };

  const handleDeleteSelected = async () => {
    const uuids = Object.entries(checkedItems)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    if (!uuids.length) return;

    const res = await deleteEmployees(uuids);
    if (res?.success) {
      setPeopleData((prev) =>
        prev.filter((p) => !uuids.includes(p.user_uuid))
      );
      setCheckedItems({});
      alert("삭제 완료");
    }
  };

  const handleSave = async (person) => {
    const res = await updateEmployee(person);
    if (res?.success) {
      setPeopleData((prev) =>
        prev.map((p) =>
          p.user_uuid === person.user_uuid ? person : p
        )
      );
      setSelectedPerson(null);
      alert("수정 완료");
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "resident_number") v = formatResidentNumber(value);
    if (name === "phone_number") v = formatPhoneNumber(value);
    state.setSearchForm((p) => ({ ...p, [name]: v }));
  };

  const applySearch = async () => {
    const filters = {};
    Object.entries(searchForm).forEach(([k, v]) => {
      if (v?.trim()) filters[k] = v.trim();
    });

    if (!Object.keys(filters).length) {
      alert("검색어를 입력하세요");
      return;
    }

    const res = await fetchFilteredPeople({ filters });
    setPeopleData(Array.isArray(res) ? res : []);
    setShowSearchModal(false);
  };

  return {
    handleCheckboxChange,
    handleDeleteSelected,
    handleSave,
    handleSearchChange,
    applySearch,
  };
}
