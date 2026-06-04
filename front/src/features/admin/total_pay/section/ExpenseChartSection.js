import {
  Card, CardBody, Heading, Box, Stat, StatLabel, StatNumber
} from "@chakra-ui/react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#E74C3C", "#F39C12", "#9B59B6", "#3182CE", "#2ECC71"];

export default function ExpenseChartSection({ expenseData, totalExpense }) {
  return (
    <Box flex="1" display="flex" flexDirection="column" gap={6}>
      <Card rounded="2xl">
        <CardBody>
          <Heading size="sm" mb={4}>지출 비율</Heading>
          <Box h="250px">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={expenseData} dataKey="amount" nameKey="name" innerRadius={50} outerRadius={80}>
                  {expenseData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>

      <Card rounded="2xl" textAlign="center">
        <CardBody>
          <Stat>
            <StatLabel>총 지출</StatLabel>
            <StatNumber color="red.500">
              {totalExpense.toLocaleString()} 원
            </StatNumber>
          </Stat>
        </CardBody>
      </Card>
    </Box>
  );
}
