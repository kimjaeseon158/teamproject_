import {
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Progress,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";

const formatMonth = (ym) => {
  if (!ym) return "";
  const [year, month] = ym.split("-");
  return `${year}년 ${Number(month)}월`;
};

const formatAmount = (value) => `${Number(value || 0).toLocaleString()}원`;

export default function MonthlyComparisonDrawer({
  comparison,
  isOpen,
  onClose,
}) {
  const previousAmount = Number(comparison?.previous?.total_amount || 0);
  const currentAmount = Number(comparison?.current?.total_amount || 0);
  const difference = currentAmount - previousAmount;
  const maxAmount = Math.max(previousAmount, currentAmount, 1);
  const changeRate = previousAmount
    ? Math.round((difference / previousAmount) * 100)
    : null;
  const isIncrease = difference >= 0;

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">월 금액 비교</DrawerHeader>

        <DrawerBody py={6}>
          {comparison?.isLoading ? (
            <Stack spacing={4}>
              <Skeleton height="76px" borderRadius="xl" />
              <Skeleton height="76px" borderRadius="xl" />
              <Skeleton height="150px" borderRadius="xl" />
            </Stack>
          ) : comparison?.error ? (
            <Stack spacing={4}>
              <Box bg="red.50" color="red.700" borderRadius="xl" p={4}>
                <Text fontWeight="700">비교 정보를 불러오지 못했습니다.</Text>
                <Text mt={1} fontSize="sm">{comparison.error}</Text>
              </Box>
              <Button onClick={comparison.retry} colorScheme="blue">
                다시 시도
              </Button>
            </Stack>
          ) : (
            <Stack spacing={5}>
              <Text color="gray.500" fontSize="sm">
                {formatMonth(comparison?.previousMonth)} ↔ {formatMonth(comparison?.currentMonth)}
              </Text>

              <Stack spacing={3}>
                <Box borderWidth="1px" borderRadius="xl" p={4}>
                  <Flex justify="space-between" align="center">
                    <Text color="gray.500" fontSize="sm">지난달</Text>
                    <Text fontWeight="800" fontSize="xl">{formatAmount(previousAmount)}</Text>
                  </Flex>
                </Box>

                <Box borderWidth="1px" borderColor="blue.300" bg="blue.50" borderRadius="xl" p={4}>
                  <Flex justify="space-between" align="center">
                    <Text color="blue.700" fontSize="sm">이번달</Text>
                    <Text color="blue.700" fontWeight="800" fontSize="xl">
                      {formatAmount(currentAmount)}
                    </Text>
                  </Flex>
                </Box>
              </Stack>

              <Box bg={isIncrease ? "green.50" : "red.50"} borderRadius="xl" p={4}>
                <Text color="gray.600" fontSize="sm">지난달 대비</Text>
                <Flex mt={1} justify="space-between" align="center" gap={3}>
                  <Text
                    color={isIncrease ? "green.700" : "red.700"}
                    fontSize="2xl"
                    fontWeight="800"
                  >
                    {difference > 0 ? "+" : ""}{formatAmount(difference)}
                  </Text>
                  <Badge colorScheme={isIncrease ? "green" : "red"} borderRadius="full" px={2}>
                    {changeRate === null
                      ? currentAmount > 0 ? "신규" : "변동 없음"
                      : `${changeRate > 0 ? "+" : ""}${changeRate}%`}
                  </Badge>
                </Flex>
              </Box>

              <Divider />

              <Stack spacing={4}>
                <Box>
                  <Flex justify="space-between" mb={2} fontSize="sm">
                    <Text>{formatMonth(comparison?.previousMonth)}</Text>
                    <Text fontWeight="700">{formatAmount(previousAmount)}</Text>
                  </Flex>
                  <Progress
                    value={(previousAmount / maxAmount) * 100}
                    colorScheme="gray"
                    borderRadius="full"
                  />
                </Box>
                <Box>
                  <Flex justify="space-between" mb={2} fontSize="sm">
                    <Text>{formatMonth(comparison?.currentMonth)}</Text>
                    <Text fontWeight="700">{formatAmount(currentAmount)}</Text>
                  </Flex>
                  <Progress
                    value={(currentAmount / maxAmount) * 100}
                    colorScheme="blue"
                    borderRadius="full"
                  />
                </Box>
              </Stack>
            </Stack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
