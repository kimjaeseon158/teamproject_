import React, { useState } from "react";
import {
  IconButton,
  Badge,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Divider,
  useDisclosure,
} from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";

const Alarm = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // 알람 데이터 상태 관리
  const [alarms, setAlarms] = useState([
    { id: 1, title: "연차 승인 알림", date: "2026-01-05", time: "09:30", read: false },
    { id: 2, title: "주간 회의 공지", date: "2026-01-04", time: "14:00", read: true },
    { id: 3, title: "급여 명세서 발행", date: "2026-01-01", time: "10:00", read: false },
  ]);

  const handleAlarmClick = (clickedAlarm) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === clickedAlarm.id ? { ...a, read: true } : a))
    );
  };

  const unreadCount = alarms.filter((a) => !a.read).length;

  return (
    <>
      <Box position="relative">
        <IconButton
          icon={<BellIcon />}
          size="sm"
          variant="ghost"
          aria-label="알람"
          onClick={onOpen}
          fontSize="20px"
        />
        {unreadCount > 0 && (
          <Badge
            position="absolute"
            top="-2px"
            right="-2px"
            colorScheme="red"
            borderRadius="full"
            fontSize="0.7em"
            px={2}
          >
            {unreadCount}
          </Badge>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>🔔 알림 센터</ModalHeader>
          <ModalBody>
            {alarms.length === 0 ? (
              <Text color="gray.500" py={8} textAlign="center">수신된 알람이 없습니다.</Text>
            ) : (
              <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto" py={2}>
                {alarms.map((alarm) => (
                  <Box
                    key={alarm.id}
                    p={3}
                    border="1px solid"
                    borderColor={alarm.read ? "gray.200" : "blue.300"}
                    borderRadius="md"
                    cursor="pointer"
                    bg={alarm.read ? "white" : "blue.50"}
                    _hover={{ bg: "gray.50" }}
                    onClick={() => handleAlarmClick(alarm)}
                  >
                    <Text fontWeight="700" color={alarm.read ? "gray.600" : "black"}>
                      {alarm.title}
                    </Text>
                    <Text fontSize="sm" color="gray.500">{alarm.date} {alarm.time}</Text>
                  </Box>
                ))}
              </VStack>
            )}
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button size="sm" onClick={onClose}>닫기</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Alarm;