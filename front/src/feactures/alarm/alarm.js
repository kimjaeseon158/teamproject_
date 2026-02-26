import {
  IconButton,
  Badge,
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  Button,
  VStack,
  Text,
  Divider,
  useDisclosure,
} from "@chakra-ui/react";
import { BellIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAlarm } from "./alarmContext";
import { useUser } from "../auth/userContext";

const Alarm = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const alarmCtx = useAlarm();
  const { loginType } = useUser();

  if (!alarmCtx) return null;

  const alarms = alarmCtx.alarms ?? [];
  const unreadCount = alarmCtx.unreadCount ?? 0;
  const markAsRead = alarmCtx.markAsRead;

  return (
    <Popover
      placement="bottom-end"
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      closeOnBlur
    >
      <PopoverTrigger>
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
      </PopoverTrigger>

      <PopoverContent w="320px">
        <PopoverArrow />

        {/* 🔔 헤더 */}
        <PopoverHeader fontWeight="bold" display="flex">
          🔔 알림 센터

          {/* 🔥 Admin에서만 바로가기 표시 */}
          {loginType === "admin" && (
            <Button
              size="md"
              variant="link"
              colorScheme="blue"
              ml="auto"
              onClick={() => {
                navigate("/dashboard/approval");
                onClose();
              }}
            >
              바로가기
            </Button>
          )}
        </PopoverHeader>

        {/* 🔔 본문 */}
        <PopoverBody>
          <VStack
            align="stretch"
            spacing={3}
            maxH="300px"
            overflowY="auto"
          >
            {/* 🔥 요약 */}
            {unreadCount > 0 && (
              <Box
                p={3}
                borderRadius="md"
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
              >
                <Text
                  fontSize="sm"
                  fontWeight="bold"
                  color="red.600"
                >
                  미승인 알림이 {unreadCount}건 있습니다.
                </Text>
              </Box>
            )}

            {/* 🔥 알림 목록 */}
            {alarms.length === 0 ? (
            loginType === "user" ? (
              <Text
                color="gray.500"
                textAlign="center"
                py={6}
              >
                수신된 알림이 없습니다.
              </Text>
            ) : null
          ) : (
            alarms.map((alarm) => (
              <Box
                key={alarm.id}
                p={3}
                borderWidth="1px"
                borderRadius="md"
                cursor="pointer"
                bg={alarm.read ? "white" : "blue.50"}
                borderColor={
                  alarm.read
                    ? "gray.200"
                    : "blue.300"
                }
                _hover={{ bg: "gray.50" }}
                onClick={() => {
                  if (typeof markAsRead === "function") {
                    markAsRead(alarm.id);
                  }
                  onClose();
                }}
              >
                <Text fontWeight="bold">
                  {alarm.title}
                </Text>

                {alarm.description && (
                  <Text
                    fontSize="sm"
                    color="red.500"
                    mt={1}
                  >
                    사유: {alarm.description}
                  </Text>
                )}

                <Text
                  fontSize="sm"
                  color="gray.500"
                >
                  {alarm.date} {alarm.time ?? ""}
                </Text>
              </Box>
            ))
          )}
          </VStack>
        </PopoverBody>

        <Divider />

        {/* 🔥 닫기 버튼 */}
        <PopoverFooter textAlign="right">
          <Button size="xs" onClick={onClose}>
            닫기
          </Button>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default Alarm;