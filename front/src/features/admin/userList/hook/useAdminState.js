import { useState } from "react";

const initialSearchForm = {
  user_name: "",
  phone_number: "010-",
  resident_number: "",
  mobile_carrier: "",
  user_uuid: "",
  address: "",
  sorting: "",
  direction: "",
};

export function useAdminState() {
  const [peopleData, setPeopleData] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchForm, setSearchForm] = useState(initialSearchForm);
  const [isSearchActive, setIsSearchActive] = useState(false);

  return {
    peopleData, setPeopleData,
    selectedPerson, setSelectedPerson,
    checkedItems, setCheckedItems,
    showAddModal, setShowAddModal,
    showSearchModal, setShowSearchModal,
    searchForm, setSearchForm,
    isSearchActive, setIsSearchActive,
  };
}
