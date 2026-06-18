import { useEffect, useState, useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Image,
  Input,
  Select,
  SimpleGrid,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  EditIcon,
  RepeatIcon,
} from "@chakra-ui/icons";

import { useDailyPay } from "../../features/admin/work_place/hook/useWorkList";
import { userPlaceListColumns } from "./DailyPayColumns";
import { exportUserPayExcel } from "../../features/admin/api/google/GoogleDrive";
import ExcelExportModal from "../../features/admin/total_pay/section/ExcelExportModal";
import excelIcon from "../../assets/img/excel.png";

import AddRateModal from "../../features/admin/work_place/components/AddRateModal";
import SortableHeaderLabel from "../../features/common/SortableHeaderLabel";
import locationsList from "../../features/common/work_placeColumns/locationsList";

const formatWon = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toLocaleString()}원`;
};

const average = (arr) => {
  const valid = arr.filter((v) => v !== "" && v != null && !Number.isNaN(Number(v)));
  if (!valid.length) return null;

  return Math.round(
    valid.reduce((sum, value) => sum + Number(value), 0) / valid.length
  );
};

const averageRate = (rates, key) => average(rates.map((rate) => rate?.[key]));
const averageRateWithFallback = (rates, key, fallbackKey) =>
  average(rates.map((rate) => rate?.[key] ?? rate?.[fallbackKey]));
const PAGE_SIZE = 8;
const HEADER_HEIGHT = "54px";
const ROW_HEIGHT = "58px";

const fixedTableSx = {
  tableLayout: "fixed",
  "th, td": {
    h: ROW_HEIGHT,
    maxH: ROW_HEIGHT,
    py: 0,
    verticalAlign: "middle",
  },
  th: {
    h: HEADER_HEIGHT,
    maxH: HEADER_HEIGHT,
  },
};

function DailyPayFixedTable({ columns, data, onEdit, sortField, sortOrder, onSort }) {
  const detailColumns = columns.filter((column) => column.key !== "user_name");
  const sortableLabel = (column) => (
    <SortableHeaderLabel
      sortKey={column.key}
      sortField={sortField}
      sortOrder={sortOrder}
      onSort={onSort}
    >
      {column.label}
    </SortableHeaderLabel>
  );
  const nameColumn = columns.find((column) => column.key === "user_name");

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: "140px minmax(0, 1fr) 96px", md: "190px minmax(0, 1fr) 120px" }}
      w="100%"
      maxW="100%"
      overflow="hidden"
    >
      <Box minW={0} borderRight="1px solid" borderColor="gray.100">
        <Table variant="simple" size="md" sx={fixedTableSx}>
          <Thead bg="gray.50">
            <Tr>
              <Th whiteSpace="nowrap">
                {nameColumn ? sortableLabel(nameColumn) : "이름"}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row) => (
              <Tr key={row.user_uuid} _hover={{ bg: "gray.50" }}>
                <Td fontWeight="800" color="gray.800">
                  <Text noOfLines={1}>{row.user_name}</Text>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Box
        minW={0}
        maxW="100%"
        overflowX="auto"
        overflowY="hidden"
        pb={2}
        sx={{
          "&::-webkit-scrollbar": { height: "10px" },
          "&::-webkit-scrollbar-track": { background: "#EDF2F7" },
          "&::-webkit-scrollbar-thumb": { background: "#A0AEC0", borderRadius: "999px" },
        }}
      >
        <Table variant="simple" size="md" w="max-content" minW="1320px" sx={fixedTableSx}>
          <Thead bg="gray.50">
            <Tr>
              {detailColumns.map((column) => (
                <Th
                  key={column.key}
                  minW={column.key === "work_place" ? "280px" : "150px"}
                  textAlign="center"
                  whiteSpace="nowrap"
                >
                  {sortableLabel(column)}
                </Th>
              ))}
            </Tr>
          </Thead>

          <Tbody>
            {data.map((row) => (
              <Tr key={row.user_uuid} _hover={{ bg: "gray.50" }}>
                {detailColumns.map((column) => (
                  <Td
                    key={column.key}
                    minW={column.key === "work_place" ? "280px" : "150px"}
                    textAlign={column.key === "work_place" ? "left" : "center"}
                    whiteSpace="nowrap"
                    color="gray.700"
                  >
                    <Text noOfLines={1}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key] || "-"}
                    </Text>
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Box minW={0} borderLeft="1px solid" borderColor="gray.100">
        <Table variant="simple" size="md" sx={fixedTableSx}>
          <Thead bg="gray.50">
            <Tr>
              <Th textAlign="center" whiteSpace="nowrap">
                관리
              </Th>
            </Tr>
          </Thead>

          <Tbody>
            {data.map((row) => (
              <Tr key={row.user_uuid} _hover={{ bg: "gray.50" }}>
                <Td textAlign="center">
                  <Button
                    size="sm"
                    leftIcon={<EditIcon />}
                    colorScheme="green"
                    variant="ghost"
                    onClick={() => onEdit(row)}
                  >
                    수정
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}

function DailyPayPagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pageGroupSize = 5;
  const groupIndex = Math.floor((currentPage - 1) / pageGroupSize);
  const firstPage = groupIndex * pageGroupSize + 1;
  const lastPage = Math.min(firstPage + pageGroupSize - 1, totalPages);
  const pages = Array.from(
    { length: lastPage - firstPage + 1 },
    (_, index) => firstPage + index
  );

  return (
    <Flex justify="center" align="center" gap={2} px={6} py={5}>
      <Button
        size="sm"
        leftIcon={<ChevronLeftIcon />}
        variant="outline"
        isDisabled={currentPage === 1}
        onClick={() => onChange(Math.max(1, currentPage - 1))}
      >
        이전
      </Button>

      <HStack spacing={1}>
        {pages.map((page) => (
          <Button
            key={page}
            size="sm"
            minW="36px"
            variant={page === currentPage ? "solid" : "ghost"}
            colorScheme={page === currentPage ? "blue" : "gray"}
            onClick={() => onChange(page)}
          >
            {page}
          </Button>
        ))}
      </HStack>

      <Button
        size="sm"
        rightIcon={<ChevronRightIcon />}
        variant="outline"
        isDisabled={currentPage === totalPages}
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
      >
        다음
      </Button>
    </Flex>
  );
}

export default function DailyPayPage() {
  const toast = useToast();
  const exportDisclosure = useDisclosure();
  const { data, loading, fetchDailyPay } = useDailyPay();

  const [exportLoading, setExportLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchUserName, setSearchUserName] = useState("");
  const [searchWorkPlace, setSearchWorkPlace] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("user_name");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchDailyPay({}, toast);
  }, []);

  const mergedData = useMemo(() => {
    return data?.map((user) => {
      const rates = user.rates || [];
      const workPlaces = rates.map((r) => r.work_place).filter(Boolean);

      return {
        user_uuid: user.user_uuid,
        user_name: user.user_name,
        work_place: workPlaces.join(" / "),
        base_hourly_wage: averageRate(rates, "base_hourly_wage"),
        overtime_hourly_wage: averageRate(rates, "overtime_hourly_wage"),
        meal_ot_hourly_wage: averageRate(rates, "meal_ot_hourly_wage"),
        special_hourly_wage: averageRate(rates, "special_hourly_wage"),
        day_special_hourly_wage: averageRateWithFallback(
          rates,
          "day_special_hourly_wage",
          "special_hourly_wage"
        ),
        night_special_hourly_wage: averageRateWithFallback(
          rates,
          "night_special_hourly_wage",
          "special_hourly_wage"
        ),
        overnight_hourly_wage: averageRate(rates, "overnight_hourly_wage"),
        overnight_ot_hourly_wage: averageRate(rates, "overnight_ot_hourly_wage"),
        early_hourly_wage: averageRate(rates, "early_hourly_wage"),
      };
    }) || [];
  }, [data]);

  const summary = useMemo(() => {
    const places = new Set();
    data?.forEach((user) => {
      user.rates?.forEach((rate) => {
        if (rate.work_place) places.add(rate.work_place);
      });
    });

    return {
      users: mergedData.length,
      places: places.size,
      averageBasePay: average(mergedData.map((row) => row.base_hourly_wage)),
    };
  }, [data, mergedData]);

  const sortedData = useMemo(() => {
    const nextData = [...mergedData];
    const direction = sortOrder === "asc" ? 1 : -1;

    const compareText = (aValue, bValue, compareDirection = 1) =>
      String(aValue || "").localeCompare(String(bValue || ""), "ko") * compareDirection;

    nextData.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const aNumber = Number(aValue);
      const bNumber = Number(bValue);

      if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
        return (aNumber - bNumber) * direction || compareText(a.user_name, b.user_name);
      }

      if (sortField === "user_name") {
        return compareText(a.user_name, b.user_name, direction) || compareText(a.work_place, b.work_place);
      }

      if (sortField === "work_place") {
        return compareText(a.work_place, b.work_place, direction) || compareText(a.user_name, b.user_name);
      }

      return compareText(aValue, bValue, direction) || compareText(a.user_name, b.user_name);
    });

    return nextData;
  }, [mergedData, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [currentPage, sortedData]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const displayColumns = useMemo(() => (
    userPlaceListColumns.map((column) => ({
      ...column,
      render:
        column.key.includes("wage")
          ? (value) => formatWon(value)
          : column.render,
    }))
  ), []);

  const handleEdit = (row) => {
    const user = data.find((u) => u.user_uuid === row.user_uuid);
    setSelectedUser(user);
  };

  const handleSort = (field) => {
    setCurrentPage(1);
    setSortField((prevField) => {
      if (prevField === field) {
        setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
        return prevField;
      }

      setSortOrder("asc");
      return field;
    });
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchDailyPay({
      user_name: searchUserName,
      work_place: searchWorkPlace,
    }, toast);
  };

  const handleResetSearch = () => {
    setSearchUserName("");
    setSearchWorkPlace("");
    setCurrentPage(1);
    fetchDailyPay({}, toast);
  };

  const statCards = [
    { label: "등록 직원(명)", value: `${summary.users.toLocaleString()}` },
    { label: "근무지 수", value: `${summary.places.toLocaleString()}` },
    { label: "평균 기본일급", value: formatWon(summary.averageBasePay) },
  ];

  const handleExcelExport = async (_workPlace, date) => {
    try {
      setExportLoading(true);
      const result = await exportUserPayExcel(date);

      if (!result.success) {
        throw new Error(result.message || "엑셀 생성에 실패했습니다.");
      }

      toast({
        title: "엑셀 생성 완료",
        description: result.message || "일급관리 엑셀 파일이 Google Drive에 생성되었습니다.",
        status: "success",
        duration: 3000,
      });
      exportDisclosure.onClose();
    } catch (err) {
      toast({
        title: "엑셀 생성 실패",
        description: err.message || "잠시 후 다시 시도해주세요.",
        status: "error",
        duration: 3000,
      });
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <Box minH="100%" bg="gray.50" p={{ base: 4, md: 6 }} maxW="100%" overflowX="hidden">
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
        mb={6}
      >
        <Box>
          <HStack spacing={3} mb={2}>
            <Heading size="lg" color="gray.800">
              일급 관리
            </Heading>
            <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
              {loading ? "불러오는 중" : "최신 데이터"}
            </Badge>
          </HStack>
          <Text color="gray.500" fontSize="sm">
            직원별 근무지 일급 단가를 확인하고 수정합니다.
          </Text>
        </Box>

        <HStack spacing={2} justify={{ base: "flex-start", md: "flex-end" }}>
          <Tooltip label="일급관리 엑셀 생성" hasArrow>
            <Button
              leftIcon={<DownloadIcon />}
              rightIcon={<Image src={excelIcon} w="22px" h="22px" alt="excel" />}
              colorScheme="green"
              variant="outline"
              size="sm"
              minW="92px"
              onClick={exportDisclosure.onOpen}
            >
              Excel
            </Button>
          </Tooltip>
          <Button
            leftIcon={<RepeatIcon />}
            variant="outline"
            size="sm"
            onClick={handleResetSearch}
            isLoading={loading}
          >
            전체보기
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        {statCards.map((card) => (
          <Box
            key={card.label}
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="lg"
            p={5}
            boxShadow="sm"
          >
            <Text fontSize="sm" fontWeight="700" color="gray.500" mb={2}>
              {card.label}
            </Text>
            <Text fontSize="2xl" fontWeight="900" color="gray.800">
              {card.value}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.100"
        borderRadius="lg"
        boxShadow="sm"
        px={{ base: 4, md: 6 }}
        py={4}
        mb={6}
      >
        <Flex gap={3} align="center" justify="flex-start" wrap="wrap">
          <Input
            size="sm"
            w={{ base: "100%", md: "170px" }}
            placeholder="직원명 검색"
            value={searchUserName}
            onChange={(e) => setSearchUserName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <Select
            size="sm"
            w={{ base: "100%", md: "220px" }}
            value={searchWorkPlace}
            onChange={(e) => setSearchWorkPlace(e.target.value)}
          >
            <option value="">근무지 전체</option>
            {locationsList.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </Select>
          <Button
            colorScheme="blue"
            size="sm"
            onClick={handleSearch}
            isLoading={loading}
          >
            조회
          </Button>
        </Flex>
      </Box>

      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.100"
        borderRadius="lg"
        boxShadow="sm"
        overflow="hidden"
        maxW="100%"
      >
        <Flex
          justify="space-between"
          align="center"
          px={6}
          py={4}
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <Box>
            <Heading size="sm" color="gray.800">
              직원별 일급 단가
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              평균 단가는 등록된 근무지 단가를 기준으로 계산됩니다.
            </Text>
          </Box>
          <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
            {mergedData.length.toLocaleString()}건
          </Badge>
        </Flex>

        <Box p={0}>
          <DailyPayFixedTable
            columns={displayColumns}
            data={pagedData}
            onEdit={handleEdit}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
          <DailyPayPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={setCurrentPage}
          />
        </Box>
      </Box>

      {selectedUser && (
        <AddRateModal
          isOpen
          mode="edit"
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => {
            fetchDailyPay({}, toast);
            setSelectedUser(null);
          }}
        />
      )}

      <ExcelExportModal
        isOpen={exportDisclosure.isOpen}
        onClose={exportDisclosure.onClose}
        onConfirm={handleExcelExport}
        loading={exportLoading}
        showWorkPlace={false}
      />
    </Box>
  );
}
