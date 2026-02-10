// src/user_calender/components/CalendarHeader.jsx
import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  SimpleGrid,
  IconButton,
  HStack,
  Text,
} from "@chakra-ui/react";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { Alarm } from "../../aralm";

export default function CalendarHeader({
  userUuid,
  monthPickerYear,
  setMonthPickerYear,
  goToday,
  goToDate,
}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("/api/user_logout/", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_uuid: userUuid }),
      });
    } finally {
      navigate("/");
    }
  };

  return (
    <Box position="relative" mb={3}>
      {/* 🔔 알림 + 로그아웃 (오른쪽 고정) */}
      <Box
        position="absolute"
        right="0"
        top="0"
        display="flex"
        alignItems="center"
        gap="8px"
      >
        <Alarm />
        <Button size="sm" colorScheme="red" onClick={handleLogout}>
          로그아웃
        </Button>
      </Box>

      {/* ✅ 중앙 헤더 */}
      <Box display="flex" justifyContent="center" alignItems="center" gap="10px">
        <Button size="sm" variant="ghost"
          onClick={() => window.calendarRef?.getApi()?.prev()}
        >
          ◀
        </Button>

        <Box
          id="fc-title-box"
          fontSize="20px"
          fontWeight="700"
          minW="150px"
          textAlign="center"
        />

        <Button size="sm" variant="ghost"
          onClick={() => window.calendarRef?.getApi()?.next()}
        >
          ▶
        </Button>

        <Button size="sm" variant="outline" onClick={goToday}>
          Today
        </Button>

        {/* 월 선택 */}
        <Popover placement="bottom-start">
          {({ onClose }) => (
            <>
              <PopoverTrigger>
                <Button size="sm" leftIcon={<CalendarIcon />} variant="outline">
                  월 선택
                </Button>
              </PopoverTrigger>

              <PopoverContent w="280px">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader fontWeight="700">월 선택</PopoverHeader>
                <PopoverBody>
                  <HStack justify="space-between" mb={3}>
                    <IconButton
                      size="sm"
                      icon={<ChevronLeftIcon />}
                      onClick={() => setMonthPickerYear((y) => y - 1)}
                    />
                    <Text fontWeight="800">{monthPickerYear}년</Text>
                    <IconButton
                      size="sm"
                      icon={<ChevronRightIcon />}
                      onClick={() => setMonthPickerYear((y) => y + 1)}
                    />
                  </HStack>

                  <SimpleGrid columns={4} spacing={2}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <Button
                        key={i}
                        size="sm"
                        onClick={() => {
                          goToDate({
                            formatted: `${monthPickerYear}-${String(i + 1).padStart(2, "0")}-01`,
                          });
                          onClose();
                        }}
                      >
                        {i + 1}월
                      </Button>
                    ))}
                  </SimpleGrid>
                </PopoverBody>
              </PopoverContent>
            </>
          )}
        </Popover>
      </Box>
    </Box>
  );
}
