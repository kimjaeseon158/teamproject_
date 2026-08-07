import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";

const todayValue = () => new Date().toISOString().slice(0, 10);

const DAYS = [
  { key: "mon", label: "월", date: "13" },
  { key: "tue", label: "화", date: "14" },
  { key: "wed", label: "수", date: "15" },
  { key: "thu", label: "목", date: "16" },
  { key: "fri", label: "금", date: "17" },
  { key: "sat", label: "토", date: "18" },
  { key: "sun", label: "일", date: "19" },
];

const DUMMY_SCHEDULE = [
  {
    id: 1,
    name: "김민수",
    workplace: "삼성전자",
    team: "제조 1팀",
    schedule: [
      { status: "주간", location: "삼성전자 P1" },
      { status: "주간", location: "삼성전자 P1" },
      { status: "휴무", location: "-" },
      { status: "주간", location: "삼성전자 P2" },
      { status: "주간", location: "삼성전자 P2" },
      { status: "휴무", location: "-" },
      { status: "휴무", location: "-" },
    ],
  },
  {
    id: 2,
    name: "박서준",
    workplace: "삼성전자",
    team: "제조 2팀",
    schedule: [
      { status: "주간", location: "삼성전자 P1" },
      { status: "야간", location: "삼성전자 P1" },
      { status: "야간", location: "삼성전자 P1" },
      { status: "휴무", location: "-" },
      { status: "주간", location: "삼성전자 P2" },
      { status: "주간", location: "삼성전자 P2" },
      { status: "휴무", location: "-" },
    ],
  },
  {
    id: 3,
    name: "이하늘",
    workplace: "삼성디스플레이",
    team: "모듈 공정",
    schedule: [
      { status: "휴무", location: "-" },
      { status: "주간", location: "디스플레이 A동" },
      { status: "주간", location: "디스플레이 A동" },
      { status: "주간", location: "디스플레이 B동" },
      { status: "휴무", location: "-" },
      { status: "야간", location: "디스플레이 B동" },
      { status: "야간", location: "디스플레이 B동" },
    ],
  },
  {
    id: 4,
    name: "최유진",
    workplace: "삼성디스플레이",
    team: "검사 공정",
    schedule: [
      { status: "야간", location: "디스플레이 검사동" },
      { status: "야간", location: "디스플레이 검사동" },
      { status: "휴무", location: "-" },
      { status: "주간", location: "디스플레이 검사동" },
      { status: "주간", location: "디스플레이 검사동" },
      { status: "휴무", location: "-" },
      { status: "주간", location: "디스플레이 검사동" },
    ],
  },
  {
    id: 5,
    name: "정도윤",
    workplace: "신규자 교육장",
    team: "신규자 교육",
    schedule: [
      { status: "교육", location: "교육센터 1관", note: "안전화 지참" },
      { status: "교육", location: "디스플레이 교육장" },
      { status: "교육", location: "안전체험관", note: "08:30까지 집결" },
      { status: "주간", location: "삼성전자 P2" },
      { status: "주간", location: "삼성전자 P2" },
      { status: "휴무", location: "-" },
      { status: "휴무", location: "-" },
    ],
  },
  {
    id: 6,
    name: "윤서아",
    workplace: "제닉스",
    team: "생산 지원",
    schedule: [
      { status: "주간", location: "제닉스 본관" },
      { status: "주간", location: "제닉스 본관" },
      { status: "주간", location: "제닉스 생산동" },
      { status: "휴무", location: "-" },
      { status: "야간", location: "제닉스 생산동" },
      { status: "야간", location: "제닉스 생산동" },
      { status: "휴무", location: "-" },
    ],
  },
  {
    id: 7,
    name: "한지우",
    workplace: "제닉스",
    team: "품질 지원",
    schedule: [
      { status: "휴무", location: "-" },
      { status: "주간", location: "제닉스 품질동" },
      { status: "주간", location: "제닉스 품질동" },
      { status: "야간", location: "제닉스 품질동" },
      { status: "야간", location: "제닉스 품질동" },
      { status: "휴무", location: "-" },
      { status: "주간", location: "제닉스 본관" },
    ],
  },
];

