// TotalSalesPage.js

import {
  Box,
  Flex,
  Heading,
  Card,
  CardBody,
  useToast,
} from "@chakra-ui/react";

import MonthPicker from "../../feactures/common/MonthPicker";
import { useTotalFinance } from "../../feactures/admin/total_pay/hook/useTotalFinance";
import ThreeMonthBarSection from "../../feactures/admin/total_pay/section/ThreeMonthBarSection";

export default function TotalSalesPage() {
  const toast = useToast();

    const {
      apiMonth,
      setApiMonth,
      selectedDetailMonth,
      setSelectedDetailMonth,
      threeMonthData,
      detailData,
      totalExpense,
    } = useTotalFinance({ toast });


    console.log("selectedMonth:", selectedDetailMonth);
console.log("threeMonthData:", threeMonthData);
    return (
    <Box p={6} bg="gray.50" minH="100vh">

      {/* 상단 */}
      <Flex justify="space-between" mb={6} align="center">
        <Heading>일급 현황</Heading>

        <MonthPicker
          value={apiMonth}
          onChange={(ym) => setApiMonth(ym)}
        />
      </Flex>

      <Flex gap={8}>

        {/* 왼쪽 영역 */}
        <Flex direction="column" flex="2" gap={6}>

          {/* 3개월 그래프 */}
          <ThreeMonthBarSection
            data={threeMonthData}
            selectedMonth={selectedDetailMonth}
            onMonthClick={(month) => {
              setSelectedDetailMonth(String(month).trim());
            }}
          />
          {/* 선택월 상세 */}
         <Card>
          <CardBody>
            <Heading size="sm" mb={3}>
              {selectedDetailMonth &&
                selectedDetailMonth.replace(
                  /^(\d{4})-(\d{2})$/,
                  "$1년 $2월"
                )} 상세 급여
            </Heading>

            {detailData.length === 0 ? (
              <Box textAlign="center" py={6} color="gray.400">
                급여 내역이 없습니다.
              </Box>
            ) : (
              detailData.map((item, i) => (
                <Flex key={i} justify="space-between">
                  <Box>{item.name}</Box>
                  <Box>{item.amount.toLocaleString()} 원</Box>
                </Flex>
              ))
            )}

            <Flex justify="space-between" fontWeight="bold" mt={4}>
              <Box>총 일급 지출</Box>
              <Box>{(totalExpense ?? 0).toLocaleString()} 원</Box>
            </Flex>
          </CardBody>
        </Card>

        </Flex>

        {/* 오른쪽 요약 */}
        <Card flex="1" border="1px dashed gray">
          <CardBody>
            <Heading size="sm" mb={3}>
              최근 3개월 요약
            </Heading>

            {threeMonthData.map((item, i) => (
              <Flex key={i} justify="space-between">
                <Box>{item.label}</Box>
                <Box>{item.total.toLocaleString()} 원</Box>
              </Flex>
            ))}

            <Flex justify="space-between" fontWeight="bold" mt={4}>
              <Box>3개월 총 합계</Box>
              <Box>
                {threeMonthData
                  .reduce((sum, m) => sum + m.total, 0)
                  .toLocaleString()} 원
              </Box>
            </Flex>
          </CardBody>
        </Card>

      </Flex>
    </Box>
  );
}