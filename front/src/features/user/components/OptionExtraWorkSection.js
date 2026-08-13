import {
  Badge,
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";
import { AddIcon, ChevronDownIcon, DeleteIcon, InfoOutlineIcon } from "@chakra-ui/icons";

import TimeWheelPicker from "../../common/TimeWheelPicker";
import { EXTRA_WORK_TYPES, getExtraWorkTypeLabel } from "../../common/workTypes";

export default function OptionExtraWorkSection({
  enabled,
  rows,
  isMobile,
  onEnabledChange,
  onAdd,
  onUpdate,
  onRemove,
}) {
  return (
    <VStack align="stretch" spacing={3}>
      <HStack justify="space-between">
        <HStack>
          <InfoOutlineIcon w={3} h={3} color="orange.300" />
          <Text
            fontSize={{ base: "sm", md: "xs" }}
            fontWeight="bold"
            color={{ base: "white", md: "gray.500" }}
          >
            추가 근무
          </Text>
        </HStack>
        <HStack spacing={2}>
          <Text fontSize="xs" color={enabled ? "orange.300" : "gray.500"}>
            {enabled ? "사용" : "미사용"}
          </Text>
          <Switch
            size="sm"
            colorScheme="orange"
            isChecked={enabled}
            onChange={(e) => onEnabledChange(e.target.checked)}
          />
        </HStack>
      </HStack>

      {!enabled && isMobile && (
        <Text fontSize="xs" color="gray.400">
          잔업·연장·특근이 있다면 활성화해주세요.
        </Text>
      )}

      {enabled && (
        <>
          {rows.map((row, index) => (
            <Box key={index} p={3} borderRadius="20px" bg="rgba(124, 45, 18, 0.1)" border="1px solid" borderColor="orange.900">
              <HStack justify="space-between" mb={3}>
                <Menu>
                  <MenuButton as={Button} size="xs" variant="solid" colorScheme="orange" borderRadius="full" rightIcon={<ChevronDownIcon />}>
                    {getExtraWorkTypeLabel(row.type)}
                  </MenuButton>
                  <MenuList bg="#2c2c2e" borderColor="whiteAlpha.200">
                    {EXTRA_WORK_TYPES.map(({ value, label }) => (
                      <MenuItem key={value} bg="transparent" onClick={() => onUpdate(index, { type: value })}>
                        {label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
                <IconButton
                  icon={<DeleteIcon />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => onRemove(index)}
                  aria-label={`${index + 1}번째 추가 근무 삭제`}
                />
              </HStack>

              {isMobile ? (
                <Box w="100%" bg="blackAlpha.200" borderRadius="xl" px={2} py={2}>
                  <HStack justify="center" align="center" spacing={2}>
                    <VStack spacing={1} align="center">
                      <Text w="100%" textAlign="center" fontSize="10px" color="gray.300">
                        시작
                      </Text>
                      <TimeWheelPicker
                        value={row.start}
                        variant="compact"
                        onChange={(value) => onUpdate(index, { start: value })}
                      />
                    </VStack>
                    <Text color="orange.300">→</Text>
                    <VStack spacing={1} align="center">
                      <Text w="100%" textAlign="center" fontSize="10px" color="gray.300">
                        종료
                      </Text>
                      <TimeWheelPicker
                        value={row.finish}
                        variant="compact"
                        onChange={(value) => onUpdate(index, { finish: value })}
                      />
                    </VStack>
                  </HStack>
                </Box>
              ) : (
                <HStack justify="space-between" align="center">
                <HStack flex={1} justify="center" spacing={2}>
                  <Input size="xs" value={row.start} onChange={(e) => onUpdate(index, { start: e.target.value })} />
                  <Text fontSize="xs" color="orange.300">~</Text>
                  <Input size="xs" value={row.finish} onChange={(e) => onUpdate(index, { finish: e.target.value })} />
                </HStack>
                <Badge variant="subtle" colorScheme="orange" borderRadius="md" ml={2}>
                  {row.duration || "0:00"}
                </Badge>
                </HStack>
              )}

              {isMobile && (
                <Text mt={2} fontSize="xs" color="orange.200" textAlign="right">
                  추가 근무 {row.duration || "0:00"}
                </Text>
              )}
            </Box>
          ))}

          <Button
            size="sm"
            variant="outline"
            colorScheme="orange"
            leftIcon={<AddIcon />}
            onClick={onAdd}
            w="100%"
          >
            추가 근무 추가
          </Button>
        </>
      )}
    </VStack>
  );
}
