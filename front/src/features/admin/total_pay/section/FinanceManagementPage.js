import {
  Badge, Box, Button, Card, Flex, FormControl, FormLabel, Grid, Heading,
  Icon, Input, InputGroup, InputLeftElement, Select, SimpleGrid, Stack,
  Table, TableContainer, Tbody, Td, Text, Th, Thead, Tooltip, Tr,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FiArrowDown, FiArrowUp, FiCheck, FiChevronLeft, FiChevronRight,
  FiCreditCard, FiLock, FiSearch,
} from "react-icons/fi";
import MonthPicker from "../../../common/MonthPicker";
import DatePicker from "../../../common/DatePicker";
import TodayButton from "../../../common/TodayButton";
import { DEFAULT_TABLE_PAGE_SIZE, TABLE_PAGE_SIZE_OPTIONS } from "../../../../constants/pagination";

const isoDate = (date) => {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const won = (value) => `${Number(value || 0).toLocaleString("ko-KR")}원`;

const getCurrentMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

const getFinanceCategory = (item, income, categories) => {
  if (income) return "매출";
  const text = `${item.name || ""} ${item.detail || ""}`;
  if (text.includes("급여")) return "급여";
  return categories.find((category) => category !== "기타" && text.includes(category)) || "기타";
};

function SummaryCard({ label, value, icon, tone }) {
  const colors = {
    green: { color: "#12a56f", bg: "#dcf7e9" },
    red: { color: "#f04444", bg: "#ffe3e3" },
    orange: { color: "#f59e0b", bg: "#fff0d3" },
  }[tone];

  return (
    <Card border="1px solid #e4e9f0" boxShadow="0 2px 8px rgba(15,23,42,.035)" borderRadius="9px">
      <Flex px={{ base: 5, xl: 7 }} py={6} minH="118px" align="center" justify="space-between">
        <Box>
          <Text color="#354052" fontWeight="700" fontSize="sm" mb={2}>{label}</Text>
          <Text color="#0d1728" fontWeight="800" fontSize={{ base: "2xl", xl: "27px" }} letterSpacing="-.5px">{value}</Text>
        </Box>
        <Flex w="50px" h="50px" borderRadius="full" bg={colors.bg} color={colors.color} align="center" justify="center">
          <Icon as={icon} boxSize={6} />
        </Flex>
      </Flex>
    </Card>
  );
}

export default function FinanceManagementPage({
  type, data, total, range, setRange, onSave, onUpdate,
}) {
  const income = type === "income";
  const accent = income ? "#0aa683" : "#ff4545";
  const softAccent = income ? "#e1f7f1" : "#ffe5e5";
  const itemLabel = "카테고리";
  const categories = income ? ["매출"] : ["식비", "교통", "운영비", "기타"];
  const filterCategories = income ? categories : ["급여", ...categories];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_TABLE_PAGE_SIZE);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    amount: "",
    date: isoDate(new Date()),
    category: categories[0],
    paymentMethod: "카드",
    name: "",
    detail: "",
  });

  const rows = data.filter((item) => {
    const text = `${item.name || ""} ${item.detail || ""}`.toLowerCase();
    const queryMatches = text.includes(query.trim().toLowerCase());
    const categoryMatches = category === "전체" || getFinanceCategory(item, income, categories) === category;
    return queryMatches && categoryMatches;
  });

  const monthValue = range?.from ? isoDate(range.from).slice(0, 7) : "";
  const currentMonth = getCurrentMonth();
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [monthValue, pageSize, query, category]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const changeMonth = (value) => {
    if (!value) return;
    const [year, month] = value.split("-").map(Number);
    setRange({ from: new Date(year, month - 1, 1), to: new Date(year, month, 0) });
  };

  const moveMonth = (amount) => {
    const [year, month] = monthValue.split("-").map(Number);
    const base = year && month ? new Date(year, month - 1, 1) : new Date();
    base.setMonth(base.getMonth() + amount);
    changeMonth(`${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}`);
  };

  const moveToToday = () => {
    const today = new Date();
    setRange({ from: new Date(today.getFullYear(), today.getMonth(), 1), to: today });
  };

  const resetForm = () => {
    setEditingItem(null);
    setForm({
      amount: "",
      date: isoDate(new Date()),
      category: categories[0],
      paymentMethod: "카드",
      name: "",
      detail: "",
    });
  };

  const startEdit = (item) => {
    const itemCategory = getFinanceCategory(item, income, categories);
    if (!income && itemCategory === "급여") return;

    setEditingItem(item);
    setForm({
      amount: String(item.amount || ""),
      date: isoDate(item.date),
      category: itemCategory,
      paymentMethod: item.paymentMethod || "카드",
      name: income ? (item.name || "") : (item.detail || ""),
      detail: income ? (item.detail || "") : "",
    });
  };

  const submit = async () => {
    if (!form.amount || !form.name.trim()) return;
    try {
      setSaving(true);
      const payload = {
        ...(editingItem || {}),
        date: new Date(`${form.date}T00:00:00`),
        name: income ? form.name.trim() : form.category,
        detail: income ? form.detail.trim() : form.name.trim(),
        paymentMethod: income ? "" : form.paymentMethod,
        amount: Number(form.amount),
      };

      if (editingItem) await onUpdate(payload);
      else await onSave([payload]);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box minH="calc(100vh - 92px)" bg="#f7f9fc" p={{ base: 2, lg: 4 }}>
      <Grid
        templateColumns={{ base: "1fr", xl: "minmax(0, 2.25fr) minmax(360px, .95fr)" }}
        gap={5}
        alignItems={{ base: "start", xl: "stretch" }}
        minH={{ xl: "calc(100vh - 140px)" }}
      >
        <Stack spacing={5} minW={0} minH={{ xl: "calc(100vh - 140px)" }}>
          <SimpleGrid columns={1} spacing={4}>
            <SummaryCard label={`이번 달 ${income ? "수입" : "지출"}`} value={won(total)} icon={income ? FiArrowDown : FiArrowUp} tone={income ? "green" : "red"} />
          </SimpleGrid>

          <Card
            border="1px solid #e4e9f0"
            borderRadius="10px"
            boxShadow="0 2px 8px rgba(15,23,42,.035)"
            p={4}
            flex={{ xl: "1" }}
            display="flex"
            flexDirection="column"
          >
            <Flex gap={3} mb={4} direction={{ base: "column", md: "row" }}>
              <Select value={category} onChange={(e) => setCategory(e.target.value)} w={{ base: "100%", md: "220px" }} flexShrink={0} h="42px" fontSize="sm">
                <option value="전체">전체 {itemLabel}</option>
                {filterCategories.map((item) => <option key={item}>{item}</option>)}
              </Select>
              <InputGroup flex="1">
                <InputLeftElement pointerEvents="none"><FiSearch color="#607085" /></InputLeftElement>
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="내역 검색" h="42px" fontSize="sm" />
              </InputGroup>
              <Flex w={{ base: "100%", md: "330px" }} flexShrink={0} gap={1}>
                <Button
                  aria-label="이전 달"
                  variant="outline"
                  h="42px"
                  minW="42px"
                  px={0}
                  onClick={() => moveMonth(-1)}
                >
                  <Icon as={FiChevronLeft} />
                </Button>
                <Box flex="1">
                  <MonthPicker
                    value={monthValue}
                    onChange={changeMonth}
                    width="100%"
                    height="42px"
                    borderRadius="md"
                    placement="bottom-end"
                  />
                </Box>
                <Button
                  aria-label="다음 달"
                  variant="outline"
                  h="42px"
                  minW="42px"
                  px={0}
                  onClick={() => moveMonth(1)}
                >
                  <Icon as={FiChevronRight} />
                </Button>
                <TodayButton
                  showIcon={false}
                  h="42px"
                  tooltip="오늘이 포함된 달로 이동"
                  isDisabled={monthValue === currentMonth}
                  onClick={moveToToday}
                />
              </Flex>
            </Flex>

            <TableContainer border="1px solid #e2e8f0" borderRadius="8px" flex={{ xl: "1" }}>
              <Table size="sm" tableLayout="fixed" minW={income ? "680px" : "810px"}>
                <Thead bg="#f8fafc">
                  <Tr>
                    <Th w="130px" py={3} color="#4a5568" fontSize="xs">{income ? "입금일" : "일자"}</Th>
                    <Th py={3} color="#4a5568" fontSize="xs">내역</Th>
                    <Th w="160px" py={3} color="#4a5568" fontSize="xs">{itemLabel}</Th>
                    <Th w="150px" py={3} color="#4a5568" fontSize="xs" textAlign="right">금액</Th>
                    {!income && <Th w="130px" py={3} color="#4a5568" fontSize="xs">결제 수단</Th>}
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedRows.map((item, index) => (
                    <Tr
                      key={item.id || index}
                      cursor={!income && getFinanceCategory(item, income, categories) === "급여" ? "not-allowed" : "pointer"}
                      bg={editingItem?.id === item.id ? softAccent : "white"}
                      _hover={{ bg: !income && getFinanceCategory(item, income, categories) === "급여" ? "white" : "#f8fafc" }}
                      onClick={() => startEdit(item)}
                    >
                      <Td w="130px" py={3} whiteSpace="nowrap">{isoDate(item.date)}</Td>
                      <Td fontWeight="600" overflow="hidden">
                        <Tooltip
                          label={income ? (item.name || "-") : (getFinanceCategory(item, income, categories) === "급여" ? (item.name || "-") : (item.detail || "-"))}
                          hasArrow
                          openDelay={400}
                        >
                          <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                            {income ? (item.name || "-") : (getFinanceCategory(item, income, categories) === "급여" ? (item.name || "-") : (item.detail || "-"))}
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td>
                        {!income && getFinanceCategory(item, income, categories) === "급여" ? (
                          <Tooltip label="근무 기록을 기준으로 자동 계산된 급여이므로 수정할 수 없습니다." hasArrow>
                            <Badge px={2} py={1} borderRadius="full" bg="#f1f5f9" color="#64748b" textTransform="none">
                              <Icon as={FiLock} mr={1} boxSize={3} />급여 · 자동 계산
                            </Badge>
                          </Tooltip>
                        ) : (
                          <Badge px={2} py={1} borderRadius="full" bg={softAccent} color={accent} textTransform="none">{getFinanceCategory(item, income, categories)}</Badge>
                        )}
                      </Td>
                      <Td w="150px" fontWeight="700" whiteSpace="nowrap" textAlign="right">{won(item.amount)}</Td>
                      {!income && (
                        <Td w="130px" color="#435066" overflow="hidden">
                          <Tooltip
                            label={getFinanceCategory(item, income, categories) === "급여" ? "계좌이체" : (item.paymentMethod || "미지정")}
                            hasArrow
                            openDelay={400}
                          >
                            <Text overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                              {getFinanceCategory(item, income, categories) === "급여"
                                ? "계좌이체"
                                : (item.paymentMethod || "미지정")}
                            </Text>
                          </Tooltip>
                        </Td>
                      )}
                    </Tr>
                  ))}
                  {!rows.length && <Tr><Td colSpan={income ? 4 : 5} py={12} textAlign="center" color="#94a3b8">표시할 내역이 없습니다.</Td></Tr>}
                </Tbody>
              </Table>
            </TableContainer>
            <Flex mt={4} justify="space-between" align="center" gap={3} wrap="wrap" color="#536174" fontSize="sm">
              <Text>전체 {rows.length}건</Text>
              <Flex align="center" gap={1}>
                <Button
                  size="sm"
                  variant="outline"
                  aria-label="이전 페이지"
                  isDisabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  <Icon as={FiChevronLeft} />
                </Button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <Button
                    key={page}
                    size="sm"
                    variant={page === currentPage ? "solid" : "outline"}
                    bg={page === currentPage ? accent : undefined}
                    color={page === currentPage ? "white" : undefined}
                    _hover={page === currentPage ? { opacity: 0.9 } : undefined}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  aria-label="다음 페이지"
                  isDisabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  <Icon as={FiChevronRight} />
                </Button>
              </Flex>
              <Select
                size="sm"
                w="140px"
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
              >
                {TABLE_PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}개씩 보기</option>)}
              </Select>
            </Flex>
          </Card>
        </Stack>

        <Card
          border="1px solid #e1e7ee"
          borderRadius="11px"
          boxShadow="0 2px 10px rgba(15,23,42,.04)"
          p={{ base: 5, xl: 6 }}
          h={{ xl: "100%" }}
          display="flex"
          flexDirection="column"
        >
          <Flex align="center" gap={3} mb={6}><Icon as={FiCreditCard} boxSize={7} color={accent} /><Heading fontSize="22px">빠른 {income ? "수입" : "지출"} 등록</Heading></Flex>
          <Stack spacing={{ base: 4, xl: 5 }} flex="1">
            <FormControl>
              <FormLabel fontSize="sm">{itemLabel}</FormLabel>
              <Flex gap={2} wrap="wrap">
                {categories.map((item) => (
                  <Button
                    key={item}
                    size="sm"
                    borderRadius="full"
                    variant="outline"
                    bg={income || form.category === item ? softAccent : "white"}
                    color={income || form.category === item ? accent : "#4a5568"}
                    borderColor={income || form.category === item ? accent : "#dfe5ec"}
                    cursor={income ? "default" : "pointer"}
                    onClick={() => !income && setForm({ ...form, category: item })}
                  >
                    {item}{(income || form.category === item) && <Icon as={FiCheck} ml={2} />}
                  </Button>
                ))}
              </Flex>
            </FormControl>
            {!income && (
              <FormControl>
                <FormLabel fontSize="sm">결제 수단</FormLabel>
                <Flex gap={2} wrap="wrap">
                  {["현금", "카드", "계좌이체"].map((method) => (
                    <Button
                      key={method}
                      size="sm"
                      borderRadius="full"
                      variant="outline"
                      bg={form.paymentMethod === method ? softAccent : "white"}
                      color={form.paymentMethod === method ? accent : "#4a5568"}
                      borderColor={form.paymentMethod === method ? accent : "#dfe5ec"}
                      onClick={() => setForm({ ...form, paymentMethod: method })}
                    >
                      {method}{form.paymentMethod === method && <Icon as={FiCheck} ml={2} />}
                    </Button>
                  ))}
                </Flex>
              </FormControl>
            )}
            <FormControl>
              <FormLabel fontSize="sm">{income ? "수입" : "지출"} 금액</FormLabel>
              <Input
                type="text"
                inputMode="numeric"
                value={form.amount ? Number(form.amount).toLocaleString("ko-KR") : ""}
                onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^0-9]/g, "") })}
                placeholder="₩ 0"
                h="48px"
                fontSize="xl"
                fontWeight="700"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">{income ? "입금일" : "지출일"}</FormLabel>
              <DatePicker value={form.date} onChange={(date) => setForm({ ...form, date })} />
            </FormControl>
            <FormControl><FormLabel fontSize="sm">내역</FormLabel><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="내역을 입력하세요" /></FormControl>
            <Flex gap={2} mt="auto" pt={3}>
              {editingItem && <Button flex="1" variant="outline" h="44px" onClick={resetForm} isDisabled={saving}>취소</Button>}
              <Button flex="1" bg={accent} color="white" _hover={{ opacity: .9 }} h="44px" isLoading={saving} onClick={submit}>
                {editingItem ? "수정" : `${income ? "수입" : "지출"} 등록`}
              </Button>
            </Flex>
          </Stack>
        </Card>
      </Grid>
    </Box>
  );
}
