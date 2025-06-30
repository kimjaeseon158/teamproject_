import React, { useState, useContext, useEffect, useRef } from "react";
import AdminInformation from "./adminInformation";
import AddPersonModal from "./addPersonModal";
import AddButton from "./adminAddBtn";
import UserContext from "../../login/js/userContext";
import { deleteEmployees } from "../js/adminPageDelete";
import { updateEmployee } from "../js/adminPageUpdate";
import { fetchFilteredPeople } from "../js/adminPageLogic";
import "../css/adminPage.css";

const initialSearchForm = {
  employee_number: "",
  user_name: "",
  phone_number: "",
  resident_number: "", 
  address: "",          
  sortKey: "",
  sortDirection: "",
};

const AdminPage = () => {
  const { userData } = useContext(UserContext);

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [peopleData, setPeopleData] = useState([]);
  const [searchForm, setSearchForm] = useState(initialSearchForm);

  useEffect(() => {
    if (userData && userData.length > 0 && peopleData.length === 0) {
      setPeopleData(userData);
    }
  }, [userData, peopleData]);

  const handleRowClick = (person) => {
    setSelectedPerson(person);
  };

  const handleCloseModal = () => {
    setSelectedPerson(null);
  };

  const handleSave = async (updatedPerson) => {
    const result = await updateEmployee(updatedPerson);

    if (result.success) {
      setPeopleData((prev) =>
        prev.map((item) =>
          item.employee_number === updatedPerson.employee_number ? updatedPerson : item
        )
      );
      alert("업데이트 성공!");
      setSelectedPerson(null);
    } else {
      alert("업데이트 실패: " + (result.error || "서버 오류"));
    }
  };

  const handleaddLow = () => {
    setShowAddModal(true);
  };

  const handleSaveNewPerson = (newPerson) => {
    setPeopleData((prev) => [...prev, newPerson]);
    setShowAddModal(false);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleCheckboxChange = (employee_number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [employee_number]: !prev[employee_number],
    }));
  };

  const handleDeleteSelected = async () => {
    const employeeNumbers = Object.entries(checkedItems)
      .filter(([_, checked]) => checked)
      .map(([empNo]) => empNo);

    const result = await deleteEmployees(employeeNumbers);

    if (result.success) {
      // 삭제 성공한 사원 제외하고 상태 갱신
      const remaining = peopleData.filter(
        (person) => !employeeNumbers.includes(person.employee_number)
      );
      setPeopleData(remaining);
      setCheckedItems({});
      alert("삭제가 완료되었습니다.");
    } else {
      console.error("삭제 실패:", result.failedItems || result.error);
      alert("삭제 중 오류가 발생했습니다. 콘솔을 확인하세요.");
    }
  };


  const [columnWidths, setColumnWidths] = useState({
    employee_number: 150,
    user_name: 150,
    resident_number: 150,
    address: 200,
    phone_number: 150,
  });

  const resizingCol = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = (e, colKey) => {
    e.preventDefault();
    resizingCol.current = colKey;
    startX.current = e.clientX;
    startWidth.current = columnWidths[colKey];
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!resizingCol.current) return;
    const deltaX = e.clientX - startX.current;
    const newWidth = Math.max(startWidth.current + deltaX, 50);
    setColumnWidths((prev) => ({
      ...prev,
      [resizingCol.current]: newWidth,
    }));
  };

  const onMouseUp = () => {
    resizingCol.current = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  const handleDoubleClick = (colKey) => {
    const texts = [
      ...peopleData.map(person => String(person[colKey] ?? "")),
      colKey // 헤더 텍스트도 포함
    ];

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = "16px Arial";

    const maxWidth = texts.reduce((max, text) => {
      const metrics = context.measureText(text);
      return Math.max(max, metrics.width);
    }, 0);

    const adjustedWidth = Math.ceil(maxWidth + 40);
    setColumnWidths((prev) => ({
      ...prev,
      [colKey]: adjustedWidth,
    }));
  };

  const openSearchModal = () => {
    setSearchForm(initialSearchForm);
    setShowSearchModal(true);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
  };

  const handleSearchFormChange = (e) => {
    const { name, value } = e.target;
    setSearchForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const applySearch = async () => {
    const { employee_number, user_name, phone_number, resident_number, address, sortKey, sortDirection } = searchForm;

    const filters = {};
    if (employee_number.trim()) filters.employee_number = employee_number.trim();
    if (user_name.trim()) filters.user_name = user_name.trim();
    if (phone_number.trim()) filters.phone_number = phone_number.trim();
    if (resident_number.trim()) filters.resident_number = resident_number.trim();
    if (address.trim()) filters.address = address.trim();

    const sort = sortKey && sortDirection ? { key: sortKey, direction: sortDirection } : null;

    const result = await fetchFilteredPeople({ filters, sort });
    setPeopleData(result);
    closeSearchModal();
  };

  const renderResizableTH = (label, colKey) => (
    <th style={{ width: columnWidths[colKey] }}>
      {label}
      <div
        className="column-resizer"
        onMouseDown={(e) => onMouseDown(e, colKey)}
        onDoubleClick={() => handleDoubleClick(colKey)}
      />
    </th>
  );

  return (
    <div className="adminPage_Bk">
      <div style={{ marginBottom: 10 }}>
        <AddButton onAdd={handleaddLow} />
        <button
          onClick={handleDeleteSelected}
          disabled={Object.values(checkedItems).every((checked) => !checked)}
          style={{ marginLeft: 10 }}
        >
          선택 삭제
        </button>
        <button onClick={openSearchModal} style={{ marginLeft: 10 }}>
          검색 / 정렬
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th style={{ width: 30 }}></th>
            {renderResizableTH("사원 번호", "employee_number")}
            {renderResizableTH("이름", "user_name")}
            {renderResizableTH("주민등록번호", "resident_number")}
            {renderResizableTH("주소", "address")}
            {renderResizableTH("전화번호", "phone_number")}
          </tr>
        </thead>
        <tbody>
          {peopleData.map((item) => (
            <tr key={item.employee_number} onClick={() => handleRowClick(item)} style={{ cursor: "pointer" }}>
              <td style={{ width: 30 }} onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={!!checkedItems[item.employee_number]}
                  onChange={() => handleCheckboxChange(item.employee_number)}
                />
              </td>
              <td style={{ width: columnWidths.employee_number }}>{item.employee_number}</td>
              <td style={{ width: columnWidths.user_name }}>{item.user_name}</td>
              <td style={{ width: columnWidths.resident_number }}>{item.resident_number}</td>
              <td style={{ width: columnWidths.address }}>{item.address}</td>
              <td style={{ width: columnWidths.phone_number }}>{item.phone_number}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedPerson && (
        <AdminInformation person={selectedPerson} onClose={handleCloseModal} onSave={handleSave} />
      )}

      {showAddModal && (
        <AddPersonModal onSave={handleSaveNewPerson} onClose={handleCloseAddModal} existingEmployees={peopleData} />
      )}

      {showSearchModal && (
        <div className="searchModal" onClick={closeSearchModal}>
          <div className="searchModal__content" onClick={(e) => e.stopPropagation()}>
            <h3>검색 / 정렬 조건 입력</h3>
            <label>
              사원 번호:
              <input
                type="text"
                name="employee_number"
                value={searchForm.employee_number}
                onChange={handleSearchFormChange}
                placeholder="사원번호 입력"
                className="searchModal__input"
              />
            </label>
            <label>
              이름:
              <input
                type="text"
                name="user_name"
                value={searchForm.user_name}
                onChange={handleSearchFormChange}
                placeholder="이름 입력"
                className="searchModal__input"
              />
            </label>
            <label>
              전화번호:
              <input
                type="text"
                name="phone_number"
                value={searchForm.phone_number}
                onChange={handleSearchFormChange}
                placeholder="전화번호 입력"
                className="searchModal__input"
              />
            </label>
            <label>
              주민등록번호:
              <input
                type="text"
                name="resident_number"
                value={searchForm.resident_number}
                onChange={handleSearchFormChange}
                placeholder="주민등록번호 입력"
                className="searchModal__input"
              />
            </label>
            <label>
              주소:
              <input
                type="text"
                name="address"
                value={searchForm.address}
                onChange={handleSearchFormChange}
                placeholder="주소 입력"
                className="searchModal__input"
              />
            </label>
            <label>
              정렬 기준:
              <select
                name="sortKey"
                value={searchForm.sortKey}
                onChange={handleSearchFormChange}
                className="searchModal__select"
              >
                <option value="">선택 안함</option>
                <option value="employee_number">사원 번호</option>
                <option value="user_name">이름</option>
                <option value="resident_number">주민등록번호</option>
                <option value="address">주소</option>
                <option value="phone_number">전화번호</option>
              </select>
            </label>
            <label>
              정렬 방식:
              <select
                name="sortDirection"
                value={searchForm.sortDirection}
                onChange={handleSearchFormChange}
                className="searchModal__select"
              >
                <option value="">선택 안함</option>
                <option value="asc">오름차순</option>
                <option value="desc">내림차순</option>
              </select>
            </label>

            <div className="searchModal__btnGroup">
              <button onClick={applySearch} className="searchModal__btnApply">
                적용
              </button>
              <button onClick={closeSearchModal} className="searchModal__btnCancel">
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

