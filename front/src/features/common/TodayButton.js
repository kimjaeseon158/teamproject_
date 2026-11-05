import { CalendarIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";

export default function TodayButton({
  onClick,
  isDisabled = false,
  size = "sm",
  showIcon = true,
  ...buttonProps
}) {
  return (
    <Button
      leftIcon={showIcon ? <CalendarIcon /> : undefined}
      size={size}
      variant="outline"
      onClick={onClick}
      isDisabled={isDisabled}
      {...buttonProps}
    >
      오늘
    </Button>
  );
}
