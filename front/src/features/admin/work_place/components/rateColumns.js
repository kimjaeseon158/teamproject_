import { Button, IconButton, Input, Select } from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";

import { EMPTY_PLACE, RATE_FIELDS } from "../constants/rateFields";

const getSelectedPlaceUuid = (row, adminWorkPlaces) => {
  if (row.admin_work_place_uuid) return row.admin_work_place_uuid;

  return (
    adminWorkPlaces.find((place) => place.work_place === row.work_place)
      ?.admin_work_place_uuid ?? ""
  );
};

const formatNumber = (value) =>
  value != null && value !== "" ? Number(value).toLocaleString() : "-";

const stickyManageColumn = {
  position: "sticky",
  right: 0,
  zIndex: 3,
  bg: "white",
  boxShadow: "-2px 0 0 #EDF2F7",
  _groupHover: { bg: "gray.50" },
};

const stickyManageHeader = {
  ...stickyManageColumn,
  zIndex: 4,
  bg: "gray.50",
};

const stickyWorkPlaceColumn = {
  position: "sticky",
  left: "72px",
  zIndex: 3,
  bg: "white",
  boxShadow: "2px 0 0 #EDF2F7",
  _groupHover: { bg: "gray.50" },
};

const stickyWorkPlaceHeader = {
  ...stickyWorkPlaceColumn,
  zIndex: 4,
  bg: "gray.50",
};

const getRateColumns = ({
  editingId,
  editedValues,
  setEditedValues,
  setEditingId,
  setTempRates,
  updateTempRate,
  adminWorkPlaces = [],
  checkedItems = {},
  tableData = [],
}) => {
  const renderInput = (field, row, fallbackField) => (
    <Input
      size="sm"
      width="100%"
      minW="80px"
      value={
        row.isNew
          ? row[field] ?? row[fallbackField] ?? ""
          : editedValues[field] !== undefined
          ? editedValues[field]
          : row[field] ?? row[fallbackField] ?? ""
      }
      onChange={(e) => {
        if (row.isNew) {
          updateTempRate(row.rate_uuid, { [field]: e.target.value });
          return;
        }
        setEditedValues((prev) => ({ ...prev, [field]: e.target.value }));
      }}
    />
  );

  return [
    {
      key: "work_place",
      label: "근무지",
      width: "240px",
      headerProps: {
        minW: "240px",
        whiteSpace: "nowrap",
        ...stickyWorkPlaceHeader,
      },
      cellProps: (row) => ({
        minW: "240px",
        maxW: "240px",
        whiteSpace: "nowrap",
        ...stickyWorkPlaceColumn,
        bg: checkedItems[row.rate_uuid] ? "green.50" : "white",
        _groupHover: {
          bg: checkedItems[row.rate_uuid] ? "green.50" : "gray.50",
        },
      }),
      render: (value, row) => {
        if (row.isNew || editingId === row.rate_uuid) {
          const selectedPlaceUuid = row.isNew
            ? row.admin_work_place_uuid || ""
            : editedValues.admin_work_place_uuid !== undefined
              ? editedValues.admin_work_place_uuid
              : getSelectedPlaceUuid(row, adminWorkPlaces);
          const selectablePlaces = adminWorkPlaces.filter((place) => {
            if (!place.work_place || place.work_place === EMPTY_PLACE) return false;
            if (place.admin_work_place_uuid === selectedPlaceUuid) return true;

            return !tableData.some((other) =>
              other.rate_uuid !== row.rate_uuid &&
              other.work_place !== EMPTY_PLACE &&
              (other.admin_work_place_uuid
                ? other.admin_work_place_uuid === place.admin_work_place_uuid
                : other.work_place === place.work_place)
            );
          });

          return (
            <Select
              size="sm"
              width="100%"
              minW="210px"
              value={selectedPlaceUuid}
              onChange={(e) => {
                const selectedPlace = adminWorkPlaces.find(
                  (place) => place.admin_work_place_uuid === e.target.value
                );

                const changes = {
                  admin_work_place_uuid: selectedPlace?.admin_work_place_uuid ?? "",
                  work_place: selectedPlace?.work_place ?? "",
                  ...RATE_FIELDS.reduce((next, field) => {
                    next[field.key] = selectedPlace?.[field.key] ?? "";
                    return next;
                  }, {}),
                };
                if (row.isNew) updateTempRate(row.rate_uuid, changes);
                else setEditedValues((prev) => ({ ...prev, ...changes }));
              }}
            >
              <option value="">근무지 선택</option>
              {selectablePlaces.map((place) => (
                <option
                  key={place.admin_work_place_uuid}
                  value={place.admin_work_place_uuid}
                >
                  {place.work_place}
                </option>
              ))}
            </Select>
          );
        }

        return value || EMPTY_PLACE;
      },
    },
    ...RATE_FIELDS.filter((field) => field.key !== "special_hourly_wage").map(
      (field) => ({
        key: field.key,
        label: field.label,
        width: "120px",
        headerProps: { minW: "120px", whiteSpace: "nowrap" },
        cellProps: { minW: "120px", whiteSpace: "nowrap" },
        render: (value, row) => {
          const fallbackField =
            field.key === "day_special_hourly_wage" ||
            field.key === "night_special_hourly_wage"
              ? "special_hourly_wage"
              : undefined;
          const displayValue = value ?? row[fallbackField];

          return row.isNew || editingId === row.rate_uuid
            ? renderInput(field.key, row, fallbackField)
            : formatNumber(displayValue);
        },
      })
    ),
    {
      key: "manage",
      label: "관리",
      width: "90px",
      headerProps: {
        minW: "90px",
        whiteSpace: "nowrap",
        ...stickyManageHeader,
      },
      cellProps: (row) => ({
        minW: "90px",
        whiteSpace: "nowrap",
        ...stickyManageColumn,
        bg: checkedItems[row.rate_uuid] ? "green.50" : "white",
        _groupHover: {
          bg: checkedItems[row.rate_uuid] ? "green.50" : "gray.50",
        },
      }),
      render: (_, row) => {
        if (row.isNew) {
          return (
            <IconButton
              icon={<FaTrash />}
              size="xs"
              colorScheme="red"
              aria-label="추가 취소"
              onClick={() => {
                setTempRates((prev) =>
                  prev.filter((rate) => rate.rate_uuid !== row.rate_uuid)
                );

                if (editingId === row.rate_uuid) {
                  setEditingId(null);
                  setEditedValues({});
                }
              }}
            />
          );
        }

        return (
          <Button
            leftIcon={<FaEdit />}
            size="sm"
            colorScheme="green"
            variant="ghost"
            onClick={() => {
              setEditingId(row.rate_uuid);
              setEditedValues(row);
            }}
          >
            수정
          </Button>
        );
      },
    },
  ];
};

export default getRateColumns;
