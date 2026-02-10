import { Box, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import FinanceChart from "../components/FinalCahart";

export default function FinanceSection() {
  const navigate = useNavigate();

  return (
    <Box
      flex="2"
      bg="gray.50"
      p={4}
      display="flex"
      flexDirection="column"
      alignItems="center"
      position="relative"
    >
      <h3>총 지출액</h3>
      <p style={{ fontSize: "2rem", fontWeight: "bold" }}>-</p>

      <FinanceChart />

      <Button
        size="sm"
        position="absolute"
        top="10px"
        right="10px"
        onClick={() => navigate("/dashboard/total-sales")}
      >
        상세보기
      </Button>
    </Box>
  );
}
