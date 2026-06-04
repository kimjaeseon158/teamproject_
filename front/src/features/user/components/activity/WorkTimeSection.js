import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

export default function WorkTimeSection({
  workTime,
  filteredWorkTimeList,
  handleSelectWorkTime,
}) {
  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="outline"
        rightIcon={<ChevronDownIcon />}
        width="100%"
        justifyContent="space-between"
      >
        {workTime || "작업 시간 선택"}
      </MenuButton>

      <MenuList>
        {filteredWorkTimeList.map((t, i) => (
          <MenuItem
            key={i}
            onClick={() => handleSelectWorkTime(t.startTime, t.finishTime)}
          >
            {t.startTime} ~ {t.finishTime}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
