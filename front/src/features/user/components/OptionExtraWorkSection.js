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
import { ChevronDownIcon, DeleteIcon, InfoOutlineIcon } from "@chakra-ui/icons";

import TimeWheelPicker from "../../common/TimeWheelPicker";
import { EXTRA_WORK_TYPES, getExtraWorkTypeLabel } from "../../common/workTypes";

export default function OptionExtraWorkSection({
  enabled,
  rows,
  isMobile,
  onEnabledChange,
  onUpdate,
  onRemove,
}) {
  return (
    <VStack align="stretch" spacing={3}>
      <HStack justify="space-between">
        <HStack>
          <InfoOutlineIcon w={3} h={3} color="orange.300" />
          <Text fontSize="xs" fontWeight="bold" color="gray.500">
            추가 근무 내역
          </Text>
        </HStack>
        <Switch
          size="sm"
          colorScheme="orange"
          isChecked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
        />
      </HStack>

      {enabled && rows.map((row, index) => (
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
              aria-label="추가 근무 삭제"
            />
          </HStack>

          <HStack justify="space-between" align="center">
            <HStack flex={1} justify="center" spacing={2}>
              {isMobile ? (
                <TimeWheelPicker value={row.start} onChange={(value) => onUpdate(index, { start: value })} />
              ) : (
                <Input size="xs" value={row.start} onChange={(e) => onUpdate(index, { start: e.target.value })} />
              )}
              <Text fontSize="xs" color="orange.300">~</Text>
              {isMobile ? (
                <TimeWheelPicker value={row.finish} onChange={(value) => onUpdate(index, { finish: value })} />
              ) : (
                <Input size="xs" value={row.finish} onChange={(e) => onUpdate(index, { finish: e.target.value })} />
              )}
            </HStack>
            <Badge variant="subtle" colorScheme="orange" borderRadius="md" ml={2}>
              {row.duration || "0:00"}
            </Badge>
          </HStack>
        </Box>
      ))}
    </VStack>
  );
}
