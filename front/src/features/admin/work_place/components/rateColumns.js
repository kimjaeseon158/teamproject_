import { Button, IconButton, Input, Select } from "@chakra-ui/react";
import { FaEdit, FaTrash } from "react-icons/fa";

import DatePicker from "../../../common/DatePicker";
import {
  EMPTY_PLACE,
  RATE_FIELDS,
  initialRateForm,
} from "../constants/rateFields";

const getSelectedPlaceUuid = (row, adminWorkPlaces) => {
  if (row.admin_work_place_uuid) return row.admin_work_place_uuid;

  return (
    adminWorkPlaces.find((place) => place.work_place === row.work_place)
      ?.admin_work_place_uuid ?? ""
  );
};

const formatNumber = (value) =>
  value != null && value !== "" ? Number(value).toLocaleString() : "-";

const formatDate = (value, fallback) => value || fallback;

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

const stickyDateColumn = (right, showDivider = false) => ({
  position: "sticky",
  right,
  zIndex: 3,
  bg: "white",
  backgroundClip: "padding-box",
  boxShadow: showDivider ? "-2px 0 0 #EDF2F7" : "none",
  _groupHover: { bg: "gray.50" },
});

const stickyDateHeader = (right, showDivider = false) => ({
  ...stickyDateColumn(right, showDivider),
  zIndex: 4,
  bg: "gray.50",
});

const stickyWorkPlaceColumn = {
  position: "sticky",
  left: { base: "56px", xl: "72px" },
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
      width: { base: "150px", xl: "240px" },
      headerProps: {
        minW: { base: "150px", xl: "240px" },
        maxW: { base: "150px", xl: "240px" },
        whiteSpace: "nowrap",
        ...stickyWorkPlaceHeader,
      },
      cellProps: (row) => ({
        minW: { base: "150px", xl: "240px" },
        maxW: { base: "150px", xl: "240px" },
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
          const selectablePlaces = adminWorkPlaces.filter(
            (place) => place.work_place && place.work_place !== EMPTY_PLACE
          );

          return (
            <Select
              size="sm"
              width="100%"
              minW={{ base: "126px", xl: "210px" }}
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
        width: { base: "80px", xl: "120px" },
        headerProps: { minW: { base: "80px", xl: "120px" }, whiteSpace: "nowrap" },
        cellProps: { minW: { base: "80px", xl: "120px" }, whiteSpace: "nowrap", px: { base: 2, xl: 6 } },
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
      key: "effective_start_date",
      label: "시작일",
      width: { base: "80px", xl: "130px" },
      headerProps: {
        w: { base: "80px", xl: "130px" },
        minW: { base: "80px", xl: "130px" },
        maxW: { base: "80px", xl: "130px" },
        whiteSpace: "nowrap",
        ...stickyDateHeader({ base: "180px", xl: "220px" }, true),
      },
      cellProps: (row) => ({
        w: { base: "80px", xl: "130px" },
        minW: { base: "80px", xl: "130px" },
        maxW: { base: "80px", xl: "130px" },
        whiteSpace: "nowrap",
        ...stickyDateColumn({ base: "180px", xl: "220px" }, true),
        bg: checkedItems[row.rate_uuid] ? "green.50" : "white",
        _groupHover: {
          bg: checkedItems[row.rate_uuid] ? "green.50" : "gray.50",
        },
      }),
      render: (value, row) => {
        const displayValue =
          row.isNew
            ? row.effective_start_date || ""
            : editedValues.effective_start_date !== undefined
              ? editedValues.effective_start_date
              : value ?? row.start_date ?? row.started_at ?? "";

        if (row.isNew || editingId === row.rate_uuid) {
          return (
            <DatePicker
              size="sm"
              width="124px"
              value={displayValue}
              onChange={(date) => {
                const changes = { effective_start_date: date };
                if (row.isNew) updateTempRate(row.rate_uuid, changes);
                else setEditedValues((prev) => ({ ...prev, ...changes }));
              }}
            />
          );
        }

        return formatDate(displayValue, "-");
      },
    },
    {
      key: "effective_end_date",
      label: "종료일",
      width: { base: "80px", xl: "130px" },
      headerProps: {
        w: { base: "80px", xl: "130px" },
        minW: { base: "80px", xl: "130px" },
        maxW: { base: "80px", xl: "130px" },
        whiteSpace: "nowrap",
        ...stickyDateHeader({ base: "80px", xl: "90px" }),
      },
      cellProps: (row) => ({
        w: { base: "80px", xl: "130px" },
        minW: { base: "80px", xl: "130px" },
        maxW: { base: "80px", xl: "130px" },
        whiteSpace: "nowrap",
        ...stickyDateColumn({ base: "80px", xl: "90px" }),
        bg: checkedItems[row.rate_uuid] ? "green.50" : "white",
        _groupHover: {
          bg: checkedItems[row.rate_uuid] ? "green.50" : "gray.50",
        },
      }),
      render: (value, row) => {
        const displayValue =
          row.isNew
            ? row.effective_end_date || ""
            : editedValues.effective_end_date !== undefined
              ? editedValues.effective_end_date || ""
              : value ?? row.end_date ?? row.ended_at ?? "";

        if (row.isNew || editingId === row.rate_uuid) {
          return (
            <DatePicker
              size="sm"
              width="124px"
              value={displayValue}
              isClearable
              onChange={(date) => {
                const changes = { effective_end_date: date || null };
                if (row.isNew) updateTempRate(row.rate_uuid, changes);
                else setEditedValues((prev) => ({ ...prev, ...changes }));
              }}
            />
          );
        }

        return formatDate(displayValue, "종료일 없음");
      },
    },
    {
      key: "manage",
      label: "관리",
      width: { base: "70px", xl: "90px" },
      headerProps: {
        w: { base: "70px", xl: "90px" },
        minW: { base: "70px", xl: "90px" },
        maxW: { base: "70px", xl: "90px" },
        whiteSpace: "nowrap",
        ...stickyManageHeader,
      },
      cellProps: (row) => ({
        w: { base: "70px", xl: "90px" },
        minW: { base: "70px", xl: "90px" },
        maxW: { base: "70px", xl: "90px" },
        whiteSpace: "nowrap",
        ...stickyManageColumn,
        bg: checkedItems[row.rate_uuid] ? "green.50" : "white",
        _groupHover: {
          bg: checkedItems[row.rate_uuid] ? "green.50" : "gray.50",
        },
      }),
      render: (_, row) => {
        if (row.isPlaceholder) {
          return (
            <Button
              leftIcon={<FaEdit />}
              size="xs"
              minW="64px"
              px={2}
              iconSpacing={1.5}
              colorScheme="green"
              variant="ghost"
              onClick={() => {
                setTempRates((prev) => [
                  ...prev,
                  {
                    rate_uuid: `temp-${Date.now()}`,
                    ...initialRateForm,
                    isNew: true,
                  },
                ]);
              }}
            >
              수정
            </Button>
          );
        }

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
            size="xs"
            minW="64px"
            px={2}
            iconSpacing={1.5}
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
