// src/admin/components/AdminPage.jsx
import React, { useState, useEffect } from "react";
import AdminInformation from "./adminInformation";
import AddPersonModal from "./addPersonModal";
import AddButton from "./adminAddBtn";
import { deleteEmployees } from "../js/adminPageDelete";
import { updateEmployee } from "../js/adminPageUpdate";
import { fetchFilteredPeople } from "../js/adminPageLogic";
import { Panel_PostData } from "../js/admnsdbPost";

import "../css/adminPage.css";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  HStack,
} from "@chakra-ui/react";

import { formatResidentNumber, formatPhoneNumber } from "../js/utils";

/* =========================
   검색 초기값
========================= */
const initialSearchForm = {
  user_name: "",
  phone_number: "",
  resident_number: "",
  address: "",
};

const AdminPage = () => {
  /* =========================
     state
  ========================= */
  const [peopleData, setPeopleData] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchForm, setSearchForm] = useState(initialSearchForm);

  /* =========================
     초기 데이터 로드
  ========================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await Panel_PostData();
        if (res?.success && Array.isArray(res.users)) {
          setPeopleData(res.users);
        }
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      }
    };
    load();
  }, []);

  /* =========================
     선택 / 체크
  ========================= */
  const handleCheckboxChange = (uuid) => {
    setCheckedItems((prev) => ({
      ...prev,
      [uuid]: !prev[uuid],
    }));
  };

  const handleRowClick = (person) => {
    setSelectedPerson(person);
  };

  /* =========================
     삭제 (uuid 기준)
  ========================= */
  const handleDeleteSelected = async () => {
    const uuids = Object.entries(checkedItems)
      .filter(([_, checked]) => checked)
      .map(([uuid]) => uuid);

    if (uuids.length === 0) return;

    const result = await deleteEmployees(uuids);

    if (result.success) {
      setPeopleData((prev) =>
        prev.filter((p) => !uuids.includes(p.user_uuid))
      );
      setCheckedItems({});
      alert("삭제 완료");
    } else {
      console.error("삭제 실패:", result.error);
    }
  };

  /* =========================
     수정 저장
  ========================= */
  const handleSave = async (updatedPerson) => {
    const result = await updateEmployee(updatedPerson);

    if (result.success) {
      setPeopleData((prev) =>
        prev.map((p) =>
          p.user_uuid === updatedPerson.user_uuid ? updatedPerson : p
        )
      );
      setSelectedPerson(null);
      alert("수정 완료");
    } else {
      alert("수정 실패");
    }
  };

  /* =========================
     검색
  ========================= */
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "resident_number") v = formatResidentNumber(value);
    if (name === "phone_number") v = formatPhoneNumber(value);

    setSearchForm((prev) => ({ ...prev, [name]: v }));
  };

  const applySearch = async () => {
    const filters = {};
    Object.entries(searchForm).forEach(([k, v]) => {
      if (v?.trim()) filters[k] = v.trim();
    });

    if (Object.keys(filters).length === 0) {
      alert("검색어를 입력하세요");
      return;
    }

    const result = await fetchFilteredPeople({ filters });
    setPeopleData(result);
    setShowSearchModal(false);
  };

  /* =========================
     render
  ========================= */
  return (
    <div className="adminPage_Bk">
      <div className="adminPage-btn">
        <AddButton
          onAdd={() => setShowAddModal(true)}
          onDelete={handleDeleteSelected}
          onSearch={() => setShowSearchModal(true)}
          disableDelete={Object.values(checkedItems).every((v) => !v)}
        />
      </div>

      <Box p={4} bg="#f9f9f9" borderRadius="md" overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th w="60px">선택</Th>
              <Th>이름</Th>
              <Th>주민등록번호</Th>
              <Th>주소</Th>
              <Th>전화번호</Th>
            </Tr>
          </Thead>
          <Tbody>
            {peopleData.map((item) => (
              <Tr
                key={item.user_uuid}
                onClick={() => handleRowClick(item)}
                _hover={{ bg: "gray.100" }}
                cursor="pointer"
              >
                <Td onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    isChecked={!!checkedItems[item.user_uuid]}
                    onChange={() => handleCheckboxChange(item.user_uuid)}
                  />
                </Td>
                <Td>{item.user_name}</Td>
                <Td>{item.resident_number}</Td>
                <Td>{item.address}</Td>
                <Td>
                  [{item.mobile_carrier}] {item.phone_number}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {selectedPerson && (
        <AdminInformation
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
          onSave={handleSave}
        />
      )}

      {showAddModal && (
        <AddPersonModal
          isOpen={showAddModal}
          onSave={(p) => {
            setPeopleData((prev) => [...prev, p]);
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showSearchModal && (
        <Modal isOpen onClose={() => setShowSearchModal(false)} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>검색</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={3}>
                <FormControl>
                  <FormLabel>이름</FormLabel>
                  <Input name="user_name" onChange={handleSearchChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>전화번호</FormLabel>
                  <Input name="phone_number" onChange={handleSearchChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>주민등록번호</FormLabel>
                  <Input
                    name="resident_number"
                    onChange={handleSearchChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>주소</FormLabel>
                  <Input name="address" onChange={handleSearchChange} />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" onClick={applySearch}>
                적용
              </Button>
              <Button ml={2} onClick={() => setShowSearchModal(false)}>
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
