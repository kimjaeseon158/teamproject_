import React, { useState, useContext, useEffect } from "react";
import AdminInformation from "./adminInformation";
import AddPersonModal from "./addPersonModal";
import AddButton from "./adminAddBtn";
import UserContext from "../../login/js/userContext";
import { deleteEmployees } from "../js/adminPageDelete";
import { updateEmployee } from "../js/adminPageUpdate";
import { fetchFilteredPeople } from "../js/adminPageLogic";
import "../css/adminPage.css";
import { useResizableTable } from "./adminResizableTable";
import { formatResidentNumber ,formatPhoneNumber  } from "../js/utils";

const initialsearch_Form = {
  employee_number: "",
  user_name: "",
  phone_number: "",
  resident_number: "",
  address: "",
  carrier: "",
  sort_Key: "",
  sort_Direction: "",
};

const AdminPage = () => {
  const { userData } = useContext(UserContext);

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [checked_Items, setchecked_Items] = useState({});
  const [people_Data, setpeople_Data] = useState([]);
  const [search_Form, setsearch_Form] = useState(initialsearch_Form);

  useEffect(() => {
    if (userData && userData.length > 0 && people_Data.length === 0) {
      setpeople_Data(sortByEmployeeNumber(userData));
    }

  }, [userData, people_Data]);

  // 초기 열 너비 및 행 높이
  const initial_Column_Widths = {
    employee_number: 150,
    user_name: 150,
    resident_number: 150,
    address: 200,
    phone_number: 150,
  };

  // 초기 행 높이 설정 (기본 40)
  const initial_Row_Heights = {};
  people_Data.forEach((p) => {
    initial_Row_Heights[p.employee_number] = 40;
  });

  const {
    column_Widths,
    row_Heights,
    onColumnMouseDown,
    onRowMouseDown,
    handleColumnDoubleClick,
    setrow_Heights,
  } = useResizableTable(initial_Column_Widths, initial_Row_Heights);

  useEffect(() => {
    // people_Data 변경 시 행 높이 초기화
    const reset_Heights = {};
    people_Data.forEach((p) => {
      reset_Heights[p.employee_number] = 40;
    });
    setrow_Heights(reset_Heights);
  }, [people_Data, setrow_Heights]);

  const handleRowClick = (person) => {
    setSelectedPerson(person);
  };

  const handleCloseModal = () => {
    setSelectedPerson(null);
  };

  const handleSave = async (updatedPerson) => {
    const result = await updateEmployee(updatedPerson);

    if (result.success) {
      setpeople_Data((prev) =>
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
  const sortByEmployeeNumber = (data) => {
  // 사원번호가 문자열일 경우, 숫자로 변환해 정렬
    return data.slice().sort((a, b) => {
      const numA = parseInt(a.employee_number.replace(/\D/g, ""), 10);
      const numB = parseInt(b.employee_number.replace(/\D/g, ""), 10);
      return numA - numB;
    });
  };
    const handleaddLow = () => {
    setShowAddModal(true);
  };

  const handleSaveNewPerson = (newPerson) => {
    setpeople_Data((prev) => [...prev, newPerson]);
    setShowAddModal(false);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleCheckboxChange = (employee_number) => {
    setchecked_Items((prev) => ({
      ...prev,
      [employee_number]: !prev[employee_number],
    }));
  };

  const handleDeleteSelected = async () => {
    const employee_Numbers = Object.entries(checked_Items)
      .filter(([_, checked]) => checked)
      .map(([empNo]) => empNo);

    const result = await deleteEmployees(employee_Numbers);

    if (result.success) { 
      const remaining = people_Data.filter(
        (person) => !employee_Numbers.includes(person.employee_number)
      );
      setpeople_Data(sortByEmployeeNumber(remaining));
      setchecked_Items({});
      alert("삭제가 완료되었습니다.");
    } else {
      console.error("삭제 실패:", result.failedItems || result.error);
    }
  };

  const openSearchModal = () => {
    setsearch_Form(initialsearch_Form);
    setShowSearchModal(true);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
  };

  const handlesearch_FormChange = (e) => {
    const { name, value } = e.target;
    let formatted_Value = value;
 
    if (name === "resident_number") {
      formatted_Value = formatResidentNumber(value);
    } else if (name === "phone_number") {
      formatted_Value = formatPhoneNumber(value);
    }

    setsearch_Form((prev) => ({
      ...prev,
      [name]: formatted_Value,
    }));
  };

  const applySearch = async () => {
  const { employee_number, user_name, phone_number, resident_number, address, sort_Key, sort_Direction } = search_Form;

  if (
    !employee_number.trim() &&
    !user_name.trim() &&
    !phone_number.trim() &&
    !resident_number.trim() &&
    !address.trim()
  ) {
    alert("검색어를 하나 이상 입력해주세요.");
    return;
  }
  console.log(typeof employee_number)
  const filters = {};
  if (employee_number.trim()) filters.employee_number = employee_number.trim();
  if (user_name.trim()) filters.user_name = user_name.trim();
  if (phone_number.trim()) filters.phone_number = phone_number.trim();
  if (resident_number.trim()) filters.resident_number = resident_number.trim();
  if (address.trim()) filters.address = address.trim();

  const sort = sort_Key && sort_Direction ? { key: sort_Key, direction: sort_Direction } : null;

  // 서버에서 실제 사람 배열만 받음
  let result = await fetchFilteredPeople({ filters, sort });

  if (sort && sort.key === "employee_number") {
    result = sortByEmployeeNumber(result);
    if (sort.direction === "desc") {
      result = result.reverse();
    }
  } else if (!sort) {
    result = sortByEmployeeNumber(result);
  }
  setpeople_Data(result);
  closeSearchModal();
};



  // 헤더 셀 렌더링
  const renderResizableTH = (label, colKey) => (
    <th style={{ width: column_Widths[colKey], position: "relative" }}>
      {label}
      <div
        className="column-resizer"
        onMouseDown={(e) => onColumnMouseDown(e, colKey)}
        onDoubleClick={() => handleColumnDoubleClick(colKey, people_Data)}
      />
    </th>
  );


  return (
    <div className="adminPage_Bk">
      <div className="adminPage-btn">
        <AddButton onAdd={handleaddLow} />
        <button
          onClick={handleDeleteSelected}
          disabled={Object.values(checked_Items).every((checked) => !checked)}
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
          {people_Data.map((item) => (
            <tr
              key={item.employee_number}
              onClick={() => handleRowClick(item)}
              style={{
                cursor: "pointer",
                height: row_Heights[item.employee_number] || 40,
                position: "relative",
              }}
            >
              <td style={{ width: 30 }} onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={!!checked_Items[item.employee_number]}
                  onChange={() => handleCheckboxChange(item.employee_number)}
                />
                <div
                  className="row-resizer"
                  onMouseDown={(e) => onRowMouseDown(e, item.employee_number)}
                />
              </td>
              <td style={{ width: column_Widths.employee_number }}>{item.employee_number}</td>
              <td style={{ width: column_Widths.user_name }}>{item.user_name}</td>
              <td style={{ width: column_Widths.resident_number }}>{item.resident_number}</td>
              <td style={{ width: column_Widths.address }}>{item.address}</td>
              <td style={{ width: column_Widths.phone_number }}>
                [&nbsp;{item.mobile_carrier}&nbsp;]     &nbsp;  
                {item.phone_number}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedPerson && (
        <AdminInformation person={selectedPerson} onClose={handleCloseModal} onSave={handleSave} />
      )}

      {showAddModal && (
        <AddPersonModal onSave={handleSaveNewPerson} onClose={handleCloseAddModal} existingEmployees={people_Data} />
      )}

      {showSearchModal && (
        <div className="searchModal" onClick={closeSearchModal}>
          <div className="searchModal_content" onClick={(e) => e.stopPropagation()}>
            <h3>검색 / 정렬 조건 입력</h3>
            <label>
              사원 번호:
              <input
                type="text"
                name="employee_number"
                value={search_Form.employee_number}
                onChange={handlesearch_FormChange}
                placeholder="사원번호 입력"
                className="searchModal_input"
              />
            </label>
            <label>
              이름:
              <input
                type="text"
                name="user_name"
                value={search_Form.user_name}
                onChange={handlesearch_FormChange}
                placeholder="이름 입력"
                className="searchModal_input"
              />
            </label>
            <label>
              전화번호:
              <input
                type="text"
                name="phone_number"
                value={search_Form.phone_number}
                onChange={handlesearch_FormChange}
                placeholder="전화번호 입력"
                className="searchModal_input"
              />
            </label>
            <label>
              주민등록번호:
              <input
                type="text"
                name="resident_number"
                value={search_Form.resident_number}
                onChange={handlesearch_FormChange}
                placeholder="주민등록번호 입력"
                className="searchModal_input"
              />
            </label>
            <label>
              주소:
              <input
                type="text"
                name="address"
                value={search_Form.address}
                onChange={handlesearch_FormChange}
                placeholder="주소 입력"
                className="searchModal_input"
              />
            </label>
            <label>
              정렬 기준:
              <select
                name="sort_Key"
                value={search_Form.sort_Key}
                onChange={handlesearch_FormChange}
                className="searchModal__select"
              >
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
                name="sort_Direction"
                value={search_Form.sort_Direction}
                onChange={handlesearch_FormChange}
                className="searchModal__select"
              >
                <option value="asc">오름차순</option>
                <option value="desc">내림차순</option>
              </select>
            </label>

            <div className="searchModal_btnGroup">
              <button onClick={applySearch} className="searchModal_btnApply">
                적용
              </button>
              <button onClick={closeSearchModal} className="searchModal_btnCancel">
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