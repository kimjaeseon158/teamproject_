import { Badge, Box, Button, Flex, HStack, Text } from "@chakra-ui/react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { Alarm } from "../../alarm";
import { useUser } from "../../auth/userContext";

export const BOARD_SECTIONS = [
  { key: "notice", label: "공지사항" },
  { key: "contacts", label: "연락처" },
  { key: "work-schedule", label: "근무표 조회" },
];

export default function BoardLayout({ activeSection, children, onSectionChange, onExit }) {
  const navigate = useNavigate();
  const { loginType, userName } = useUser();
  const sectionPaths = {
    notice: "/note",
    contacts: "/note/contacts",
    "work-schedule": "/note/work-schedule",
  };
  const changeSection = (section) => {
    if (onSectionChange) onSectionChange(section);
    else navigate(sectionPaths[section]);
  };
  const exitBoard = () => {
    if (onExit) onExit();
    else navigate(loginType === "admin" ? "/dashboard" : "/data");
  };

  return (
    <Box minH="100vh" bg="#F7FAFC" color="gray.800">
      <Flex
        h="68px"
        px={{ base: 4, md: 8 }}
        align="center"
        justify="space-between"
        bg="white"
        borderBottomWidth="1px"
        borderColor="gray.200"
      >
        <HStack spacing={3}>
          <Text fontSize={{ base: "lg", md: "2xl" }} fontWeight="900">사내 게시판</Text>
          <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
            {loginType === "admin" ? "어드민" : "유저"} ({userName || (loginType === "admin" ? "관리자" : "사용자")})
          </Badge>
        </HStack>

        <HStack spacing={3}>
          <Alarm />
          <Button size="sm" colorScheme="teal" leftIcon={<FiLogOut />} onClick={exitBoard}>
            나가기
          </Button>
        </HStack>
      </Flex>

      <HStack
        h="64px"
        justify="flex-start"
        spacing={{ base: 2, md: 4 }}
        px={{ base: 4, md: 8 }}
        bg="transparent"
        borderBottomWidth="1px"
        borderColor="gray.200"
      >
        {BOARD_SECTIONS.map((section) => {
          const active = section.key === activeSection;
          return (
            <Button
              key={section.key}
              h="64px"
              px={{ base: 3, md: 5 }}
              borderRadius="0"
              borderBottomWidth="3px"
              borderBottomColor={active ? "blue.500" : "transparent"}
              color={active ? "blue.600" : "gray.700"}
              fontWeight="800"
              variant="ghost"
              onClick={() => changeSection(section.key)}
            >
              {section.label}
            </Button>
          );
        })}
      </HStack>

      <Box p={{ base: 4, md: 8 }}>{children}</Box>
    </Box>
  );
}
