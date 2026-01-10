import React, { useState, useEffect } from "react";
import AdminInformation from "./adminInformation";
import AddPersonModal from "./addPersonModal";
import AddButton from "./adminAddBtn";
import { deleteEmployees } from "../js/adminPageDelete";
import { updateEmployee } from "../js/adminPageUpdate";
import { fetchFilteredPeople } from "../js/adminPageLogic";
import { Panel_PostData } from "../js/admnsdbPost"; // 서버 통신
import "../css/adminPage.css";
import { useResizableTable } from "./adminResizableTable";
import { formatResidentNumber, formatPhoneNumber } from "../js/utils";
import { Table, Thead, Tbody, Tr, Th, Td, Checkbox, Box, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, FormControl, FormLabel, Input, Select, Button, VStack, HStack } from "@chakra-ui/react";

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
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [checked_Items, setchecked_Items] = useState({});
  const [people_Data, setpeople_Data] = useState([]);
  const [search_Form, setsearch_Form] = useState(initialsearch_Form);

  // 서버에서 초기 데이터 가져오기
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const result = await Panel_PostData();
        if (result.success && Array.isArray(result.users)) {
          setpeople_Data(sortByEmployeeNumber(result.users));
        }
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      }
    };

    loadAdminData();
  }, []);

  // 행/열 초기 설정
  const initial_Column_Widths = {
    employee_number: 150,
    user_name: 150,
    resident_number: 150,
    address: 200,
    phone_number: 150,
  };

  const initial_Row_Heights = {};
  people_Data.forEach((p) => {
    initial_Row_Heights[p.employee_number] = 40;
  });

  const { setrow_Heights } = useResizableTable(initial_Column_Widths, initial_Row_Heights);

  useEffect(() => {
    const reset_Heights = {};
    people_Data.forEach((p) => {
      reset_Heights[p.employee_number] = 40;
    });
    setrow_Heights(reset_Heights);
  }, [people_Data, setrow_Heights]);

  const handleRowClick = (person) => setSelectedPerson(person);
  const handleCloseModal = () => setSelectedPerson(null);

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

  const sortByEmployeeNumber = (data) =>
    data.slice().sort((a, b) => {
      const numA = parseInt(a.employee_number.replace(/\D/g, ""), 10);
      const numB = parseInt(b.employee_number.replace(/\D/g, ""), 10);
      return numA - numB;
    });

  const handleaddLow = () => setShowAddModal(true);
  const handleSaveNewPerson = (newPerson) => {
    setpeople_Data((prev) => [...prev, newPerson]);
    setShowAddModal(false);
  };
  const handleCloseAddModal = () => setShowAddModal(false);

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
      //보류
      console.error("삭제 실패:", result.error);
    }
  };

  const openSearchModal = () => {
    setsearch_Form(initialsearch_Form);
    setShowSearchModal(true);
  };
  const closeSearchModal = () => setShowSearchModal(false);

  const handlesearch_FormChange = (e) => {
    const { name, value } = e.target;
    let formatted_Value = value;
    if (name === "resident_number") formatted_Value = formatResidentNumber(value);
    else if (name === "phone_number") formatted_Value = formatPhoneNumber(value);

    setsearch_Form((prev) => ({
      ...prev,
      [name]: formatted_Value,
    }));
  };

  const applySearch = async () => {
    const { employee_number, user_name, phone_number, resident_number, address, sort_Key, sort_Direction } =
      search_Form;

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

    const filters = {};
    if (employee_number.trim()) filters.employee_number = employee_number.trim();
    if (user_name.trim()) filters.user_name = user_name.trim();
    if (phone_number.trim()) filters.phone_number = phone_number.trim();
    if (resident_number.trim()) filters.resident_number = resident_number.trim();
    if (address.trim()) filters.address = address.trim();

    const sort = sort_Key && sort_Direction ? { key: sort_Key, direction: sort_Direction } : null;

    // 서버로 GET 요청
    let result = await fetchFilteredPeople({ filters, sort });

    // 사원번호 기준 정렬
    if (sort && sort.key === "employee_number") {
      result = sortByEmployeeNumber(result);
      if (sort.direction === "desc") result = result.reverse();
    } else if (!sort) {
      result = sortByEmployeeNumber(result);
    }

    setpeople_Data(result);
    closeSearchModal();
  };

  return (
    <div className="adminPage_Bk">
      <div className="adminPage-btn">
        <AddButton
          onAdd={handleaddLow}
          onDelete={handleDeleteSelected}
          onSearch={openSearchModal}
          disableDelete={Object.values(checked_Items).every((c) => !c)}
        />
      </div>
      <Box width="100%" overflowX="auto" p={4} bg="#f9f9f9" borderRadius="md">
        <Table
          variant="simple"
          size="md"
          sx={{
            "th, td": {
              py: "8px",
              px: "12px",
              fontSize: "md",
              textAlign: "center",
            },
          }}
        >
          <Thead>
            <Tr>
              <Th w="60px" textAlign="center">
                선택
              </Th>
              <Th minWidth="120px">사원 번호</Th>
              <Th minWidth="120px">이름</Th>
              <Th minWidth="150px">주민등록번호</Th>
              <Th minWidth="200px">주소</Th>
              <Th minWidth="150px">전화번호</Th>
            </Tr>
          </Thead>
          <Tbody>
            {people_Data.map((item) => (
              <Tr
                key={item.employee_number}
                onClick={() => handleRowClick(item)}
                _hover={{ bg: "gray.100" }}
                cursor="pointer"
                position="relative"
              >
                <Td w="60px" onClick={(e) => e.stopPropagation()} px="2">
                  <Checkbox
                    size="md"
                    isChecked={!!checked_Items[item.employee_number]}
                    onChange={() => handleCheckboxChange(item.employee_number)}
                    sx={{
                      "& .chakra-checkbox__control": {
                        width: "20px",
                        height: "20px",
                        borderRadius: "6px",
                      },
                      "& .chakra-checkbox__label": { display: "none" },
                    }}
                  />
                </Td>
                <Td minWidth="120px">{item.employee_number}</Td>
                <Td minWidth="120px">{item.user_name}</Td>
                <Td minWidth="150px">{item.resident_number}</Td>
                <Td minWidth="200px">{item.address}</Td>
                <Td minWidth="150px">
                  [{item.mobile_carrier}] {item.phone_number}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {selectedPerson && (
        <AdminInformation person={selectedPerson} onClose={handleCloseModal} onSave={handleSave} />
      )}

     {showAddModal && (
        <AddPersonModal
          isOpen={showAddModal}   // ✅ 추가
          onSave={handleSaveNewPerson}
          onClose={handleCloseAddModal}
          existingEmployees={people_Data}
        />
      )}

      {showSearchModal && (
        <Modal isOpen={showSearchModal} onClose={closeSearchModal} isCentered size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>검색 / 정렬 조건 입력</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <HStack spacing={3}>
                <FormControl>
                  <FormLabel>정렬 기준</FormLabel>
                  <Select
                    name="sort_Key"
                    value={search_Form.sort_Key}
                    onChange={handlesearch_FormChange}
                  >
                    <option value="employee_number">사원 번호</option>
                    <option value="user_name">이름</option>
                    <option value="resident_number">주민등록번호</option>
                    <option value="address">주소</option>
                    <option value="phone_number">전화번호</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>정렬 방식</FormLabel>
                  <Select
                    name="sort_Direction"
                    value={search_Form.sort_Direction}
                    onChange={handlesearch_FormChange}
                  >
                    <option value="asc">오름차순</option>
                    <option value="desc">내림차순</option>
                  </Select>
                </FormControl>
              </HStack>
              <VStack spacing={3} align="stretch">
                <FormControl>
                  <FormLabel>사원 번호</FormLabel>
                  <Input
                    name="employee_number"
                    value={search_Form.employee_number}
                    onChange={handlesearch_FormChange}
                    placeholder="사원번호 입력"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>이름</FormLabel>
                  <Input
                    name="user_name"
                    value={search_Form.user_name}
                    onChange={handlesearch_FormChange}
                    placeholder="이름 입력"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>전화번호</FormLabel>
                  <Input
                    name="phone_number"
                    value={search_Form.phone_number}
                    onChange={handlesearch_FormChange}
                    placeholder="전화번호 입력"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>주민등록번호</FormLabel>
                  <Input
                    name="resident_number"
                    value={search_Form.resident_number}
                    onChange={handlesearch_FormChange}
                    placeholder="주민등록번호 입력"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>주소</FormLabel>
                  <Input
                    name="address"
                    value={search_Form.address}
                    onChange={handlesearch_FormChange}
                    placeholder="주소 입력"
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="teal" mr={3} onClick={applySearch}>
                적용
              </Button>
              <Button variant="ghost" onClick={closeSearchModal}>
                취소
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default AdminPage;
