// rateColumns.js

import { Input, IconButton, Select  } from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";
import locationsList from "../../../common/work_placeCloums/locationsList";

const getRateColumns = ({
  editingId,
  editedValues,
  setEditedValues,
  setEditingId,
  setTempRates,
}) => {

  const renderInput = (field, row) => (
    <Input
      size="sm"
      width="100%"
      minW="80px"
      value={
        editedValues[field] !== undefined
          ? editedValues[field]
          : row[field] ?? ""
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
      width: "220px",
      render: (value, row) => {

        if (editingId === row.rate_uuid) {
          return (
            <Select
              size="sm"
              width="100%"
              value={
                editedValues.work_place !== undefined
                  ? editedValues.work_place
                  : row.work_place ?? "미지정"
              }
              onChange={(e) =>
                setEditedValues((prev) => ({
                  ...prev,
                  work_place: e.target.value,
                }))
              }
            >
              <option value="미지정">미지정</option>
              {locationsList.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
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
      key: "special_hourly_wage",
      label: "주간 특근",
      width: "120px",
      render: (value, row) =>
        editingId === row.rate_uuid
          ? renderInput("special_hourly_wage", row)
          : value != null ? Number(value).toLocaleString() : "-",
    },

    {
      key: "overnight_hourly_wage",
      label: "야간 특근",
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
