import React, { useState } from "react";
import { Box, SimpleGrid, Text, Button } from "@chakra-ui/react";

const MONTHS = [
  "1월", "2월", "3월", "4월",
  "5월", "6월", "7월", "8월",
  "9월", "10월", "11월", "12월",
];

const MiniCalendarChakra = ({ onSelect }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  const handleSelectMonth = (monthIndex) => {
    const month = monthIndex + 1;
    const pad = (n) => String(n).padStart(2, "0");

    onSelect({
      year,
      month,
      day: 1,
      formatted: `${year}-${pad(month)}-01`, // ✅ 해당 달로 이동
    });
  };

  return (
    <Box>
      {/* 연도 선택 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button size="xs" onClick={() => setYear((y) => y - 1)}>◀</Button>
        <Text fontWeight="800">{year}년</Text>
        <Button size="xs" onClick={() => setYear((y) => y + 1)}>▶</Button>
      </Box>

      {/* 4 x 3 월 그리드 */}
      <SimpleGrid columns={4} spacing={2}>
        {MONTHS.map((label, idx) => (
          <Button
            key={idx}
            size="sm"
            variant="outline"
            onClick={() => handleSelectMonth(idx)}
          >
            {label}
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default MiniCalendarChakra;
