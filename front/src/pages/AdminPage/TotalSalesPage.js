import {
  Box,
  Flex,
  Heading,
  Card,
  CardBody,
  useToast,
  IconButton,
  Image,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";

import MonthPicker from "../../feactures/common/MonthPicker";
import { useTotalFinance } from "../../feactures/admin/total_pay/hook/useTotalFinance";
import ThreeMonthBarSection from "../../feactures/admin/total_pay/section/ThreeMonthBarSection";
import ExcelExportModal from "../../feactures/admin/total_pay/section/ExcelExportModal";
import { exportToGoogleExcel } from "../../feactures/admin/api/google/GoogleDrive";
import excelIcon from "../../assets/img/excel.png";

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

  const handleConfirmExcel = async (workPlace, date) => {
    try {
      setExportLoading(true);
      const result = await exportToGoogleExcel(workPlace, date);
      
      if (result.success) {
        toast({
          title: "엑셀 생성 완료",
          description: result.message || "구글 드라이브에 파일이 생성되었습니다.",
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
    <Box p={6} bg="gray.50" minH="100vh">
      {/* 상단 */}
      <Flex justify="space-between" mb={6} align="center">
        <Flex align="center" gap={3}>
          <Heading>일급 현황</Heading>
          <Tooltip label="엑셀 다운로드" hasArrow>
            <IconButton
              aria-label="Export to Excel"
              icon={<Image src={excelIcon} w="60px" h="40px" alt="excel" />}
              variant="ghost"
              size="lg"
              p={1}
              onClick={onOpen}
              _hover={{ bg: "green.50", transform: "scale(1.1)" }}
              transition="all 0.2s"
            />
          </Tooltip>
        </Flex>

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

      <ExcelExportModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirmExcel}
        loading={exportLoading}
      />
    </Box>
  );
}
