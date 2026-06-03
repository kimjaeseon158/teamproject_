import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  Image,
  SimpleGrid,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import { useMemo, useState } from "react";

import MonthPicker from "../../feactures/common/MonthPicker";
import { useTotalFinance } from "../../feactures/admin/total_pay/hook/useTotalFinance";
import ThreeMonthBarSection from "../../feactures/admin/total_pay/section/ThreeMonthBarSection";
import { exportToGoogleExcel } from "../../feactures/admin/api/google/GoogleDrive";
import excelIcon from "../../assets/img/excel.png";

const formatWon = (value) => `${Number(value || 0).toLocaleString()}원`;

export default function TotalSalesPage() {
  const toast = useToast();
  const [exportLoading, setExportLoading] = useState(false);

  const {
    apiMonth,
    setApiMonth,
    selectedDetailMonth,
    setSelectedDetailMonth,
    threeMonthData,
    detailData,
    totalExpense,
  } = useTotalFinance({ toast });

  const threeMonthTotal = useMemo(
    () => threeMonthData.reduce((sum, item) => sum + Number(item.total || 0), 0),
    [threeMonthData]
  );

  const selectedMonthTotal = useMemo(
    () => detailData.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [detailData]
  );

  const workerSummary = useMemo(() => {
    const total = selectedMonthTotal || 1;

    return [...detailData]
      .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
      .map((item, index) => ({
        name: item.name,
        amount: Number(item.amount || 0),
        percent: Math.round((Number(item.amount || 0) / total) * 100),
        rank: index + 1,
      }));
  }, [detailData, selectedMonthTotal]);

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const result = await exportToGoogleExcel("", selectedDetailMonth || apiMonth);

      if (result.success) {
        toast({
          title: "엑셀 생성 완료",
          description: result.message || "Google Drive에 파일을 생성했습니다.",
          status: "success",
          duration: 3000,
        });
      } else {
        throw new Error(result.message || "Export failed");
      }
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
    <Box
      h="calc(100vh - 92px)"
      bg="gray.50"
      p={{ base: 4, md: 5 }}
      display="flex"
      flexDirection="column"
      overflowX="hidden"
      overflowY="auto"
    >
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
        mb={3}
      >
        <Box>
          <HStack spacing={3} mb={2}>
            <Heading size="lg" color="gray.900">
              급여 현황
            </Heading>
            <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
              {apiMonth}
            </Badge>
          </HStack>
          <Text color="gray.500" fontSize="sm">
            최근 3개월 지급 흐름과 선택 월 상세 급여를 확인합니다.
          </Text>
        </Box>

        <HStack spacing={2}>
          <MonthPicker value={apiMonth} onChange={(ym) => setApiMonth(ym)} size="sm" />
          <Tooltip label="Google Sheets / Excel 내보내기" hasArrow>
            <Button
              leftIcon={<DownloadIcon />}
              rightIcon={<Image src={excelIcon} w="22px" h="22px" alt="excel" />}
              colorScheme="green"
              variant="outline"
              size="sm"
              onClick={handleExport}
              isLoading={exportLoading}
            >
              내보내기
            </Button>
          </Tooltip>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={3} flexShrink={0}>
        <Card border="1px solid" borderColor="gray.100" boxShadow="sm">
          <CardBody py={4}>
            <Text fontSize="xs" color="gray.500" fontWeight="800" mb={1}>
              선택 월 지급
            </Text>
            <Text fontSize="2xl" fontWeight="900">
              {formatWon(selectedMonthTotal)}
            </Text>
          </CardBody>
        </Card>
        <Card border="1px solid" borderColor="gray.100" boxShadow="sm">
          <CardBody py={4}>
            <Text fontSize="xs" color="gray.500" fontWeight="800" mb={1}>
              3개월 합계
            </Text>
            <Text fontSize="2xl" fontWeight="900">
              {formatWon(threeMonthTotal)}
            </Text>
          </CardBody>
        </Card>
        <Card border="1px solid" borderColor="gray.100" boxShadow="sm">
          <CardBody py={4}>
            <Text fontSize="xs" color="gray.500" fontWeight="800" mb={1}>
              상세 항목
            </Text>
            <Text fontSize="2xl" fontWeight="900">
              {detailData.length.toLocaleString()}건
            </Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Flex
        gap={5}
        align="stretch"
        direction={{ base: "column", xl: "row" }}
        flex="none"
        minH="auto"
        overflow="visible"
      >
        <Box flex="1.6" minW={0} display="flex" flexDirection="column" gap={3}>
          <Box
            h={{ base: "360px", md: "420px", xl: "460px" }}
            minH={{ base: "360px", md: "420px", xl: "460px" }}
            flexShrink={0}
          >
            <ThreeMonthBarSection
              data={threeMonthData}
              selectedMonth={selectedDetailMonth}
              height="100%"
              onMonthClick={(month) => {
                setSelectedDetailMonth(String(month).trim());
              }}
            />
          </Box>

          <Card border="1px solid" borderColor="gray.100" boxShadow="sm" flexShrink={0}>
            <CardBody py={4}>
              <Flex justify="space-between" align="center" mb={3}>
                <Box>
                  <Heading size="sm" color="gray.800">
                    근무자별 지급 현황
                  </Heading>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    선택 월 금액 기준 상위 근무자
                  </Text>
                </Box>
                <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                  {workerSummary.length.toLocaleString()}명
                </Badge>
              </Flex>

              {workerSummary.length === 0 ? (
                <Box py={6} textAlign="center" bg="gray.50" borderRadius="md" color="gray.400">
                  근무자별 지급 내역이 없습니다.
                </Box>
              ) : (
                <Flex gap={3} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} flex="1">
                    {workerSummary.slice(0, 4).map((item) => (
                      <Box key={`${item.name}-${item.rank}`} p={3} bg="gray.50" borderRadius="md">
                        <Flex justify="space-between" align="start" mb={2}>
                          <Box minW={0}>
                            <HStack spacing={2}>
                              <Badge colorScheme={item.rank === 1 ? "blue" : "gray"}>#{item.rank}</Badge>
                              <Text fontWeight="900" color="gray.800" noOfLines={1}>
                                {item.name}
                              </Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              전체 대비 {item.percent}%
                            </Text>
                          </Box>
                          <Text fontWeight="900" color="blue.600">
                            {formatWon(item.amount)}
                          </Text>
                        </Flex>
                        <Box h="8px" bg="white" borderRadius="full" overflow="hidden">
                          <Box h="100%" w={`${Math.max(item.percent, 4)}%`} bg="blue.400" />
                        </Box>
                      </Box>
                    ))}
                  </SimpleGrid>

                  <Box minW="180px" p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.100">
                    <Text fontSize="xs" fontWeight="900" color="blue.600" mb={2}>
                      선택 월 요약
                    </Text>
                    <Text fontSize="2xl" fontWeight="900" color="blue.700">
                      {formatWon(selectedMonthTotal)}
                    </Text>
                    <Text fontSize="xs" color="blue.600" mt={2}>
                      총 {workerSummary.length.toLocaleString()}명 지급
                    </Text>
                  </Box>
                </Flex>
              )}
            </CardBody>
          </Card>
        </Box>

        <Card
          flex="1"
          border="1px solid"
          borderColor="gray.100"
          boxShadow="sm"
          minH={{ base: "360px", xl: "auto" }}
          overflow="hidden"
        >
          <CardBody display="flex" flexDirection="column">
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Heading size="sm" color="gray.800">
                  선택 월 상세
                </Heading>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {selectedDetailMonth || apiMonth}
                </Text>
              </Box>
              <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                {formatWon(totalExpense || selectedMonthTotal)}
              </Badge>
            </Flex>

            {detailData.length === 0 ? (
              <Box flex="1" display="flex" alignItems="center" justifyContent="center" color="gray.400" bg="gray.50" borderRadius="md">
                급여 내역이 없습니다.
              </Box>
            ) : (
              <Box flex="1" overflowY="auto">
                {detailData.map((item, i) => (
                  <Flex
                    key={`${item.name}-${i}`}
                    justify="space-between"
                    align="center"
                    py={3}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                  >
                    <Text fontWeight="700" color="gray.700">
                      {item.name}
                    </Text>
                    <Text fontWeight="900">{formatWon(item.amount)}</Text>
                  </Flex>
                ))}
              </Box>
            )}
          </CardBody>
        </Card>
      </Flex>
    </Box>
  );
}
