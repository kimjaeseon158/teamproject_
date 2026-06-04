import { HStack, Checkbox } from "@chakra-ui/react";

export default function WorkTypeSection({
  baseShift,
  setBaseShift,
  isSpecial,
  setIsSpecial,
}) {
  return (
    <HStack>
      <Checkbox
        isChecked={baseShift === "주간"}
        onChange={() => setBaseShift("주간")}
      >
        주간
      </Checkbox>

      <Checkbox
        isChecked={baseShift === "야간"}
        onChange={() => setBaseShift("야간")}
      >
        야간
      </Checkbox>

      <Checkbox
        isChecked={isSpecial}
        onChange={(e) => setIsSpecial(e.target.checked)}
      >
        특근
      </Checkbox>
    </HStack>
  );
}