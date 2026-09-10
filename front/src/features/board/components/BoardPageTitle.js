import { Badge, Box, Heading, HStack, Text } from "@chakra-ui/react";

export default function BoardPageTitle({ title, description, badge, badgeColorScheme = "cyan" }) {
  return (
    <Box>
      <HStack spacing={2}>
        <Heading size="md">{title}</Heading>
        {badge && <Badge colorScheme={badgeColorScheme}>{badge}</Badge>}
      </HStack>
      {description && <Text mt={1} color="gray.500" fontSize="sm">{description}</Text>}
    </Box>
  );
}
