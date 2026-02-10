import { Box, Button, Tag, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function PendingApproveSection({ list = [] }) {
  const navigate = useNavigate();

  return (
    <Box
      flex="1"
      bg="gray.100"
      p={4}
      overflowY="auto"
      position="relative"
    >
      <Text fontWeight="bold">승인 대기중</Text>

      <Button
        size="sm"
        position="absolute"
        top="10px"
        right="10px"
        onClick={() => navigate("/dashboard/approval")}
      >
        상세보기
      </Button>

      {list.length ? (
        list.map((emp) => (
          <Box key={emp.id} mt={4}>
            <Text fontWeight="600">{emp.name}</Text>
            <Text fontSize="sm">{emp.date}</Text>
            <Tag size="sm" colorScheme="yellow">
              대기
            </Tag>
          </Box>
        ))
      ) : (
        <Text mt={4}>대기중인 승인 내역이 없습니다.</Text>
      )}
    </Box>
  );
}
