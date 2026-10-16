import { Box, HStack, IconButton, SimpleGrid, Text } from "@chakra-ui/react";
import { MinusIcon } from "@chakra-ui/icons";

import DashboardCard from "../components/DashboardCard";
import DetailButton from "../components/DetailButton";

export default function OverviewKpiSection({ kpis, onNavigate, onRemove }) {
  return (
    <Box bg="transparent" sx={{ containerType: "inline-size" }}>
      {onRemove && <HStack justify="flex-end" mb={1}>
        <IconButton
          aria-label="상단 요약 카드 숨기기"
          icon={<MinusIcon />}
          size="xs"
          variant="ghost"
          onClick={onRemove}
        />
      </HStack>}
      <SimpleGrid spacing={3} alignContent="start" sx={{
        gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
        "@container (min-width: 300px)": { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" },
        "@container (min-width: 480px)": { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
        "@container (min-width: 1000px)": { gridTemplateColumns: "repeat(6, minmax(0, 1fr))" },
      }}>
        {kpis.map((item) => (
          <DashboardCard
            key={item.label}
            p={3}
            h="88px"
            borderColor="gray.200"
            boxShadow="none"
            _hover={{ borderColor: item.color, boxShadow: "sm" }}
            transition="border-color 0.15s, box-shadow 0.15s"
          >
            <HStack justify="space-between" align="start" h="100%">
              <Box minW={0}>
                <Text fontSize="xs" fontWeight="800" color="gray.500" mb={1}>
                  {item.label}
                </Text>
                <Text fontSize="xl" fontWeight="900" color="gray.900" noOfLines={1}>
                  {item.value}
                </Text>
              </Box>
              <DetailButton
                aria-label={`${item.label} 상세 보기`}
                onClick={() => onNavigate(item.path)}
              />
            </HStack>
          </DashboardCard>
        ))}
      </SimpleGrid>
    </Box>
  );
}
