import { DownloadIcon } from "@chakra-ui/icons";
import { Badge, Box, Button, Card, CardBody, Flex, Heading, HStack, SimpleGrid, Tooltip } from "@chakra-ui/react";

import SelectedMonthSummary from "../components/SelectedMonthSummary";
import WorkerPayCard from "../components/WorkerPayCard";

export default function WorkerPaySummarySection({ selectedMonthTotal, workerSummary, onExcelOpen }) {
  return (
    <Card border="1px solid" borderColor="gray.100" boxShadow="sm" flexShrink={0}>
      <CardBody py={4}>
        <Flex justify="space-between" align="center" mb={3}>
          <Heading size="sm" color="gray.800">
            근무자별 지급 현황
          </Heading>
          <HStack spacing={3}>
            <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
              {workerSummary.length.toLocaleString()}명
            </Badge>
            <Tooltip label="Excel 생성" hasArrow>
              <Button leftIcon={<DownloadIcon />} colorScheme="green" variant="outline" size="sm" minW="92px" onClick={onExcelOpen}>
                Excel
              </Button>
            </Tooltip>
          </HStack>
        </Flex>

        {workerSummary.length === 0 ? (
          <Box py={6} textAlign="center" bg="gray.50" borderRadius="md" color="gray.400">
            근무자별 지급 내역이 없습니다.
          </Box>
        ) : (
          <Flex gap={3} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} flex="1">
              {workerSummary.slice(0, 4).map((item) => (
                <WorkerPayCard key={`${item.name}-${item.rank}`} item={item} />
              ))}
            </SimpleGrid>

            <SelectedMonthSummary
              selectedMonthTotal={selectedMonthTotal}
              workerCount={workerSummary.length}
            />
          </Flex>
        )}
      </CardBody>
    </Card>
  );
}
