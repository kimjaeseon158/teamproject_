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

import { useTotalFinance } from "../hooks/useTotalFinance";
import { formatRangeLabel } from "../utils/dateUtils";

import DateRangeModal from "../sections/DateRangeModal";
import RevenuePieSection from "../sections/finance/RevenuePieSection";
import ExpensePieSection from "../sections/finance/ExpensePieSection";
import ReceiptSection from "../sections/finance/ReceiptSection";

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
        <Heading>매출 및 지출 현황</Heading>
        <Button onClick={onOpen}>
          {formatRangeLabel(range.from, range.to)}
        </Button>
      </Flex>

      <Flex gap={8} h="calc(100vh - 120px)">
        <Flex direction="column" flex="2" gap={8}>
          <RevenuePieSection data={revenueByCompany} />
          <ExpensePieSection data={expenseData} />
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
