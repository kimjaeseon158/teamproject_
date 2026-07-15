import { IconButton, Input, Select } from "@chakra-ui/react";
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
                    next[field.key] = selectedPlace?.[field.key] ?? "";
                    return next;
                  }, {}),
                }));
              }}
            >
              <option value="">{EMPTY_PLACE}</option>
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

        return value || EMPTY_PLACE;
      },
    },
    ...RATE_FIELDS.filter((field) => field.key !== "special_hourly_wage").map(
      (field) => ({
        key: field.key,
        label: field.label,
        width: "120px",
        render: (value, row) => {
          const fallbackField =
            field.key === "day_special_hourly_wage" ||
            field.key === "night_special_hourly_wage"
              ? "special_hourly_wage"
              : undefined;
          const displayValue = value ?? row[fallbackField];

          return editingId === row.rate_uuid
            ? renderInput(field.key, row, fallbackField)
            : formatNumber(displayValue);
        },
      })
    ),
    {
      key: "manage",
      label: "관리",
      width: "70px",
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
    },
  ];
};

export default getRateColumns;
