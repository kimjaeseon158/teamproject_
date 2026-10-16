import { CalendarIcon } from "@chakra-ui/icons";
import { Button, Tooltip } from "@chakra-ui/react";

export default function TodayButton({
  onClick,
  isDisabled = false,
  size = "sm",
  tooltip = "오늘 날짜로 이동",
  showIcon = true,
  ...buttonProps
}) {
  return (
    <Tooltip label={tooltip} hasArrow>
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
    </Tooltip>
  );
}
