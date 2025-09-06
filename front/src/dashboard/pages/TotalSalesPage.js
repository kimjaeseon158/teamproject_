import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Divider,
  Flex,
  Card,
  CardBody,
  Select,
} from "@chakra-ui/react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";

// 업체별 매출
const revenueByCompany = [
  { name: "삼성", value: 5000000 },
  { name: "현대", value: 3200000 },
  { name: "SK", value: 4500000 },
];

// 총매출
const totalRevenue = revenueByCompany.reduce((acc, cur) => acc + cur.value, 0);

// 지출 데이터
const expenseData = [
  { name: "주유", value: 800000 },
  { name: "식대", value: 500000 },
  { name: "월급", value: 6000000 },
  { name: "세금", value: 2000000 },
  { name: "자재비", value: 1200000 },
];

// 지출 합계
const totalExpense = expenseData.reduce((acc, cur) => acc + cur.value, 0);

// 순이익
const netProfit = totalRevenue - totalExpense;

// 지출 + 순이익 그래프 데이터
const expenseChartData = [
  ...expenseData,
  { name: "순이익", value: netProfit > 0 ? netProfit : 0 },
];

// 색상 배열
const COMPANY_COLORS = ["#3182CE", "#38A169", "#DD6B20"];
const EXPENSE_COLORS = [
  "#E53E3E", // 주유
  "#DD6B20", // 식대
  "#38A169", // 월급
  "#3182CE", // 세금
  "#805AD5", // 자재비
  "#2D3748", // 순이익
];

export default function TotalSalesPage() {
  // 🔹 년/월 선택 상태
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      {/* 상단 타이틀 + 년월 선택 */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>매출 및 지출 현황</Heading>

        <Flex gap={2}>
          {/* 연도 선택 */}
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            w="100px"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}년
                </option>
              );
            })}
          </Select>

          {/* 월 선택 */}
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            w="80px"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {month}월
              </option>
            ))}
          </Select>
        </Flex>
      </Flex>

      {/* 그래프와 영수증 좌우 배치 */}
      <Flex justify="center" gap={8} flexWrap="wrap" align="flex-start">
        {/* 그래프 영역 */}
        <Flex direction="column" gap={6} flex="1" minW="250px">
          {/* 업체별 매출 그래프 */}
          <Card w="100%">
            <CardBody>
              <Heading size="md" mb={4} textAlign="center">
                업체별 매출
              </Heading>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={revenueByCompany}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={140}
                    label={({ name, value }) =>
                      `${name}: ${value.toLocaleString()}원`
                    }
                  >
                    {revenueByCompany.map((entry, index) => (
                      <Cell
                        key={`cell-company-${index}`}
                        fill={COMPANY_COLORS[index % COMPANY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* 지출 + 순이익 그래프 */}
          <Card w="100%">
            <CardBody>
              <Heading size="md" mb={4} textAlign="center">
                지출 및 순이익
              </Heading>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={140}
                    label={({ name, value }) =>
                      `${name}: ${value.toLocaleString()}원`
                    }
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell
                        key={`cell-expense-${index}`}
                        fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()}원`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </Flex>

        {/* 영수증 카드 영역 */}
        <Card
          flex="0 0 500px"
          maxH="800px"
          overflowY="auto"
          border="1px dashed gray"
          borderRadius="lg"
        >
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Heading size="md" textAlign="center">
                매출 영수증
              </Heading>
              <Divider borderStyle="dashed" />

              {/* 매출 관련 값 */}
              <Text fontWeight="bold">수익금</Text>
              <Text textAlign="right">{netProfit.toLocaleString()}원</Text>

              <Text fontWeight="bold" mt={2}>
                업체별 매출
              </Text>
              {revenueByCompany.map((item, i) => (
                <Flex key={i} justify="space-between" pl={4}>
                  <Text>{item.name}</Text>
                  <Text>{item.value.toLocaleString()}원</Text>
                </Flex>
              ))}
              <Divider borderStyle="dashed" />
              <Flex justify="space-between" fontWeight="bold">
                <Text>토탈</Text>
                <Text>{totalRevenue.toLocaleString()}원</Text>
              </Flex>

              {/* 지출금 */}
              <Text fontWeight="bold" mt={4}>
                지출금
              </Text>
              {expenseData.map((item, i) => (
                <Flex key={i} justify="space-between" pl={4}>
                  <Text>{item.name}</Text>
                  <Text>{item.value.toLocaleString()}원</Text>
                </Flex>
              ))}

              <Divider borderStyle="dashed" />
              <Flex justify="space-between" fontWeight="bold">
                <Text>순이익</Text>
                <Text>{netProfit.toLocaleString()}원</Text>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      </Flex>
    </Box>
  );
}
