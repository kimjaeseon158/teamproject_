import { Box } from "@chakra-ui/react";

const cardStyle = {
  bg: "white",
  border: "1px solid",
  borderColor: "gray.100",
  borderRadius: "lg",
  boxShadow: "sm",
};

export default function DashboardCard({ children, ...props }) {
  return (
    <Box {...cardStyle} minH={0} {...props}>
      {children}
    </Box>
  );
}
