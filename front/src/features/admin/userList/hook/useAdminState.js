import { useState } from "react";

const initialSearchForm = {
  user_name: "",
  phone_number: "010-",
  resident_number: "",
  mobile_carrier: "",
  user_uuid: "",
  address: "",
};

export function useAdminState() {
  const [peopleData, setPeopleData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_count: 0,
    total_pages: 1,
  });
  const [ordering, setOrdering] = useState("user_name");
  const [activeFilters, setActiveFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchForm, setSearchForm] = useState(initialSearchForm);
  const [isSearchActive, setIsSearchActive] = useState(false);

  return {
    peopleData, setPeopleData,
    pagination, setPagination,
    ordering, setOrdering,
    activeFilters, setActiveFilters,
    loading, setLoading,
    selectedPerson, setSelectedPerson,
    checkedItems, setCheckedItems,
    showAddModal, setShowAddModal,
    showSearchModal, setShowSearchModal,
    searchForm, setSearchForm,
    isSearchActive, setIsSearchActive,
  };
}
