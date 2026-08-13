import { SimpleGrid } from "@chakra-ui/react";

import TotalSalesSummaryCard from "../components/TotalSalesSummaryCard";
import { formatWon } from "../utils/totalPayFormat";

const SUMMARY_ITEMS = [
  { key: "selectedMonthTotal", label: "선택 월 지급" },
  { key: "threeMonthTotal", label: "3개월 합계" },
  { key: "detailCount", label: "상세 항목" },
];

export default function TotalSalesSummaryCards({
  selectedMonthTotal,
  threeMonthTotal,
  detailCount,
}) {
  const values = {
    selectedMonthTotal: formatWon(selectedMonthTotal),
    threeMonthTotal: formatWon(threeMonthTotal),
    detailCount: `${detailCount.toLocaleString()}건`,
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={3} flexShrink={0}>
      {SUMMARY_ITEMS.map((item) => (
        <TotalSalesSummaryCard
          key={item.key}
          label={item.label}
          value={values[item.key]}
        />
      ))}
    </SimpleGrid>
  );
}
