import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

export default function LocationSection({
  location,
  setLocation,
  locationsList,
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
        {location || "업체 / 장소 선택"}
      </MenuButton>

      <MenuList>
        {locationsList.map((loc, idx) => (
          <MenuItem key={idx} onClick={() => setLocation(loc)}>
            {loc}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
