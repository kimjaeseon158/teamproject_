import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useBreakpointValue,
} from "@chakra-ui/react";

import { BoardWorkScheduleContent } from "../../../pages/UserPage/BoardWorkSchedulePage";

export default function WorkSchedulePreviewPanel({ isOpen, onClose }) {
  const placement = useBreakpointValue({ base: "bottom", md: "right" });
  const isMobile = placement === "bottom";

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement={placement || "right"} size="full">
      <DrawerOverlay />
      <DrawerContent
        bg="gray.50"
        color="gray.800"
        maxH={isMobile ? "94dvh" : undefined}
        borderTopRadius={isMobile ? "24px" : undefined}
      >
        <DrawerCloseButton top={4} right={4} zIndex={2} />
        <DrawerHeader borderBottomWidth="1px">근무표</DrawerHeader>
        <DrawerBody px={{ base: 4, md: 6 }} py={5}>
          <BoardWorkScheduleContent mobileOverride={isMobile} showTitle={false} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
