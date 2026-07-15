import {
  Box,
  Button,
  Center,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronDownIcon, TimeIcon } from "@chakra-ui/icons";

import TimeWheelPicker from "../../common/TimeWheelPicker";
import { calculateNetMinutes, minutesToHM } from "../utils/timeUtils";

export default function OptionTimeSection({
  isMobile,
  startTime,
  finishTime,
  workTime,
  totalWorkTimeHM,
  filteredWorkTimeList,
  onStartTimeChange,
  onFinishTimeChange,
  onSelectWorkTime,
}) {
  return (
    <VStack align="stretch" spacing={2}>
      <Text fontSize="xs" fontWeight="bold" color="gray.500" ml={1}>
        근무 시간
      </Text>

      {isMobile ? (
        <HStack
          justify="center"
          spacing={6}
          p={4}
          bg="whiteAlpha.100"
          borderRadius="24px"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <VStack spacing={1}>
            <Text fontSize="10px" color="gray.500" fontWeight="bold">
              시작 시간
            </Text>
            <TimeWheelPicker
              value={startTime || "08:00"}
              onChange={onStartTimeChange}
            />
          </VStack>

          <Box mt={6}>
            <Text fontSize="xl" fontWeight="bold" color="blue.400">
              ~
            </Text>
          </Box>

          <VStack spacing={1}>
            <Text fontSize="10px" color="gray.500" fontWeight="bold">
              종료 시간
            </Text>
            <TimeWheelPicker
              value={finishTime || "17:00"}
              onChange={onFinishTimeChange}
            />
          </VStack>
        </HStack>
      ) : (
        <Menu>
          <MenuButton
            as={Button}
            variant="unstyled"
            w="100%"
            h="56px"
            bg="whiteAlpha.100"
            borderRadius="16px"
            px={4}
            textAlign="left"
          >
            <HStack justify="space-between" w="100%">
              <Text color={workTime ? "white" : "gray.500"} fontSize="md" fontWeight="600" isTruncated>
                {workTime || "근무 시간을 선택하세요"}
              </Text>
              <ChevronDownIcon color="gray.500" />
            </HStack>
          </MenuButton>
          <MenuList bg="#2c2c2e" borderColor="whiteAlpha.200" color="white" maxH="300px" overflowY="auto" borderRadius="16px">
            {filteredWorkTimeList.map((time, index) => (
              <MenuItem
                key={`${time.startTime}-${time.finishTime}-${index}`}
                bg="transparent"
                _hover={{ bg: "whiteAlpha.100" }}
                onClick={() => onSelectWorkTime(time.startTime, time.finishTime)}
                py={3}
              >
                <HStack justify="space-between" w="100%">
                  <Text fontSize="md" fontWeight="600">
                    {time.startTime} ~ {time.finishTime}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    ({minutesToHM(calculateNetMinutes(time.startTime, time.finishTime))})
                  </Text>
                </HStack>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      )}

      {totalWorkTimeHM && (
        <Center
          py={2}
          px={4}
          borderRadius="12px"
          border="1px dashed"
          borderColor="blue.500"
          bg="rgba(43, 108, 176, 0.1)"
        >
          <HStack spacing={2}>
            <TimeIcon color="blue.300" w={3} h={3} />
            <Text fontSize="sm" fontWeight="bold" color="blue.300">
              총 근무 시간: <Text as="span" color="white">{totalWorkTimeHM}</Text>
            </Text>
          </HStack>
        </Center>
      )}
    </VStack>
  );
}
