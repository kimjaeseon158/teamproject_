// components/activity/ActivityForm.jsx
import {
  Box,
  HStack,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  Select,
  Switch,
  Checkbox,
  IconButton,
} from "@chakra-ui/react";
import { ChevronDownIcon, DeleteIcon } from "@chakra-ui/icons";

export default function ActivityForm({
  selectedDate,
  state,
  handlers,
  lists,
}) {
  const {
    baseShift,
    isSpecial,
    workTime,
    location,
    totalWorkTime,
    extraEnabled,
    extraWorks,
  } = state;

   const {
    setBaseShift,
    setIsSpecial,
    setWorkTime,
    setLocation,
    setExtraEnabled,
    setExtraWorks,
    handleSelectWorkTime,
    updateExtraWork,
    handleRemoveExtraRow,
    formatTimeInput,
    } = handlers;
  const { filteredWorkTimeList, locationsList } = lists;

  return (
    <>
      {/* 날짜 */}
      <Box bg="gray.800" p={3} borderRadius="md">
        <Text fontSize="sm">
          {selectedDate.year}년 {selectedDate.month}월 {selectedDate.day}일
        </Text>
      </Box>

      {/* 근무형태 */}
      <HStack>
        <Checkbox isChecked={baseShift === "주간"} onChange={() => setBaseShift("주간")}>주간</Checkbox>
        <Checkbox isChecked={baseShift === "야간"} onChange={() => setBaseShift("야간")}>야간</Checkbox>
        <Checkbox isChecked={isSpecial} onChange={(e) => setIsSpecial(e.target.checked)}>특근</Checkbox>
      </HStack>

      {/* 작업 시간 */}
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} width="100%">
          {workTime || "작업 시간 선택"}
        </MenuButton>
        <MenuList>
          {filteredWorkTimeList.map((t, i) => (
            <MenuItem key={i} onClick={() => handleSelectWorkTime(t.startTime, t.finishTime)}>
              {t.startTime} ~ {t.finishTime}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      {/* 장소 */}
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} width="100%">
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

      {/* 총 시간 */}
      <Input value={totalWorkTime} isReadOnly placeholder="총 작업 시간" />

      {/* 추가 근무 */}
      <Switch isChecked={extraEnabled} onChange={(e) => setExtraEnabled(e.target.checked)}>
        추가 근무
      </Switch>

      {extraWorks.map((row, idx) => (
        <Box key={idx} p={3} bg="gray.800">
          <HStack mb={2}>
            <Select value={row.type} onChange={(e) => updateExtraWork(idx, { type: e.target.value })}>
              <option value="overtime">잔업</option>
              <option value="lunch">중식</option>
            </Select>
            <IconButton icon={<DeleteIcon />} onClick={() => handleRemoveExtraRow(idx)} />
          </HStack>

          <HStack>
            <Input value={row.start} onChange={(e) => updateExtraWork(idx, { start: formatTimeInput(e.target.value) })} />
            <Text>~</Text>
            <Input value={row.finish} onChange={(e) => updateExtraWork(idx, { finish: formatTimeInput(e.target.value) })} />
            <Text>{row.duration || "총 시간 -"}</Text>
          </HStack>
        </Box>
      ))}
    </>
  );
}
