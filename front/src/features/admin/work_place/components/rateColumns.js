// rateColumns.js

import { Input, IconButton, Select  } from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";

const RATE_FIELDS = [
  "base_hourly_wage",
  "overtime_hourly_wage",
  "meal_ot_hourly_wage",
  "special_hourly_wage",
  "day_special_hourly_wage",
  "night_special_hourly_wage",
  "overnight_hourly_wage",
  "overnight_ot_hourly_wage",
  "early_hourly_wage",
];

const getSelectedPlaceUuid = (row, adminWorkPlaces) => {
  if (row.admin_work_place_uuid) return row.admin_work_place_uuid;
  return adminWorkPlaces.find((place) => place.work_place === row.work_place)
    ?.admin_work_place_uuid ?? "";
};

const getRateColumns = ({
  editingId,
  editedValues,
  setEditedValues,
  setEditingId,
  setTempRates,
  adminWorkPlaces = [],
}) => {

  const renderInput = (field, row, fallbackField) => (
    <Input
      size="sm"
      width="100%"
      minW="80px"
      value={
        editedValues[field] !== undefined
          ? editedValues[field]
          : row[field] ?? row[fallbackField] ?? ""
      }
      onChange={(e) =>
        setEditedValues((prev) => ({
          ...prev,
          [field]: e.target.value,
        }))
      }
    />
  );

  return [
    {
      key: "work_place",
      label: "근무지",
      width: "200px",
      render: (value, row) => {

        if (editingId === row.rate_uuid) {
          return (
            <Select
              size="sm"
              width="100%"
              minW="170px"
              value={
                editedValues.admin_work_place_uuid !== undefined
                  ? editedValues.admin_work_place_uuid
                  : getSelectedPlaceUuid(row, adminWorkPlaces)
              }
              onChange={(e) => {
                const selectedPlace = adminWorkPlaces.find(
                  (place) => place.admin_work_place_uuid === e.target.value
                );

                setEditedValues((prev) => ({
                  ...prev,
                  admin_work_place_uuid: selectedPlace?.admin_work_place_uuid ?? "",
                  work_place: selectedPlace?.work_place ?? "",
                  ...RATE_FIELDS.reduce((next, field) => {
                    next[field] = selectedPlace?.[field] ?? "";
                    return next;
                  }, {}),
                }));
              }}
            >
              <option value="">미지정</option>
              {adminWorkPlaces.map((place) => (
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

        return value ?? "미지정";
      },
    },

    {
      key: "base_hourly_wage",
      label: "기본일당",
      width: "120px",
      render: (value, row) =>
        editingId === row.rate_uuid
          ? renderInput("base_hourly_wage", row)
          : value != null ? Number(value).toLocaleString() : "-",
    },

    {
      key: "overtime_hourly_wage",
      label: "연장일당",
      width: "120px",
      render: (value, row) =>
        editingId === row.rate_uuid
          ? renderInput("overtime_hourly_wage", row)
          : value != null ? Number(value).toLocaleString() : "-",
    },

    {
      key: "meal_ot_hourly_wage",
      label: "식대연장",
      width: "120px",
      render: (value, row) =>
        editingId === row.rate_uuid
          ? renderInput("meal_ot_hourly_wage", row)
          : value != null ? Number(value).toLocaleString() : "-",
    },

    {
      key: "day_special_hourly_wage",
      label: "주간 특근",
      width: "120px",
      render: (value, row) => {
        const displayValue = value ?? row.special_hourly_wage;
        return editingId === row.rate_uuid
          ? renderInput("day_special_hourly_wage", row, "special_hourly_wage")
          : displayValue != null ? Number(displayValue).toLocaleString() : "-";
      },
    },

    {
      key: "night_special_hourly_wage",
      label: "야간 특근",
      width: "120px",
      render: (value, row) => {
        const displayValue = value ?? row.special_hourly_wage;
        return editingId === row.rate_uuid
          ? renderInput("night_special_hourly_wage", row, "special_hourly_wage")
          : displayValue != null ? Number(displayValue).toLocaleString() : "-";
      },
    },

    {
      key: "overnight_hourly_wage",
      label: "철야",
      width: "120px",
      render: (value, row) =>
        editingId === row.rate_uuid
          ? renderInput("overnight_hourly_wage", row)
          : value != null ? Number(value).toLocaleString() : "-",
    },

    {
      key: "overnight_ot_hourly_wage",
      label: "야간연장",
      width: "120px",
      render: (value, row) =>
        editingId === row.rate_uuid
          ? renderInput("overnight_ot_hourly_wage", row)
          : value != null ? Number(value).toLocaleString() : "-",
    },

    {
      key: "early_hourly_wage",
      label: "조기 출근",
      width: "120px",
      render: (value, row) =>
        editingId === row.rate_uuid
          ? renderInput("early_hourly_wage", row)
          : value != null ? Number(value).toLocaleString() : "-",
    },

   {
      key: "manage",
      label: "관리",
      width: "70px",
      render: (_, row) => {

        // 🔥 새로 추가된 row → 취소(삭제) 아이콘
        if (row.isNew) {
          return (
            <IconButton
              icon={<FaTrash />}
              size="xs"
              colorScheme="red"
              aria-label="취소"
              onClick={() => {
                setTempRates(prev =>
                  prev.filter(r => r.rate_uuid !== row.rate_uuid)
                );

                if (editingId === row.rate_uuid) {
                  setEditingId(null);
                  setEditedValues({});
                }
              }}
            />
          );
        }

        // 🔥 기존 row → 수정 아이콘
        return (
          <IconButton
            icon={<FaEdit />}
            size="xs"
            aria-label="수정"
            onClick={() => {
              setEditingId(row.rate_uuid);
              setEditedValues(row);
            }}
          />
        );
      },
    }

  ];
};

export default getRateColumns;
