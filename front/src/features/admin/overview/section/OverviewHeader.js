import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Tag,
  Text,
} from "@chakra-ui/react";
import { EditIcon, RepeatIcon } from "@chakra-ui/icons";
import { FcGoogle } from "react-icons/fc";

import MonthPicker from "../../../common/MonthPicker";
import { formatMonth } from "../utils/overviewFormat";

export default function OverviewHeader({
  currentDate,
  googleStatus,
  isLoading,
  onGoogleLogin,
  onMonthChange,
  onRefresh,
  onEdit,
}) {
  return (
    <Flex justify="space-between" align="center" gap={3}>
      <Box>
        <HStack spacing={3} mb={1}>
          <Heading size="lg" color="gray.900">
            홈 화면
          </Heading>
          <Badge colorScheme="blue" borderRadius="full" px={3}>
            {formatMonth(currentDate)}
          </Badge>
        </HStack>
      </Box>

      <HStack spacing={2}>
        {googleStatus.loading && !googleStatus.linked ? (
          <Spinner size="sm" color="blue.500" />
        ) : googleStatus.linked ? (
          <Tag colorScheme="green" borderRadius="full" px={3} py={2}>
            <HStack spacing={2}>
              <FcGoogle />
              <Text fontWeight="700">Google 연동</Text>
            </HStack>
          </Tag>
        ) : (
          <Button leftIcon={<FcGoogle />} variant="outline" size="sm" onClick={onGoogleLogin}>
            Google 연결
          </Button>
        )}

        <MonthPicker
          value={formatMonth(currentDate)}
          onChange={onMonthChange}
          size="sm"
          borderRadius="lg"
        />
        <IconButton
          aria-label="새로고침"
          icon={<RepeatIcon />}
          size="sm"
          variant="outline"
          isLoading={isLoading}
          onClick={onRefresh}
        />
        {onEdit && (
          <Button leftIcon={<EditIcon />} variant="outline" size="sm" onClick={onEdit}>
            편집
          </Button>
        )}
      </HStack>
    </Flex>
  );
}
