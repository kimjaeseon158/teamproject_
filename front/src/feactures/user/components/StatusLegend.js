import React from "react";
import { Box, HStack, Text } from "@chakra-ui/react";

const StatusLegend = ({ summary }) => (
  <Box>
    <HStack spacing={3} fontSize="xs" fontWeight="600" mb={1}>
      <HStack spacing={1}>
        <Box w="10px" h="10px" borderRadius="full" bg="#28a745" />
        <Text color="gray.600">승인</Text>
      </HStack>
      <HStack spacing={1}>
        <Box w="10px" h="10px" borderRadius="full" bg="#ffc107" />
        <Text color="gray.600">대기</Text>
      </HStack>
      <HStack spacing={1}>
        <Box w="10px" h="10px" borderRadius="full" bg="#dc3545" />
        <Text color="gray.600">반려</Text>
      </HStack>
    </HStack>
    
    {summary?.total_amount !== undefined && (
      <Box fontSize="sm" fontWeight="800" color="gray.700" mt={2}>
        <Text>총 금액 : {summary.total_amount.toLocaleString()}원</Text>
        <Text fontSize="g" color="black.500" mt={0.5}>
          총 근무일수 : 주간 {summary.day_shift_count}회 / 야간 {summary.night_shift_count}회
        </Text>
      </Box>
    )}
  </Box>
);

export default StatusLegend;
