import React from "react";
import { FaPlus, FaTrash, FaSearch } from "react-icons/fa";
import { IconButton, Tooltip, HStack } from "@chakra-ui/react";

const AddButton = ({ onAdd, onDelete, onSearch, disableDelete }) => {
  return (
    <HStack spacing={2}>
      {/* 새 직원 추가 */}
      <Tooltip label="새 직원 추가" placement="top">
        <IconButton
          icon={<FaPlus />}
          onClick={onAdd}
          aria-label="Add"
          size="sm"
          colorScheme="green"
        />
      </Tooltip>

      {/* 선택 삭제 */}
      <Tooltip label="선택 삭제" placement="top">
        <IconButton
          icon={<FaTrash />}
          onClick={onDelete}
          aria-label="Delete"
          size="sm"
          colorScheme="red"
          isDisabled={disableDelete}
        />
      </Tooltip>

      {/* 검색 / 정렬 */}
      <Tooltip label="검색 / 정렬" placement="top">
        <IconButton
          icon={<FaSearch />}
          onClick={onSearch}
          aria-label="Search"
          size="sm"
          colorScheme="blue"
        />
      </Tooltip>
    </HStack>
  );
};

export default AddButton;
