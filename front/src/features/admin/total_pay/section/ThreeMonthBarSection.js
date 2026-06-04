import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function ThreeMonthBarSection({
  data = [],
  onMonthClick,
  selectedMonth,
  height = 420,
}) {

  return (
    <Flex h="100%" direction="column" bg="white" p={4} borderRadius="lg" border="1px solid" borderColor="gray.100" boxShadow="sm" overflow="hidden">
      <Box flexShrink={0}>
        <Heading size="sm" color="gray.800">
          최근 3개월 지급 그래프
        </Heading>
        <Text fontSize="sm" color="gray.500" mt={1} mb={2}>
          막대를 클릭하면 오른쪽 상세 내역이 바뀝니다.
        </Text>
      </Box>

      <Box flex="1" minH="260px">
        <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          onClick={(state) => {

            if (state && state.activeIndex != null) {
              const index = Number(state.activeIndex);
              const clicked = data[index];


              if (clicked?.key && onMonthClick) {
                onMonthClick(clicked.key);
              }
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" />
          <YAxis width={72} />
          <Tooltip />

          <Bar dataKey="total" barSize={82} radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => {
              const isSelected =
                entry.key === selectedMonth
              return (
                <Cell
                  key={index}
                  fill={
                    isSelected
                      ? "#3182CE"
                      : "#CBD5E0"
                  }
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </Box>
    </Flex>
  );
}
