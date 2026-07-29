import {
  Badge,
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";

import {
  formatWon,
  getApprovalStatus,
  getWorkType,
} from "../../utils/calendarSidebarUtils";

const TEXT = {
  disabled: "\uc218\uc815\ubd88\uac00",
  missingPlace: "\uadfc\ubb34\uc9c0\u0020\ubbf8\uc9c0\uc815",
  nthWork: "\ubc88\uc9f8\u0020\uadfc\ubb34",
  select: "\uc218\uc815",
  subtitle: "\uac19\uc740\u0020\ub0a0\uc9dc\uc5d0\u0020\uc5ec\ub7ec\u0020\uadfc\ubb34\uac00\u0020\uc788\uc5b4\u0020\uc2b9\uc778\u0020\ub300\uae30\u0020\ud56d\ubaa9\ub9cc\u0020\uc120\ud0dd\ud560\u0020\uc218\u0020\uc788\uc2b5\ub2c8\ub2e4\u002e",
  title: "\uc218\uc815\ud560\u0020\uadfc\ubb34\u0020\uc120\ud0dd",
};

const toTime = (value) => {
  const match = String(value || "").match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : "--:--";
};

export default function PendingWorkSelectModal({
  forceBottomSheet,
  isOpen,
  items = [],
  onClose,
  onSelect,
}) {
  const responsiveBottomSheet = useBreakpointValue({ base: true, md: false });
  const isBottomSheet = forceBottomSheet ?? responsiveBottomSheet;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      isCentered={!isBottomSheet}
      motionPreset={isBottomSheet ? "slideInBottom" : "scale"}
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(6px)" />
      <ModalContent
        bg="#1c1c1e"
        color="white"
        borderTopRadius={isBottomSheet ? "30px" : "24px"}
        borderBottomRadius={isBottomSheet ? 0 : "24px"}
        border={isBottomSheet ? "0" : "1px solid"}
        borderColor={isBottomSheet ? "transparent" : "whiteAlpha.200"}
        boxShadow={isBottomSheet ? "0 -10px 30px rgba(0, 0, 0, 0.28)" : "0 24px 80px rgba(0, 0, 0, 0.45)"}
        mt={isBottomSheet ? "auto" : undefined}
        mb={isBottomSheet ? 0 : undefined}
        mx={isBottomSheet ? 0 : undefined}
        w={isBottomSheet ? "100%" : undefined}
        maxW={isBottomSheet ? "100%" : undefined}
        maxH={isBottomSheet ? "94dvh" : "auto"}
        overflow="hidden"
      >
        {isBottomSheet && (
          <Box w="40px" h="5px" bg="gray.300" borderRadius="full" mx="auto" mt={3} mb={1} />
        )}
        <ModalHeader px={6} pt={6} pb={2}>
          <Text fontSize="lg" fontWeight="900">{TEXT.title}</Text>
          <Text fontSize="sm" color="gray.400" mt={1}>
            {TEXT.subtitle}
          </Text>
        </ModalHeader>
        <ModalCloseButton
          top={5}
          right={5}
          bg={isBottomSheet ? "whiteAlpha.100" : undefined}
          borderRadius="full"
          _hover={{ bg: "whiteAlpha.200" }}
        />

        <ModalBody px={5} pb={6} overflowY="auto">
          <VStack align="stretch" spacing={3}>
            {items.map((item, index) => {
              const status = getApprovalStatus(item.is_approved);
              const canEdit = item.is_approved === null;
              const timeLabel = `${toTime(item.work_start)} ~ ${toTime(item.work_end)}`;

              return (
                <Box
                  key={`${item.date}-${item.work_place}-${index}`}
                  bg={canEdit ? "whiteAlpha.100" : "whiteAlpha.50"}
                  border="1px solid"
                  borderColor={canEdit ? "orange.300" : "whiteAlpha.100"}
                  borderRadius="16px"
                  p={4}
                  opacity={canEdit ? 1 : 0.72}
                >
                  <HStack justify="space-between" align="start" spacing={3}>
                    <Box minW={0}>
                      <HStack mb={2}>
                        <Badge colorScheme={status.color} borderRadius="full">
                          {status.text}
                        </Badge>
                        {!canEdit && (
                          <Badge colorScheme="gray" borderRadius="full" variant="outline">
                            {TEXT.disabled}
                          </Badge>
                        )}
                        <Text fontSize="xs" color="gray.400">
                          {index + 1}{TEXT.nthWork}
                        </Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="900" noOfLines={1}>
                        {getWorkType(item)}{" \u00b7 "}{item.work_place || TEXT.missingPlace}
                      </Text>
                      <Text fontSize="xs" color="gray.400" mt={1}>
                        {timeLabel}{" \u00b7 "}{formatWon(item.amount)}
                      </Text>
                    </Box>
                    {canEdit ? (
                      <Button size="sm" colorScheme="blue" onClick={() => onSelect(item)}>
                        {TEXT.select}
                      </Button>
                    ) : (
                      <Box
                        as="span"
                        minW="72px"
                        px={3}
                        py={2}
                        border="1px solid"
                        borderColor="whiteAlpha.300"
                        borderRadius="8px"
                        color="gray.300"
                        fontSize="sm"
                        fontWeight="800"
                        textAlign="center"
                        flexShrink={0}
                      >
                        {TEXT.disabled}
                      </Box>
                    )}
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
