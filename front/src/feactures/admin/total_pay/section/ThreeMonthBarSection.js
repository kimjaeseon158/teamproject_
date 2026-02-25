import { Box, Heading } from "@chakra-ui/react";
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
}) {
  return (
    <Box bg="white" p={4} borderRadius="md">
      <Heading size="sm" mb={4}>
        최근 3개월 일급 그래프
      </Heading>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          onClick={(state) => {
            if (state?.activeLabel && onMonthClick) {
              onMonthClick(state.activeLabel);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickFormatter={(value) => value + "월"}
        />
          <YAxis />
          <Tooltip />
            <Bar dataKey="total" barSize={60}>
            {data.map((entry, index) => (
                <Cell
                key={`cell-${index}`}
                fill={
                    entry.label === selectedMonth
                    ? "#3182CE"   // 🔥 선택된 달 → 파란색
                    : "#CBD5E0"   // 나머지 → 회색
                }
                />
            ))}
            </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}