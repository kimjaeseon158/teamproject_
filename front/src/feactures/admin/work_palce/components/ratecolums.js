// rateColumns.js

import { Input, IconButton } from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";

const getRateColumns = ({
  editingId,
  editedValues,
  setEditedValues,
  setEditingId,
}) => {

  const renderInput = (field, row) => (
    <Input
      size="sm"
      width="100%"
      minW="120px"
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
      render: (value, row) =>
        editingId === row.rate_uuid
          ? renderInput("work_place", row)
          : value ?? "-",
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
      label: "특수수당",
      width: "120px",
      render: (value, row) =>
        editingId === row.rate_uuid
          ? renderInput("special_hourly_wage", row)
          : value != null ? Number(value).toLocaleString() : "-",
    },

    {
      key: "overnight_hourly_wage",
      label: "야간일당",
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
      key: "edit",
      label: "관리",
      width: "70px",
      render: (_, row) => (
        <IconButton
          icon={<FaEdit />}
          size="xs"
          onClick={() => {
            setEditingId(row.rate_uuid);
            setEditedValues(row);
          }}
        />
      ),
    },

  ];
};

export default getRateColumns;