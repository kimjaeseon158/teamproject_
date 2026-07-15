import { Box, Stack, HStack, Text, IconButton } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

export default function CartSection({ cart, setCart }) {
  if (cart.length === 0) return null;

  return (
    <Box bg="gray.800" p={3} borderRadius="md">
      <Text fontWeight="600">🧺 장바구니 ({cart.length})</Text>

      <Stack spacing={1} mt={2}>
        {cart.map((item) => (
          <HStack key={item.id} justify="space-between">
            <Text fontSize="sm">
              {item.work_date.year}.{item.work_date.month}.{item.work_date.day}
              · {item.baseShift} · {item.startTime}~{item.finishTime}
            </Text>

            <IconButton
              icon={<DeleteIcon />}
              size="xs"
              colorScheme="red"
              onClick={() =>
                setCart((prev) => prev.filter((c) => c.id !== item.id))
              }
            />
          </HStack>
        ))}
      </Stack>
    </Box>
  );
}
