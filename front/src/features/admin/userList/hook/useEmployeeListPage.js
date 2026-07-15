import { useMemo } from "react";
import { Button } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

import { useAdminData } from "./useAdminData";
import { useAdminHandlers } from "./useAdminHandlers";
import { useAdminState } from "./useAdminState";
import { userListColumns } from "../constants/userListColumns";

export function useEmployeeListPage(toast) {
  const state = useAdminState();
  const handlers = useAdminHandlers(state, toast);
  useAdminData(state.setPeopleData);

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

  return {
    handlers,
    hasSearchFilter,
    selectAll,
    selectedCount,
    state,
    tableColumns,
  };
}
