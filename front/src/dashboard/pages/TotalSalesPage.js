import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Flex,
  Card,
  CardBody,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchTotalData } from "../../api/fetchTotalData"; // 공통 fetch 함수 사용

const COLORS = ["#3182CE", "#38A169", "#E53E3E", "#D69E2E", "#805AD5"];

export default function TotalSalesPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [range, setRange] = useState({ from: new Date(), to: new Date() });
  const [tempRange, setTempRange] = useState(range);

  const [revenueByCompany, setRevenueByCompany] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netProfit, setNetProfit] = useState(0);

  // 페이지에서 호출할 fetch 함수
  const handleFetch = async (start, end) => {
    const result = await fetchTotalData({ start, end, toast });
    if (!result) return;

    setRevenueByCompany(result.revenueByCompany);
    setExpenseData(result.expenseData);
    setTotalRevenue(result.totalRevenue);
    setTotalExpense(result.totalExpense);
    setNetProfit(result.netProfit);
  };

  const handleApply = () => {
    if (!tempRange.from || !tempRange.to) return;
    setRange(tempRange);
    handleFetch(tempRange.from, tempRange.to);
    onClose();
  };

  useEffect(() => {
    handleFetch(range.from, range.to);
  }, []);

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>매출 및 지출 현황</Heading>
        <Button onClick={onOpen}>
          {range.from.toLocaleDateString()} - {range.to.toLocaleDateString()}
        </Button>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>날짜 선택</ModalHeader>
            <ModalBody>
              <DayPicker
                mode="range"
                selected={tempRange}
                onSelect={(r) => {
                  const newRange = r || { from: null, to: null };
                  setTempRange(newRange);
                  if (newRange.from && newRange.to) {
                    handleFetch(newRange.from, newRange.to);
                  }
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleApply}>
                적용
              </Button>
              <Button onClick={onClose}>취소</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>

      <Flex gap={8} align="flex-start" h="calc(100vh - 120px)">
        {/* 왼쪽 차트 영역 */}
        <Flex direction="column" flex="2" minW="300px" gap={8} h="100%">
          {/* 업체별 매출 */}
          <Card flex="1" h="50%">
            <CardBody>
              <Heading size="md" mb={4} textAlign="center">
                업체별 매출
              </Heading>
              {revenueByCompany.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={revenueByCompany}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      label={({ name, value }) =>
                        `${name}: ${value.toLocaleString()}원`
                      }
                    >
                      {revenueByCompany.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box textAlign="center">매출 데이터 없음</Box>
              )}
            </CardBody>
          </Card>

          {/* 지출 현황 */}
          <Card flex="1" h="50%">
            <CardBody>
              <Heading size="md" mb={4} textAlign="center">
                지출 현황
              </Heading>
              {expenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      label={({ name, value }) =>
                        `${name}: ${value.toLocaleString()}원`
                      }
                    >
                      {expenseData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box textAlign="center">지출 데이터 없음</Box>
              )}
            </CardBody>
          </Card>
        </Flex>

        {/* 오른쪽 영수증 영역 */}
        <Card
          flex="1"
          h="100%"
          overflowY="auto"
          border="1px dashed gray"
          borderRadius="lg"
        >
          <CardBody
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            h="100%"
          >
            <Box>
              <Heading size="md" textAlign="center" mb={4}>
                매출 영수증
              </Heading>

              {/* 업체별 매출 */}
              <Box mb={4}>
                <Heading size="sm" mb={2}>
                  업체별 매출
                </Heading>
                {revenueByCompany.map((item, idx) => (
                  <Flex key={idx} justify="space-between" mb={1}>
                    <Box>{item.name}</Box>
                    <Box>{item.value.toLocaleString()} 원</Box>
                  </Flex>
                ))}
                <Flex
                  justify="space-between"
                  mt={2}
                  fontWeight="bold"
                  borderTop="1px solid #ccc"
                  pt={2}
                >
                  <Box>총 매출</Box>
                  <Box>{totalRevenue.toLocaleString()} 원</Box>
                </Flex>
              </Box>

              {/* 지출 내역 */}
              <Box mb={4}>
                <Heading size="sm" mb={2}>
                  지출 내역
                </Heading>
                {expenseData.map((item, idx) => (
                  <Flex key={idx} justify="space-between" mb={1}>
                    <Box>{item.name}</Box>
                    <Box>{item.value.toLocaleString()} 원</Box>
                  </Flex>
                ))}
                <Flex
                  justify="space-between"
                  mt={2}
                  fontWeight="bold"
                  borderTop="1px solid #ccc"
                  pt={2}
                >
                  <Box>총 지출</Box>
                  <Box>{totalExpense.toLocaleString()} 원</Box>
                </Flex>
              </Box>
            </Box>

            {/* 순이익 (맨 아래 고정) */}
            <Flex
              justify="space-between"
              fontWeight="bold"
              fontSize={
                netProfit >= 1000000 ? "2xl" : netProfit >= 500000 ? "xl" : "lg"
              }
              color={netProfit >= 0 ? "green.500" : "red.500"}
              mt={4}
            >
              <Box>순이익</Box>
              <Box>{netProfit.toLocaleString()} 원</Box>
            </Flex>
          </CardBody>
        </Card>
      </Flex>
    </Box>
  );
}
