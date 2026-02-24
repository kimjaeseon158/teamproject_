// rateColumns.js

import { Input, IconButton } from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";

const getRateColumns = ({
  editingId,
  editedValues,
  setEditedValues,
  setEditingId,
}) => [
  {
    key: "work_place",
    label: "근무지",
    width: "140px",
    render: (value, row) => {
      if (editingId === row.rate_uuid) {
        return (
          <Input
            size="sm"
            value={editedValues.work_place ?? ""}
            onChange={(e) =>
              setEditedValues((prev) => ({
                ...prev,
                work_place: e.target.value,
              }))
            }
          />
        );
      }
      return value ?? "-";
    },
  },

  {
    key: "base_hourly_wage",
    label: "기본일당",
    width: "120px",
    render: (value, row) => {
      if (editingId === row.rate_uuid) {
        return (
          <Input
            size="sm"
            value={editedValues.base_hourly_wage ?? ""}
            onChange={(e) =>
              setEditedValues((prev) => ({
                ...prev,
                base_hourly_wage: e.target.value,
              }))
            }
          />
        );
      }
      return value != null ? value.toLocaleString() : "-";
    },
  },

  {
    key: "overtime_hourly_wage",
    label: "연장일당",
    width: "120px",
    render: (value, row) => {
      if (editingId === row.rate_uuid) {
        return (
          <Input
            size="sm"
            value={editedValues.overtime_hourly_wage ?? ""}
            onChange={(e) =>
              setEditedValues((prev) => ({
                ...prev,
                overtime_hourly_wage: e.target.value,
              }))
            }
          />
        );
      }
      return value != null ? value.toLocaleString() : "-";
    },
  },

  {
    key: "meal_ot_hourly_wage",
    label: "식대연장",
    width: "120px",
    render: (value, row) => {
      if (editingId === row.rate_uuid) {
        return (
          <Input
            size="sm"
            value={editedValues.meal_ot_hourly_wage ?? ""}
            onChange={(e) =>
              setEditedValues((prev) => ({
                ...prev,
                meal_ot_hourly_wage: e.target.value,
              }))
            }
          />
        );
      }
      return value != null ? value.toLocaleString() : "-";
    },
  },

  {
    key: "special_hourly_wage",
    label: "특수수당",
    width: "120px",
    render: (value, row) => {
      if (editingId === row.rate_uuid) {
        return (
          <Input
            size="sm"
            value={editedValues.special_hourly_wage ?? ""}
            onChange={(e) =>
              setEditedValues((prev) => ({
                ...prev,
                special_hourly_wage: e.target.value,
              }))
            }
          />
        );
      }
      return value != null ? value.toLocaleString() : "-";
    },
  },

  {
    key: "overnight_hourly_wage",
    label: "야간일당",
    width: "120px",
    render: (value, row) => {
      if (editingId === row.rate_uuid) {
        return (
          <Input
            size="sm"
            value={editedValues.overnight_hourly_wage ?? ""}
            onChange={(e) =>
              setEditedValues((prev) => ({
                ...prev,
                overnight_hourly_wage: e.target.value,
              }))
            }
          />
        );
      }
      return value != null ? value.toLocaleString() : "-";
    },
  },

  {
    key: "overnight_ot_hourly_wage",
    label: "야간연장",
    width: "120px",
    render: (value, row) => {
      if (editingId === row.rate_uuid) {
        return (
          <Input
            size="sm"
            value={editedValues.overnight_ot_hourly_wage ?? ""}
            onChange={(e) =>
              setEditedValues((prev) => ({
                ...prev,
                overnight_ot_hourly_wage: e.target.value,
              }))
            }
          />
        );
      }
      return value != null ? value.toLocaleString() : "-";
    },
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

export default getRateColumns;