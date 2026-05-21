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
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import { useMemo, useState } from "react";

import MonthPicker from "../../feactures/common/MonthPicker";
import { useTotalFinance } from "../../feactures/admin/total_pay/hook/useTotalFinance";
import ThreeMonthBarSection from "../../feactures/admin/total_pay/section/ThreeMonthBarSection";
import ExcelExportModal from "../../feactures/admin/total_pay/section/ExcelExportModal";
import { exportToGoogleExcel } from "../../feactures/admin/api/google/GoogleDrive";
import excelIcon from "../../assets/img/excel.png";

const formatWon = (value) => `${Number(value || 0).toLocaleString()}원`;

export default function TotalSalesPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  const handleConfirmExcel = async (workPlace, date) => {
    try {
      setExportLoading(true);
      const result = await exportToGoogleExcel(workPlace, date);

      if (result.success) {
        toast({
          title: "엑셀 생성 완료",
          description: result.message || "Google Drive에 파일을 생성했습니다.",
          status: "success",
          duration: 3000,
        });
        onClose();
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
    <Box h="calc(100vh - 92px)" bg="gray.50" p={{ base: 4, md: 5 }} display="flex" flexDirection="column" overflow="hidden">
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
              onClick={onOpen}
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
        flex="1"
        minH={0}
        overflow="hidden"
      >
        <Box flex="1.6" minW={0} minH={0}>
          <ThreeMonthBarSection
            data={threeMonthData}
            selectedMonth={selectedDetailMonth}
            height="100%"
            onMonthClick={(month) => {
              setSelectedDetailMonth(String(month).trim());
            }}
          />
        </Box>

        <Card flex="1" border="1px solid" borderColor="gray.100" boxShadow="sm" minH={0} overflow="hidden">
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

      <ExcelExportModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirmExcel}
        loading={exportLoading}
      />
    </Box>
  );
}
