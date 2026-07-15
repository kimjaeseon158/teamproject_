import {
  Card,
  CardBody,
  Heading,
  Box,
} from "@chakra-ui/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3182CE", "#38A169", "#E53E3E", "#D69E2E", "#805AD5"];

export default function RevenuePieSection({ data }) {
  return (
    <Card flex="1">
      <CardBody>
        <Heading size="md" mb={4} textAlign="center">
          일급 매출
        </Heading>

        {data.length ? (
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                outerRadius={80}
                label={({ name, value }) =>
                  `${name}: ${value.toLocaleString()}원`
                }
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Box textAlign="center">매출 데이터 없음</Box>
        )}
      </CardBody>
    </Card>
  );
}
