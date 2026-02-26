import {
  Card, CardBody, Heading, Box, Stat, StatLabel, StatNumber
} from "@chakra-ui/react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#2ECC71", "#3182CE", "#9B59B6", "#F39C12", "#E74C3C"];

export default function CompanyChartSection({ incomeData, totalIncome }) {
  return (
    <Box flex="1" display="flex" flexDirection="column" gap={6}>
      <Card rounded="2xl">
        <CardBody>
          <Heading size="sm" mb={4}>매출 비율</Heading>
          <Box h="250px">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={incomeData} dataKey="amount" nameKey="name" innerRadius={50} outerRadius={80}>
                  {incomeData.map((_, i) => (
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
            <StatLabel>총 매출</StatLabel>
            <StatNumber color="green.500">
              {totalIncome.toLocaleString()} 원
            </StatNumber>
          </Stat>
        </CardBody>
      </Card>
    </Box>
  );
}
