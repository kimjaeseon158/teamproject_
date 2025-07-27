import React  from "react";
import { useAddPersonLogic } from "../js/useAddPersonLogic"; // 로직 훅
import "../css/showAddmodel.css";

const AddPersonModal = ({ onClose, onSave, existingEmployees }) => {
  const { form_Data, handleChange, handleSubmitBase, setform_Data } =
    useAddPersonLogic(existingEmployees, onSave, onClose);

  // 다음 주소 API
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const fullAddress = data.address;
        setform_Data((prev) => ({
          ...prev,
          address: fullAddress,
        }));
      },
    }).open();
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    handleSubmitBase(e); // 내부적으로 onSaveWithFullAddress 호출
  };

  const fields = [
    { label: "사원번호", name: "employee_Number", value: form_Data.employee_Number, readOnly: true },
    { label: "이름", name: "people", value: form_Data.people, placeholder: "ex)홍길동", maxLength: 8 },
    { label: "주민등록번호", name: "resident_Number", value: form_Data.masked_Resident_Number, placeholder: "ex)000000-0******" },
    { label: "전화번호", name: "phone_Number" },
    { label: "주소", name: "address", value: form_Data.address, placeholder: "ex) 충청남도 OO시 OO군..." },
    { label: "ID", name: "id", value: form_Data.id, placeholder: "ex)hong123", maxLength: 12 },
    { label: "비밀번호", name: "pw", value: form_Data.pw, placeholder: "ex)1234", maxLength: 16 },
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>새 사람 추가</h3>
        <form onSubmit={handleSubmit}>
          {fields.map((field, idx) => {
            if (field.name === "phone_Number") {
              return (
                <div className="form-row flex-row" key={idx}>      
                  <label>{field.label} :</label> 
                  <select
                    name="carrier"
                    value={form_Data.carrier || ""}
                    onChange={handleChange}
                    className="carrier-select"
                  >
                    <option value="">통신사</option>
                    <option value="SKT">SKT</option>
                    <option value="KT">KT</option>
                    <option value="LGU+">LG U+</option>
                    <option value="알뜰폰">알뜰폰</option>
                  </select>
                  <input
                    type="text"
                    name="phone_Number"
                    value={form_Data.phone_Number}
                    onChange={handleChange}
                    placeholder="ex)010-1234-5678"
                    maxLength={13}
                  />
                </div>
              );
            } else if (field.name === "address") {
              return (
                <div key={idx}>
                  <div className="form-row">
                    <label>{field.label} :</label>
                    <input
                      type="text"
                      name="adress"
                      value={form_Data.address}
                      readOnly
                      placeholder={field.placeholder}
                    />
                    <button type="button" onClick={handleAddressSearch}>주소 검색</button>
                  </div>
                  <div className="form-row">
                    <label>상세 주소 :</label>
                    <input
                      type="text"
                      name="address_Detail"
                      value={form_Data.address_Detail}
                      onChange={handleChange}
                      placeholder="ex) 아파트, 동/호수 등"
                    />
                  </div>
                </div>
              );
            } else {
              return (
                <div className="form-row" key={idx}>
                  <label>{field.label} :</label>
                  {field.readOnly ? (
                    <span>{field.value}</span>
                  ) : (
                    <input
                      type="text"
                      name={field.name}
                      value={field.value}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                    />
                  )}
                </div>
              );
            }
          })}
          <button type="submit">저장</button>
          <button type="button" onClick={onClose}>취소</button>
        </form>
      </div>
    </div>
  );
};

export default AddPersonModal;
