import { FaPlus, FaTrash, FaSearch } from "react-icons/fa";
import { IconButton, Tooltip, HStack } from "@chakra-ui/react";

const AddButton = ({
  onAdd,
  onDelete,
  onSearch,
  disableDelete = false,

  addLabel = "추가",
  deleteLabel = "삭제",
  searchLabel = "검색",

  showAdd = true,
  showDelete = true,
  showSearch = true,
}) => {
  return (
    <HStack spacing={2}>
      {/* 추가 */}
      {showAdd && (
        <Tooltip label={addLabel} placement="top">
          <IconButton
            icon={<FaPlus />}
            onClick={onAdd}
            aria-label="Add"
            size="sm"
            colorScheme="green"
          />
        </Tooltip>
      )}

      {/* 삭제 */}
      {showDelete && (
        <Tooltip label={deleteLabel} placement="top">
          <IconButton
            icon={<FaTrash />}
            onClick={onDelete}
            aria-label="Delete"
            size="sm"
            colorScheme="red"
            isDisabled={disableDelete}
          />
        </Tooltip>
      )}

      {/* 검색 */}
      {showSearch && (
        <Tooltip label={searchLabel} placement="top">
          <IconButton
            icon={<FaSearch />}
            onClick={onSearch}
            aria-label="Search"
            size="sm"
            colorScheme="blue"
          />
        </Tooltip>
      )}
    </HStack>
  );
};

export default AddButton;
