import { useRef, useState } from "react";
import { deleteEmployees } from "../api/adminPageDelete";
import { updateEmployee } from "../api/adminPageUpdate";
import { formatResidentNumber, formatPhoneNumber } from "../utils/format";

const initialSearchForm = {
  user_name: "",
  phone_number: "010-",
  resident_number: "",
  mobile_carrier: "",
  user_uuid: "",
  address: "",
};

export function useAdminHandlers(state, toast, loadEmployees) {
  const [showAllLoading, setShowAllLoading] = useState(false);
  const showAllPending = useRef(false);
  const {
    setPeopleData,
    setPagination,
    setOrdering,
    setActiveFilters,
    checkedItems,
    setCheckedItems,
    setSelectedPerson,
    searchForm,
    setShowSearchModal,
    setSearchForm,
    setIsSearchActive,
  } = state;

  const notify = (options) => {
    toast?.({
      duration: 2500,
      isClosable: true,
      ...options,
    });
  };

  const handleCheckboxChange = (uuid) => {
    setCheckedItems((prev) => ({
      ...prev,
      [uuid]: !prev[uuid],
    }));
  };

  const handleDeleteSelected = async () => {
    const uuids = Object.entries(checkedItems)
      .filter(([, checked]) => checked)
      .map(([uuid]) => uuid);

    if (!uuids.length) return false;

    const res = await deleteEmployees(uuids, { toast });

    if (res?.success) {
      setCheckedItems({});
      await loadEmployees();
      notify({
        title: "삭제 완료",
        description: `${uuids.length.toLocaleString()}명의 직원이 삭제되었습니다.`,
        status: "success",
      });
      return true;
    }

    notify({
      title: "삭제 실패",
      description: res?.error || "선택한 직원을 삭제하지 못했습니다.",
      status: "error",
    });
    return false;
  };

  const handleSave = async (person) => {
    const res = await updateEmployee(person, { toast });

    if (res?.success) {
      setPeopleData((prev) =>
        prev.map((item) =>
          item.user_uuid === person.user_uuid ? (res.updated || person) : item
        )
      );
      setSelectedPerson(null);
      notify({
        title: "수정 완료",
        description: "직원 정보가 수정되었습니다.",
        status: "success",
      });
      return true;
    }

    notify({
      title: "수정 실패",
      description: res?.error || "직원 정보를 수정하지 못했습니다.",
      status: "error",
    });
    return false;
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === "resident_number") nextValue = formatResidentNumber(value);
    if (name === "phone_number") {
      let numeric = value.replace(/[^0-9]/g, "");
      if (!numeric.startsWith("010")) {
        numeric = "010";
      }
      nextValue = formatPhoneNumber(numeric);
    }

    setSearchForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

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
        if (key === "phone_number" && searchForm[key].trim() === "010-") return;
        filters[key] = searchForm[key].trim();
      }
    });

    if (!Object.keys(filters).length) {
      notify({
        title: "검색 조건 없음",
        description: "하나 이상의 검색 조건을 입력해주세요.",
        status: "warning",
      });
      return;
    }

    setActiveFilters(filters);
    setPagination((current) => ({ ...current, page: 1 }));
    setShowSearchModal(false);
    setSearchForm(initialSearchForm);
    setIsSearchActive(true);
    setCheckedItems({});

    notify({
      title: "검색 완료",
      description: "검색 조건을 적용했습니다.",
      status: "success",
    });
  };

  const handleShowAll = async () => {
    if (showAllPending.current) return false;
    showAllPending.current = true;
    setShowAllLoading(true);
    try {
      setActiveFilters({});
      setOrdering("user_name");
      setPagination((current) => ({ ...current, page: 1 }));
      setSearchForm(initialSearchForm);
      setIsSearchActive(false);
      setCheckedItems({});
      setSelectedPerson(null);
      notify({
        title: "전체 보기",
        description: "전체 직원 목록을 불러옵니다.",
        status: "success",
      });
      return true;
    } catch (error) {
      notify({
        title: "전체 목록 조회 실패",
        description: error.message || "직원 목록을 다시 불러오지 못했습니다.",
        status: "error",
      });
      return false;
    } finally {
      showAllPending.current = false;
      setShowAllLoading(false);
    }
  };

  const handleCloseSearch = () => {
    setShowSearchModal(false);
    setSearchForm(initialSearchForm);
  };

  const openSearch = () => {
    setShowSearchModal(true);
  };

  const handlePageChange = (page) => {
    setCheckedItems({});
    setPagination((current) => ({ ...current, page }));
  };

  const handleOrderingChange = (field) => {
    const nextOrdering = state.ordering === field ? `-${field}` : field;
    setOrdering(nextOrdering);
    setPagination((current) => ({ ...current, page: 1 }));
    setCheckedItems({});
  };

  const handleAddSuccess = () => {
    setActiveFilters({});
    setOrdering("user_name");
    setPagination((current) => ({ ...current, page: 1 }));
    setCheckedItems({});
    setShowSearchModal(false);
    setIsSearchActive(false);
  };

  return {
    showAllLoading,
    openSearch,
    handleCheckboxChange,
    handleDeleteSelected,
    handleSave,
    handleSearchChange,
    applySearch,
    handleShowAll,
    handleCloseSearch,
    handlePageChange,
    handleOrderingChange,
    handleAddSuccess,
  };
}
