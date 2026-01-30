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
import { useAlarm } from "./alarmContext";

const Alarm = () => {
  const alarmCtx = useAlarm();
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!alarmCtx) return null;

  const { alarms, unreadCount, markAsRead } = alarmCtx;

  return (
    <>
      <Box position="relative">
        <IconButton
          icon={<BellIcon />}
          size="sm"
          variant="ghost"
          aria-label="알람"
          fontSize="20px"
          onClick={onOpen}
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
            <VStack align="stretch" spacing={3} maxH="400px" overflowY="auto">
              {alarms.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={6}>
                  수신된 알림이 없습니다.
                </Text>
              ) : (
                alarms.map((alarm) => (
                  <Box
                    key={alarm.id}
                    p={3}
                    borderWidth="1px"
                    borderRadius="md"
                    cursor="pointer"
                    bg={alarm.read ? "white" : "blue.50"}
                    borderColor={alarm.read ? "gray.200" : "blue.300"}
                    _hover={{ bg: "gray.50" }}
                    onClick={() => markAsRead(alarm.id)}
                  >
                    <Text fontWeight="bold">{alarm.title}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {alarm.date} {alarm.time}
                    </Text>
                  </Box>
                ))
              )}
            </VStack>
          </ModalBody>
          <Divider />
          <ModalFooter>
            <Button size="sm" onClick={onClose}>
              닫기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Alarm;
