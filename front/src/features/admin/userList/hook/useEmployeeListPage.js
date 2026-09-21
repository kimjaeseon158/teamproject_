import { useMemo } from "react";
import { Button } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import SortableHeaderLabel from "../../../common/SortableHeaderLabel";

import { useAdminData } from "./useAdminData";
import { useAdminHandlers } from "./useAdminHandlers";
import { useAdminState } from "./useAdminState";
import { userListColumns } from "../constants/userListColumns";

export function useEmployeeListPage(toast) {
  const state = useAdminState();
  const { loadEmployees } = useAdminData(state, toast);
  const handlers = useAdminHandlers(state, toast, loadEmployees);
  const { ordering, setSelectedPerson } = state;
  const { handleOrderingChange } = handlers;

  const selectedCount = useMemo(
    () => Object.values(state.checkedItems).filter(Boolean).length,
    [state.checkedItems]
  );

  const hasSearchFilter = useMemo(() => {
    return (
      state.isSearchActive ||
      Object.entries(state.searchForm).some(([key, value]) => {
        const trimmed = String(value || "").trim();
        if (key === "phone_number") return trimmed && trimmed !== "010-";
        return trimmed;
      })
    );
  }, [state.isSearchActive, state.searchForm]);

  const selectableIds = useMemo(
    () => state.peopleData.map((person) => person.user_uuid).filter(Boolean),
    [state.peopleData]
  );

  const checkedCountOnPage = useMemo(
    () => selectableIds.filter((uuid) => state.checkedItems[uuid]).length,
    [selectableIds, state.checkedItems]
  );

  const selectAll = {
    isChecked: selectableIds.length > 0 && checkedCountOnPage === selectableIds.length,
    isIndeterminate: checkedCountOnPage > 0 && checkedCountOnPage < selectableIds.length,
    isDisabled: selectableIds.length === 0,
    onChange: (checked) => {
      state.setCheckedItems((prev) => {
        const next = { ...prev };
        selectableIds.forEach((uuid) => {
          next[uuid] = checked;
        });
        return next;
      });
    },
  };

  const tableColumns = useMemo(
    () => [
      ...userListColumns.map((column) => !["user_name", "phone_number"].includes(column.key) ? column : {
        ...column,
        label: (
          <SortableHeaderLabel
            sortKey={column.key}
            sortField={ordering.replace(/^-/, "")}
            sortOrder={ordering.startsWith("-") ? "desc" : "asc"}
            onSort={handleOrderingChange}
          >
            {column.label}
          </SortableHeaderLabel>
        ),
      }),
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
              setSelectedPerson(row);
            }}
          >
            수정
          </Button>
        ),
      },
    ],
    [handleOrderingChange, ordering, setSelectedPerson]
  );

  return {
    handlers,
    sortedPeople: state.peopleData,
    hasSearchFilter,
    selectAll,
    selectedCount,
    state,
    tableColumns,
  };
}
