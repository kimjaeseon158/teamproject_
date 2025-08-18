import React from "react";
import { Box, Button } from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const FinanceChart = () => {
  const data = [
    { month: "1월", income: 400000, expense: 240000 },
    { month: "2월", income: 350000, expense: 280000 },
    { month: "3월", income: 500000, expense: 320000 },
    { month: "4월", income: 450000, expense: 290000 },
  ];

  return (
    <Box position="relative" w="100%" h="350px">
      {/* 차트 */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="30%" barGap={10}>
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="month" tickLine={false} />
          <YAxis tickLine={false} />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="income"
            fill="#82ca9d"
            name="수입"
            barSize={40}
          />
          <Bar
            dataKey="expense"
            fill="#ff7f7f"
            name="지출"
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default FinanceChart;
