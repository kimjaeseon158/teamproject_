import { Badge, Box, Button, Drawer, DrawerBody, DrawerContent, DrawerOverlay, Flex, HStack, Icon, Text, useDisclosure } from "@chakra-ui/react";
import { FiLogOut, FiBell, FiCalendar, FiUsers } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

import { Alarm } from "../../alarm";
import { useUser } from "../../auth/userContext";
import Sidebar from "../../admin/components/sideBar";
import AdminHeader from "../../admin/components/Header";

export const BOARD_SECTIONS = [
  { key: "notice", label: "공지사항" },
  { key: "contacts", label: "연락처" },
  { key: "work-schedule", label: "근무표 조회" },
];

export default function BoardLayout({ activeSection, children, onSectionChange, onExit }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginType, userName } = useUser();
  const adminMenu = useDisclosure();
  const sectionPaths = {
    notice: "/note",
    contacts: "/note/contacts",
    "work-schedule": "/note/work-schedule",
  };
  if (loginType === "admin") {
    return <Flex minH="100vh" h="100vh" bg="gray.50">
      <Box display={{ base: "none", md: "block" }}><Sidebar /></Box>
      <Flex direction="column" flex="1" minW={0}>
        <Box position="relative"><AdminHeader /><Button display={{ base: "inline-flex", md: "none" }} position="absolute" left={3} top={3} zIndex={2} size="sm" variant="ghost" aria-label="관리자 메뉴 열기" onClick={adminMenu.onOpen}>☰</Button></Box>
        <Box p={{ base: 4, md: 6 }} pb={{ base: "96px", md: 6 }} flex="1" minW={0} overflow="auto">{children}</Box>
      </Flex>
      <Drawer isOpen={adminMenu.isOpen} placement="left" onClose={adminMenu.onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent maxW="250px" w="250px" bg="#111827">
          <DrawerBody p={0} w="250px" overflow="hidden"><Sidebar /></DrawerBody>
        </DrawerContent>
      </Drawer>
      <Flex as="nav" aria-label="게시판 메뉴" display={{ base: "flex", md: "none" }} position="fixed" bottom={0} left={0} right={0} zIndex={20} bg="white" borderTopWidth="1px" pb="env(safe-area-inset-bottom)">
        {BOARD_SECTIONS.map((section, index) => <Button key={section.key} flex={1} minW={0} h="70px" variant="ghost" borderRadius={0} flexDirection="column" gap={2} fontSize="xs" color={location.pathname === sectionPaths[section.key] ? "blue.600" : "gray.500"} aria-current={location.pathname === sectionPaths[section.key] ? "page" : undefined} onClick={() => navigate(sectionPaths[section.key])}>
          <Icon as={[FiBell, FiUsers, FiCalendar][index]} boxSize={5} />{section.label}
        </Button>)}
      </Flex>
    </Flex>;
  }
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
        overflow="hidden"
      >
        <HStack minW={0} spacing={{ base: 0, md: 3 }} align={{ base: "flex-start", md: "center" }} flexDirection={{ base: "column", md: "row" }}>
          <Text whiteSpace="nowrap" fontSize={{ base: "md", md: "2xl" }} fontWeight="900">사내 게시판</Text>
          <Badge display={{ base: "none", md: "inline-block" }} colorScheme="blue" borderRadius="full" px={3} py={1}>
            {loginType === "admin" ? "어드민" : "유저"} ({userName || (loginType === "admin" ? "관리자" : "사용자")})
          </Badge>
          <Text display={{ base: "block", md: "none" }} fontSize="xs" color="gray.500" noOfLines={1}>{userName || "사용자"} · {loginType === "admin" ? "관리자" : "사용자"}</Text>
        </HStack>

        <HStack spacing={{ base: 1, md: 3 }} flexShrink={0}>
          <Alarm />
          <Button size="sm" px={{ base: 2, md: 4 }} fontSize={{ base: "xs", md: "sm" }} colorScheme="teal" leftIcon={<FiLogOut />} onClick={exitBoard}>
            나가기
          </Button>
        </HStack>
      </Flex>

      <HStack
        display={{ base: "none", md: "flex" }}
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

      <Box p={{ base: 4, md: 8 }} pb={{ base: "100px", md: 8 }}>{children}</Box>
      <Flex as="nav" aria-label="게시판 메뉴" display={{ base: "flex", md: "none" }} position="fixed" bottom={0} left={0} right={0} zIndex={20} bg="white" borderTopWidth="1px" pb="env(safe-area-inset-bottom)">
        {BOARD_SECTIONS.map((section, index) => <Button key={section.key} flex={1} minW={0} h="70px" variant="ghost" borderRadius={0} flexDirection="column" gap={2} fontSize="xs" color={section.key === activeSection ? "blue.600" : "gray.500"} aria-current={section.key === activeSection ? "page" : undefined} onClick={() => changeSection(section.key)}>
          <Box as={[FiBell, FiUsers, FiCalendar][index]} boxSize={5} />{section.label}
        </Button>)}
      </Flex>
    </Box>
  );
}
