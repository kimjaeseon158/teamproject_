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

            if (state && state.activeIndex != null) {
              const index = Number(state.activeIndex);
              const clicked = data[index];


              if (clicked?.key && onMonthClick) {
                onMonthClick(clicked.key);
              }
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />

          <Bar dataKey="total" barSize={60}>
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
  );
}