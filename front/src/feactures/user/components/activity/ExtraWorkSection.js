import {
  Box,
  HStack,
  Select,
  Input,
  Text,
  IconButton,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

export default function ExtraWorkSection({
  extraWorks,
  updateExtraWork,
  handleRemoveExtraRow,
  formatTimeInput,
}) {
  return (
    <>
      {extraWorks.map((row, idx) => (
        <Box key={idx} p={3} borderRadius="md" bg="gray.800">
          <HStack mb={2}>
            <Select
              value={row.type}
              onChange={(e) =>
                updateExtraWork(idx, { type: e.target.value })
              }
            >
              <option value="overtime">잔업</option>
              <option value="lunch">중식</option>
            </Select>

            <IconButton
              icon={<DeleteIcon />}
              size="sm"
              colorScheme="red"
              onClick={() => handleRemoveExtraRow(idx)}
            />
          </HStack>

          <HStack>
            <Input
              value={row.start}
              onChange={(e) =>
                updateExtraWork(idx, {
                  start: formatTimeInput(e.target.value),
                })
              }
            />
            <Text>~</Text>
            <Input
              value={row.finish}
              onChange={(e) =>
                updateExtraWork(idx, {
                  finish: formatTimeInput(e.target.value),
                })
              }
            />
            <Text fontSize="xs">{row.duration || "총 시간 -"}</Text>
          </HStack>
        </Box>
      ))}
    </>
  );
}
