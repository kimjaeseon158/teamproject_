import {
  Box, Card, CardBody, Flex, Grid, Heading, Icon, IconButton, SimpleGrid,
  Skeleton, Stack, Tab, TabList, Tabs, Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiArrowRight, FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import {
  CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import MonthPicker from "../../features/common/MonthPicker";
import useTotalOverview from "../../features/admin/total_pay/hook/useTotalOverview";
import { formatWon } from "../../features/admin/total_pay/utils/totalPayFormat";

const moveMonth = (value, amount) => {
  const [year, month] = value.split("-").map(Number);
  const nextDate = new Date(year, month - 1 + amount, 1);

  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
};

const getCurrentMonth = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
};

const SummaryCard = ({ label, value, color }) => (
  <Card border="1px solid" borderColor="#e2e8f0" boxShadow="0 2px 8px rgba(15, 23, 42, 0.04)" borderRadius="8px">
    <CardBody px={5} py={4}>
      <Text fontSize="sm" color="#64748b" fontWeight="700" mb={1}>{label}</Text>
      <Text fontSize={{ base: "2xl", md: "3xl" }} color={color} fontWeight="800" letterSpacing="-0.8px">
        {formatWon(value)}
      </Text>
    </CardBody>
  </Card>
);

const SixMonthTrend = ({ data }) => (
  <Card border="1px solid" borderColor="#e2e8f0" boxShadow="sm" borderRadius="8px">
    <CardBody p={5}>
      <Heading fontSize="lg" mb={1}>6개월 수입·지출</Heading>
      <Box h={{ base: "340px", lg: "540px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: "#cbd5e1" }} tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis width={82} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(value) => `${Number(value).toLocaleString()}원`} />
            <Tooltip formatter={(value, name) => [formatWon(value), name]} />
            <Legend verticalAlign="top" align="right" height={32} />
            <Line name="수입" type="linear" dataKey="income" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 3, fill: "#16a34a" }} activeDot={{ r: 5 }} />
            <Line name="지출" type="linear" dataKey="expense" stroke="#ef2b2d" strokeWidth={2.5} dot={{ r: 3, fill: "#ef2b2d" }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </CardBody>
  </Card>
);

const RecentTransactions = ({ overview }) => {
  const [filter, setFilter] = useState("all");
  const monthlyRows = [...overview.monthlyTrend].reverse();
  const currentMonth = getCurrentMonth();
  const isCurrentMonth = overview.month >= currentMonth;

  return (
    <Card border="1px solid" borderColor="#e2e8f0" boxShadow="sm" borderRadius="8px" minW={0} h="100%">
      <CardBody p={{ base: 4, md: 5 }} display="flex" flexDirection="column">
        <Heading fontSize="lg" mb={1}>최근 6개월 금액</Heading>
        <Text fontSize="xs" color="#64748b" mb={4}>월별 수입과 지출 총금액</Text>

        <Tabs colorScheme="green" size="sm" mb={4} onChange={(index) => setFilter(["all", "income", "expense"][index])}>
          <TabList>
            <Tab px={4}>전체</Tab>
            <Tab px={4}>수입</Tab>
            <Tab px={4}>지출</Tab>
          </TabList>
        </Tabs>

        <Flex mb={4} alignSelf="flex-start" align="center" gap={1}>
          <IconButton
            aria-label="이전 달"
            icon={<FiChevronLeft />}
            size="sm"
            variant="outline"
            onClick={() => overview.setMonth(moveMonth(overview.month, -1))}
          />
          <MonthPicker value={overview.month} onChange={overview.setMonth} size="sm" />
          <IconButton
            aria-label="다음 달"
            icon={<FiChevronRight />}
            size="sm"
            variant="outline"
            isDisabled={isCurrentMonth}
            onClick={() => overview.setMonth(moveMonth(overview.month, 1))}
          />
        </Flex>

        <Box overflowX="hidden">
          <Grid
            templateColumns={filter === "all" ? "42px repeat(3, minmax(0, 1fr))" : "42px minmax(0, 1fr)"}
            gap={2}
            px={2}
            py={2}
            color="#64748b"
            fontSize="xs"
            fontWeight="700"
            borderBottom="1px solid"
            borderColor="#cbd5e1"
          >
            <Text>월</Text>
            {(filter === "all" || filter === "income") && <Text textAlign="right">수입</Text>}
            {(filter === "all" || filter === "expense") && <Text textAlign="right">지출</Text>}
            {filter === "all" && <Text textAlign="right">합계</Text>}
          </Grid>

          {monthlyRows.map((item) => (
            <Grid
              key={item.key}
              templateColumns={filter === "all" ? "42px repeat(3, minmax(0, 1fr))" : "42px minmax(0, 1fr)"}
              gap={2}
              alignItems="center"
              minH="52px"
              px={2}
              py={2}
              borderBottom="1px solid"
              borderColor="#edf1f6"
            >
              <Text color="#0f172a" fontSize="sm" fontWeight="800">{item.name}</Text>
              {(filter === "all" || filter === "income") && (
                <Text color="#16a34a" fontSize="xs" fontWeight="800" textAlign="right" whiteSpace="nowrap">{formatWon(item.income)}</Text>
              )}
              {(filter === "all" || filter === "expense") && (
                <Text color="#ef2b2d" fontSize="xs" fontWeight="800" textAlign="right" whiteSpace="nowrap">{formatWon(item.expense)}</Text>
              )}
              {filter === "all" && (
                <Text color={item.income - item.expense >= 0 ? "#2563eb" : "#ef2b2d"} fontSize="xs" fontWeight="900" textAlign="right" whiteSpace="nowrap">
                  {formatWon(item.income - item.expense)}
                </Text>
              )}
            </Grid>
          ))}
        </Box>

        {!monthlyRows.length && (
          <Flex flex="1" minH="280px" direction="column" align="center" justify="center" color="#94a3b8">
            <Icon as={FiCalendar} boxSize={10} mb={3} />
            <Text>최근 6개월 금액 데이터가 없습니다.</Text>
          </Flex>
        )}

        <Flex mt="auto" pt={5} px={4} py={3} border="1px solid #e2e8f0" borderRadius="7px" justify="center" align="center" gap={3} color="#334155">
          <Text fontSize="sm" fontWeight="700">월별 내역 보기</Text>
          <Icon as={FiArrowRight} />
        </Flex>
      </CardBody>
    </Card>
  );
};

export default function TotalOverviewPage() {
  const overview = useTotalOverview();

  return (
    <Box minH="calc(100vh - 92px)" bg="#f8fafc" p={{ base: 4, lg: 5 }}>
      <Box mb={5}>
        <Heading fontSize={{ base: "2xl", md: "28px" }} color="#0f172a" mb={1} letterSpacing="-1px">통합 매출 현황</Heading>
      </Box>

      <Skeleton isLoaded={!overview.loading} borderRadius="lg">
        <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 2.35fr) minmax(300px, 0.72fr)" }} gap={5} alignItems="stretch">
          <Stack spacing={4} minW={0}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
              <SummaryCard label="총 수입" value={overview.totalRevenue} color="#16a34a" />
              <SummaryCard label="총 지출" value={overview.totalExpense} color="#ef2b2d" />
            </SimpleGrid>

            <SixMonthTrend data={overview.monthlyTrend} />
          </Stack>

          <RecentTransactions overview={overview} />
        </Grid>
      </Skeleton>
    </Box>
  );
}
