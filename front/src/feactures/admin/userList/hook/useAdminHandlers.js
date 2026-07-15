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
    setSearchForm,
  } = state;

  /* =========================
     검색 초기값
  ========================== */
  const initialSearchForm = {
    user_name: "",
    phone_number: "",
    resident_number: "",
    mobile_carrier: "",
    user_uuid: "",
    address: "",
    sorting: "",
    direction: "",
  };

  /* =========================
     체크박스
  ========================== */
  const handleCheckboxChange = (uuid) => {
    setCheckedItems((prev) => ({
      ...prev,
      [uuid]: !prev[uuid],
    }));
  };

  /* =========================
     삭제
  ========================== */
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

  /* =========================
     수정
  ========================== */
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

  /* =========================
     검색 입력 변경
  ========================== */
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "resident_number") v = formatResidentNumber(value);
    if (name === "phone_number") v = formatPhoneNumber(value);

    setSearchForm((prev) => ({
      ...prev,
      [name]: v,
    }));
  };

  /* =========================
     검색 실행
  ========================== */
  const applySearch = async () => {
    const filters = {};

    const allowedFilterKeys = [
      "user_name",
      "phone_number",
      "resident_number",
      "mobile_carrier",
      "user_uuid",
      "address",
    ];

    allowedFilterKeys.forEach((key) => {
      if (searchForm[key]?.trim()) {
        filters[key] = searchForm[key].trim();
      }
    });

    const res = await fetchFilteredPeople({ filters });

    setPeopleData(res);
    setShowSearchModal(false);

    setSearchForm(initialSearchForm);
  };
  /* =========================
     모달 닫기
  ========================== */
  const handleCloseSearch = () => {
    setShowSearchModal(false);
    setSearchForm(initialSearchForm);
  };

  return {
    handleCheckboxChange,
    handleDeleteSelected,
    handleSave,
    handleSearchChange,
    applySearch,
    handleCloseSearch,
  };
}