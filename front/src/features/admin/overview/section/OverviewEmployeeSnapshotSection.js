import { Box, Button, SimpleGrid, Text } from "@chakra-ui/react";

import DashboardCard from "../components/DashboardCard";
import SectionHeader from "../components/SectionHeader";
import { formatWon } from "../utils/overviewFormat";

export default function OverviewEmployeeSnapshotSection({
  dailyPaySummary,
  onNavigateEmployee,
  onRemove,
}) {
  return (
    <DashboardCard p={3} overflow="hidden">
      <SectionHeader
        title="직원 및 일급 요약"
        onRemove={onRemove}
        action={<Button size="xs" variant="outline" onClick={onNavigateEmployee}>관리</Button>}
      />
      <SimpleGrid columns={3} spacing={2}>
        <Box p={2} bg="gray.50" borderRadius="md">
          <Text fontSize="xs" color="gray.500" fontWeight="800">직원</Text>
          <Text fontSize="sm" fontWeight="900">{dailyPaySummary.users}명</Text>
        </Box>
        <Box p={2} bg="gray.50" borderRadius="md">
          <Text fontSize="xs" color="gray.500" fontWeight="800">근무지</Text>
          <Text fontSize="sm" fontWeight="900">{dailyPaySummary.places}곳</Text>
        </Box>
        <Box p={2} bg="gray.50" borderRadius="md">
          <Text fontSize="xs" color="gray.500" fontWeight="800">평균</Text>
          <Text fontSize="sm" fontWeight="900" noOfLines={1}>{formatWon(dailyPaySummary.averageBasePay)}</Text>
        </Box>
      </SimpleGrid>
    </DashboardCard>
  );
}