const statusStyle = (status) => {
  if (status === "주간") return { bg: "green.50", color: "green.700" };
  if (status === "야간") return { bg: "blue.50", color: "blue.700" };
  if (status === "교육") return { bg: "orange.50", color: "orange.700" };
  return { bg: "yellow.50", color: "yellow.700" };
};

function DesktopScheduleTable({ rows }) {
  return (
    <Box overflowX="auto" border="1px solid" borderColor="gray.200" borderRadius="lg">
      <Table size="sm" minW="920px" bg="white">
        <Thead bg="gray.100">
          <Tr>
            <Th position="sticky" left="0" zIndex="1" bg="gray.100" minW="150px">
              직원
            </Th>
            <Th minW="130px">근무지</Th>
            <Th minW="110px">소속</Th>
            {DAYS.map((day) => (
              <Th key={day.key} textAlign="center" minW="76px">
                {day.label} {day.date}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((person) => (
            <Tr key={person.id} _hover={{ bg: "gray.50" }}>
              <Td position="sticky" left="0" zIndex="1" bg="white" fontWeight="800">
                {person.name}
              </Td>
              <Td>{person.workplace}</Td>
              <Td color="gray.600">{person.team}</Td>
              {person.schedule.map((work, index) => (
                <Td key={DAYS[index].key} textAlign="center" p={1.5}>
                  <VStack
                    spacing={0.5}
                    minH="58px"
                    justify="center"
                    px={1}
                    py={1.5}
                    borderRadius="md"
                    {...statusStyle(work.status)}
                  >
                    <Text fontSize="xs" fontWeight="900">
                      {work.status}
                    </Text>
                    {work.location !== "-" && (
                      <Text fontSize="10px" lineHeight="short" whiteSpace="normal">
                        {work.location}
                      </Text>
                    )}
                  </VStack>
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

function MobileScheduleCards({ rows }) {
  return (
    <VStack align="stretch" spacing={3}>
      {rows.map((person) => (
        <Box key={person.id} border="1px solid" borderColor="gray.200" borderRadius="lg" overflow="hidden">
          <HStack justify="space-between" px={3} py={2.5} bg="gray.100">
            <Box minW={0}>
              <Text fontWeight="900">{person.name}</Text>
              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                {person.workplace} · {person.team}
              </Text>
            </Box>
          </HStack>
          <Box display="grid" gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap={2} p={2}>
            {person.schedule.map((work, index) => (
              <VStack
                key={DAYS[index].key}
                spacing={1.5}
                align="stretch"
                minH="120px"
                p={3}
                border="1px solid"
                borderColor="blackAlpha.100"
                borderRadius="lg"
                {...statusStyle(work.status)}
              >
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="900">
                    {DAYS[index].label} {DAYS[index].date}
                  </Text>
                  <Badge colorScheme={work.status === "교육" ? "orange" : work.status === "주간" ? "green" : "blue"}>
                    {work.status}
                  </Badge>
                </HStack>
                {work.location !== "-" && (
                  <Text fontSize="xs" lineHeight="short" color="gray.700">
                    {work.location}
                  </Text>
                )}
                {work.note && (
                  <Text
                    mt="auto"
                    pt={2}
                    borderTop="1px solid"
                    borderColor="blackAlpha.100"
                    fontSize="xs"
                    color="orange.700"
                  >
                    비고 · {work.note}
                  </Text>
                )}
              </VStack>
            ))}
          </Box>
        </Box>
      ))}
    </VStack>
  );
}

export default function WorkSchedulePreviewPanel({ isOpen, onClose, selectedDate }) {
  const placement = useBreakpointValue({ base: "bottom", md: "right" });
  const isMobile = placement === "bottom";
  const [date, setDate] = useState(selectedDate?.formatted || todayValue());
  const [selectedPerson, setSelectedPerson] = useState("전체 직원");
  const [selectedWorkplace, setSelectedWorkplace] = useState("전체");
  const [mobileView, setMobileView] = useState("fit");

  useEffect(() => {
    setDate(selectedDate?.formatted || todayValue());
  }, [selectedDate?.formatted]);

  const people = useMemo(
    () => ["전체 직원", ...DUMMY_SCHEDULE.map((item) => item.name)],
    []
  );

  const workplaces = useMemo(() => {
    if (selectedPerson === "전체 직원") {
      return ["전체", ...new Set(DUMMY_SCHEDULE.map((item) => item.workplace))];
    }

    const person = DUMMY_SCHEDULE.find((item) => item.name === selectedPerson);
    return person ? ["전체", person.workplace] : ["전체"];
  }, [selectedPerson]);

  const visibleRows = useMemo(
    () =>
      DUMMY_SCHEDULE.filter(
        (item) =>
          (selectedPerson === "전체 직원" || item.name === selectedPerson) &&
          (selectedWorkplace === "전체" || item.workplace === selectedWorkplace)
      ),
    [selectedPerson, selectedWorkplace]
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement={placement || "right"} size="full">
      <DrawerOverlay />
      <DrawerContent
        bg="white"
        maxH={isMobile ? "92dvh" : undefined}
        borderTopRadius={isMobile ? "24px" : undefined}
        overflow="hidden"
      >
        <DrawerCloseButton top={4} right={4} />
        <DrawerHeader borderBottomWidth="1px" py={5} pr={14}>
          근무표 조회
        </DrawerHeader>

        <DrawerBody px={{ base: 4, md: 6 }} py={5}>
          <VStack align="stretch" spacing={4}>
            <HStack
              justify="space-between"
              align={{ base: "stretch", lg: "center" }}
              flexDirection={{ base: "column", lg: "row" }}
              gap={3}
            >
              <Box>
                <HStack flexWrap="wrap">
                  <Text fontSize="lg" fontWeight="900">
                    읽기 전용 근무표
                  </Text>
                  <Badge colorScheme="blue" borderRadius="full">
                    더미 데이터
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  엑셀 데이터를 JSON으로 변환했을 때의 화면을 먼저 확인합니다.
                </Text>
              </Box>
              <HStack>
                <Input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  h="42px"
                  maxW={{ base: "none", lg: "170px" }}
                />
                <Button
                  leftIcon={<RepeatIcon />}
                  colorScheme="blue"
                  h="42px"
                  minW={{ base: "96px", md: "110px" }}
                  px={5}
                  fontSize="sm"
                  borderRadius="lg"
                >
                  조회
                </Button>
              </HStack>
            </HStack>

            {isMobile && (
              <ButtonGroup size="sm" isAttached w="100%">
                <Button
                  flex="1"
                  colorScheme={mobileView === "fit" ? "blue" : "gray"}
                  variant={mobileView === "fit" ? "solid" : "outline"}
                  onClick={() => setMobileView("fit")}
                >
                  모바일 맞춤 보기
                </Button>
                <Button
                  flex="1"
                  colorScheme={mobileView === "desktop" ? "blue" : "gray"}
                  variant={mobileView === "desktop" ? "solid" : "outline"}
                  onClick={() => setMobileView("desktop")}
                >
                  데스크톱 표 보기
                </Button>
              </ButtonGroup>
            )}

            <Box maxW={{ base: "100%", md: "340px" }}>
              <Text mb={2} fontSize="sm" fontWeight="800" color="gray.700">
                직원 선택
              </Text>
              <Select
                value={selectedPerson}
                onChange={(event) => {
                  setSelectedPerson(event.target.value);
                  setSelectedWorkplace("전체");
                }}
                bg="white"
                borderRadius="lg"
              >
                {people.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </Select>
            </Box>

            <Box>
              <Text mb={2} fontSize="sm" fontWeight="800" color="gray.700">
                근무지
              </Text>
              <HStack overflowX="auto" spacing={2} pb={1}>
                {workplaces.map((workplace) => (
                  <Button
                    key={workplace}
                    size="sm"
                    flex="0 0 auto"
                    borderRadius="full"
                    colorScheme={selectedWorkplace === workplace ? "blue" : "gray"}
                    variant={selectedWorkplace === workplace ? "solid" : "outline"}
                    onClick={() => setSelectedWorkplace(workplace)}
                  >
                    {workplace}
                  </Button>
                ))}
              </HStack>
            </Box>

            <HStack justify="space-between">
              <Text fontWeight="900">
                {selectedPerson} · {selectedWorkplace} 근무표
              </Text>
              <Text fontSize="sm" color="gray.500">
                {visibleRows.length}명
              </Text>
            </HStack>

            {isMobile && mobileView === "fit" ? (
              <MobileScheduleCards rows={visibleRows} />
            ) : (
              <DesktopScheduleTable rows={visibleRows} />
            )}
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
