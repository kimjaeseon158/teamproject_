import { Button, Flex, Icon } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiCalendar, FiCheckSquare, FiMessageSquare, FiPhone, FiUsers } from "react-icons/fi";

const ADMIN_MOBILE_NAV = [
  { label: "승인", path: "/dashboard/approval", icon: FiCheckSquare },
  { label: "직원", path: "/dashboard/admin", icon: FiUsers },
  { label: "게시판", path: "/note", icon: FiMessageSquare, exact: true },
  { label: "연락처", path: "/note/contacts", icon: FiPhone },
  { label: "근무표", path: "/note/work-schedule", icon: FiCalendar },
];

export default function AdminMobileNavigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <Flex as="nav" aria-label="모바일 관리자 탐색" bg="white" borderTopWidth="1px" borderColor="gray.100" px={2} pt={2} pb="max(8px, env(safe-area-inset-bottom))" flexShrink={0}>
      {ADMIN_MOBILE_NAV.map(({ label, path, icon }) => (
        <Button key={path} flex={1} minW={0} px={1} h="52px" variant="ghost" flexDirection="column" gap={1} fontSize="xs"
          color={pathname === path ? "teal.600" : "gray.500"}
          bg={pathname === path ? "teal.50" : undefined}
          aria-current={pathname === path ? "page" : undefined}
          onClick={() => navigate(path)}>
          <Icon as={icon} boxSize={5} />{label}
        </Button>
      ))}
    </Flex>
  );
}
