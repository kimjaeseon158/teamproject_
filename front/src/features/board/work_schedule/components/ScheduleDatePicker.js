import { useEffect, useState } from "react";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@chakra-ui/react";
import { FiCalendar, FiChevronDown } from "react-icons/fi";
import WorkScheduleMonthCalendar from "./WorkScheduleMonthCalendar";

export default function ScheduleDatePicker({ month, selectedDate, onSelect, onMonthSelect, label }) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(month);
  useEffect(() => setVisibleMonth(month), [month]);
  const select = (date) => { onSelect(date); setOpen(false); };
  return <Popover isOpen={open} onOpen={() => { setVisibleMonth(month); setOpen(true); }} onClose={() => setOpen(false)} placement="bottom-end" isLazy>
    <PopoverTrigger><Button size="sm" variant="outline" bg="white" leftIcon={<FiCalendar />} rightIcon={<FiChevronDown />} aria-label="근무표 날짜 선택">{label}</Button></PopoverTrigger>
    <PopoverContent w="min(340px, calc(100vw - 32px))" border={0}>
      <WorkScheduleMonthCalendar month={visibleMonth} selectedDate={selectedDate} onMonthChange={setVisibleMonth} onDateSelect={select} />
      {onMonthSelect && <Button m={3} mt={0} colorScheme="blue" size="sm" onClick={() => { onMonthSelect(visibleMonth); setOpen(false); }}>월별 조회</Button>}
    </PopoverContent>
  </Popover>;
}
