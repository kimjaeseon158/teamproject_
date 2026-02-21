import {
  Box,
  Flex,
  Heading,
  Button,
  Card,
  CardBody,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import { useTotalFinance } from "../../feactures/admin/total_pay/hook/useTotalFinance";
import { formatRangeLabel } from "../../feactures/admin/utils/dateUtils";

import DateRangeModal from "../../feactures/admin/total_pay/section/DateRangeModal";
import RevenuePieSection from "../../feactures/admin/total_pay/section/RevenuePieSection";
import ExpensePieSection from "../../feactures/admin/total_pay/section/ExpensePieSection";
import ReceiptSection from "../../feactures/admin/total_pay/section/ReceiptSection";

export default function TotalSalesPage() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    range,
    setRange,
    revenueByCompany,
    expenseData,
    totalRevenue,
    totalExpense,
    netProfit,
    fetchData,
  } = useTotalFinance({ toast });

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <Flex justify="space-between" mb={6}>
        <Heading>일급 현황</Heading>
        <Button onClick={onOpen}>
          {formatRangeLabel(range.from, range.to)}
        </Button>
      </Flex>

      <Flex gap={8} h="calc(100vh - 120px)">
        <Flex direction="column" flex="2" gap={8}>
          <RevenuePieSection data={revenueByCompany} />
          {/* <ExpensePieSection data={expenseData} /> */}
        </Flex>

        <Card flex="1" border="1px dashed gray">
          <CardBody>
            <ReceiptSection
              revenueByCompany={revenueByCompany}
              expenseData={expenseData}
              totalRevenue={totalRevenue}
              totalExpense={totalExpense}
              netProfit={netProfit}
            />
          </CardBody>
        </Card>
      </Flex>

      <DateRangeModal
        isOpen={isOpen}
        onClose={onClose}
        range={range}
        setRange={setRange}
        onApply={() => {
          fetchData(range.from, range.to);
          onClose();
        }}
      />
    </Box>
  );
}
