import { Card, CardBody, Text } from "@chakra-ui/react";

export default function TotalSalesSummaryCard({ label, value }) {
  return (
    <Card border="1px solid" borderColor="gray.100" boxShadow="sm">
      <CardBody py={4}>
        <Text fontSize="xs" color="gray.500" fontWeight="800" mb={1}>
          {label}
        </Text>
        <Text fontSize="2xl" fontWeight="900">
          {value}
        </Text>
      </CardBody>
    </Card>
  );
}
