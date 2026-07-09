import { useMemo } from "react";
import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  RepeatIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Text,
  useToast,
} from "@chakra-ui/react";

import AdminInformation from "../../features/admin/userList/components/AdminInformation.js";
import AddPersonModal from "../../features/admin/userList/components/AddPersonModal.js";
import CommonTable from "../../features/common/mytable.js";
import SearchModal from "../../features/admin/userList/components/searchModal.js";

import { useAdminState } from "../../features/admin/userList/hook/useAdminState.js";
import { useAdminData } from "../../features/admin/userList/hook/useAdminData.js";
import { useAdminHandlers } from "../../features/admin/userList/hook/useAdminHandlers.js";
import { userListColumns } from "../../features/admin/userList/constants/userListColumns.js";

export default function EmployeeList() {
  const toast = useToast();
  const state = useAdminState();
  const handlers = useAdminHandlers(state, toast);
  useAdminData(state.setPeopleData);

  const selectedCount = useMemo(
    () => Object.values(state.checkedItems).filter(Boolean).length,
    [state.checkedItems]
  );

  const hasSearchFilter = useMemo(() => {
    return state.isSearchActive || Object.values(state.searchForm).some((value) => String(value || "").trim());
  }, [state.isSearchActive, state.searchForm]);

  const selectableIds = useMemo(
    () => state.peopleData.map((person) => person.user_uuid).filter(Boolean),
    [state.peopleData]
  );
  const checkedCountOnPage = useMemo(
    () => selectableIds.filter((uuid) => state.checkedItems[uuid]).length,
    [selectableIds, state.checkedItems]
  );
  const isAllChecked = selectableIds.length > 0 && checkedCountOnPage === selectableIds.length;
  const isIndeterminate = checkedCountOnPage > 0 && checkedCountOnPage < selectableIds.length;
  const handleSelectAll = (checked) => {
    state.setCheckedItems((prev) => {
      const next = { ...prev };
      selectableIds.forEach((uuid) => {
        next[uuid] = checked;
      });
      return next;
    });
  };
  const tableColumns = useMemo(
    () => [
      ...userListColumns,
      {
        key: "edit",
        label: "수정",
        width: "110px",
        render: (_value, row) => (
          <Button
            size="sm"
            leftIcon={<EditIcon />}
            colorScheme="green"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              state.setSelectedPerson(row);
            }}
          >
            수정
          </Button>
        ),
      },
    ],
    [state]
  );

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 6 }}>
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
        mb={6}
      >
        <Box>
          <HStack spacing={3} mb={2}>
            <Heading size="lg" color="gray.800">
              직원 관리
            </Heading>
            <Badge
              colorScheme={hasSearchFilter ? "blue" : "green"}
              borderRadius="full"
              px={3}
              py={1}
            >
              {hasSearchFilter ? "검색 조건 입력됨" : "최신 데이터"}
            </Badge>
          </HStack>
          <Text color="gray.500" fontSize="sm">
            직원 정보를 등록, 검색, 수정하고 선택 삭제합니다.
          </Text>
        </Box>

        <HStack spacing={2}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="green"
            onClick={() => state.setShowAddModal(true)}
          >
            새 직원 추가
          </Button>
          <Button
            leftIcon={<SearchIcon />}
            colorScheme="blue"
            variant="outline"
            onClick={() => state.setShowSearchModal(true)}
          >
            직원 검색
          </Button>
          <Button
            leftIcon={<RepeatIcon />}
            colorScheme="gray"
            variant="outline"
            onClick={handlers.handleShowAll}
          >
            전체 보기
          </Button>
          <Button
            leftIcon={<DeleteIcon />}
            colorScheme="red"
            variant="outline"
            isDisabled={!selectedCount}
            onClick={handlers.handleDeleteSelected}
          >
            선택 삭제
          </Button>
        </HStack>
      </Flex>

      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.100"
        borderRadius="lg"
        boxShadow="sm"
        overflow="hidden"
      >
        <Flex
          justify="space-between"
          align={{ base: "stretch", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={3}
          px={6}
          py={4}
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <Box>
            <Heading size="sm" color="gray.800">
              직원 목록
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              테이블의 수정 버튼으로 직원 상세 정보를 확인하고 수정할 수 있습니다.
            </Text>
          </Box>

          <HStack spacing={2}>
            {selectedCount > 0 && (
              <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                {selectedCount.toLocaleString()}명 선택
              </Badge>
            )}
            <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                {state.peopleData.length.toLocaleString()}명
            </Badge>
          </HStack>
        </Flex>

        <Box sx={{ "> div": { boxShadow: "none", borderRadius: 0 } }}>
          <CommonTable
            data={state.peopleData}
            columns={tableColumns}
            rowKey="user_uuid"
            selectable
            checkedItems={state.checkedItems}
            onCheck={handlers.handleCheckboxChange}
            selectAll={{
              isChecked: isAllChecked,
              isIndeterminate,
              isDisabled: selectableIds.length === 0,
              onChange: handleSelectAll,
            }}
          />
        </Box>
      </Box>

      {state.selectedPerson && (
        <AdminInformation
          person={state.selectedPerson}
          onClose={() => state.setSelectedPerson(null)}
          onSave={handlers.handleSave}
          toast={toast}
        />
      )}

      {state.showAddModal && (
        <AddPersonModal
          isOpen
          onSave={(person) => {
            state.setPeopleData((prev) => [...prev, person]);
            state.setShowAddModal(false);
          }}
          onClose={() => state.setShowAddModal(false)}
          toast={toast}
        />
      )}

      <SearchModal
        isOpen={state.showSearchModal}
        onClose={handlers.handleCloseSearch}
        searchForm={state.searchForm}
        onChange={handlers.handleSearchChange}
        onSearch={handlers.applySearch}
      />
    </Box>
  );
}
