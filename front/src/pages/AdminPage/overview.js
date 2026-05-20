import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  Spinner,
  Tag,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  CheckIcon,
  CloseIcon,
  ExternalLinkIcon,
  AddIcon,
  MinusIcon,
  RepeatIcon,
} from "@chakra-ui/icons";
import { useEffect, useMemo, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

import CalendarView from "../../common/CalendarView";
import MonthPicker from "../../feactures/common/MonthPicker";
import useApproveCalendar from "../../feactures/admin/overview/hook/useApproveCalendar";
import useApproveSummary from "../../feactures/admin/overview/hook/useApproveSummary";
import useGoogleLinkStatus from "../../feactures/admin/api/google/useGoogleLinkStatus";
import { login as googleLogin } from "../../feactures/admin/api/google/googleAuth";
import { useDailyPay } from "../../feactures/admin/work_palce/hook/useWorkList";
import { useTotalFinance } from "../../feactures/admin/total_pay/hook/useTotalFinance";
import { useAdminData } from "../../feactures/admin/userList/hook/useAdminData";

const STORAGE_KEY = "adminOverviewLayout";

const DEFAULT_WIDGETS = {
  kpis: true,
  calendar: true,
  approvalQueue: true,
  finance: true,
  employeeSnapshot: true,
};

const WIDGET_LABELS = {
  kpis: "상단 요약 카드",
  calendar: "월간 승인 캘린더",
  approvalQueue: "승인 대기",
  finance: "급여 현황",
  employeeSnapshot: "직원 · 일급 스냅샷",
};

const formatMonth = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const formatWon = (value) => `${Number(value || 0).toLocaleString()}원`;

const average = (values) => {
  const valid = values.filter((value) => value != null && value !== "");
  if (!valid.length) return 0;
  return Math.round(valid.reduce((sum, value) => sum + Number(value), 0) / valid.length);
};

const cardStyle = {
  bg: "white",
  border: "1px solid",
  borderColor: "gray.100",
  borderRadius: "lg",
  boxShadow: "sm",
};

const DashboardCard = ({ children, ...props }) => (
  <Box {...cardStyle} minH={0} {...props}>
    {children}
  </Box>
);

const SectionHeader = ({ title, action, onRemove }) => (
  <Flex justify="space-between" align="center" mb={3}>
    <Heading size="sm" color="gray.800">
      {title}
    </Heading>
    <HStack spacing={1}>
      {action}
      {onRemove && (
        <IconButton
          aria-label={`${title} 숨기기`}
          icon={<MinusIcon />}
          size="xs"
          variant="ghost"
          onClick={onRemove}
        />
      )}
    </HStack>
  </Flex>
);

const loadWidgets = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...DEFAULT_WIDGETS, ...(saved || {}) };
  } catch {
    return DEFAULT_WIDGETS;
  }
};

export default function OverviewPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [widgets, setWidgets] = useState(loadWidgets);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [peopleData, setPeopleData] = useState([]);

  const googleStatus = useGoogleLinkStatus();
  const { events, loading: approvalLoading, rawData: pendingList } =
    useApproveCalendar(currentDate);
  const approvalSummary = useApproveSummary(pendingList);

  const {
    data: dailyPayData,
    loading: dailyPayLoading,
    fetchDailyPay,
  } = useDailyPay();
  const { setApiMonth, threeMonthData } = useTotalFinance({ toast });

  useAdminData(setPeopleData);

  useEffect(() => {
    fetchDailyPay({}, toast);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setApiMonth(formatMonth(currentDate));
  }, [currentDate, setApiMonth]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
  }, [widgets]);

  const dailyPaySummary = useMemo(() => {
    const places = new Set();
    const basePays = [];

    dailyPayData.forEach((user) => {
      user.rates?.forEach((rate) => {
        if (rate.work_place) places.add(rate.work_place);
        if (rate.base_hourly_wage != null) basePays.push(rate.base_hourly_wage);
      });
    });

    return {
      users: dailyPayData.length,
      places: places.size,
      averageBasePay: average(basePays),
    };
  }, [dailyPayData]);

  const financeTotal = useMemo(
    () => threeMonthData.reduce((sum, item) => sum + Number(item.total || 0), 0),
    [threeMonthData]
  );

  const pendingPreview = useMemo(() => pendingList.slice(0, 5), [pendingList]);
  const kpis = [
    { label: "전체 직원", value: `${peopleData.length.toLocaleString()}명`, color: "blue.400" },
    { label: "승인 대기", value: `${approvalSummary.total.toLocaleString()}건`, color: "orange.400" },
    { label: "오늘 근무", value: `${events.length.toLocaleString()}건`, color: "green.400" },
    { label: "근무지", value: `${dailyPaySummary.places.toLocaleString()}곳`, color: "teal.400" },
    { label: "평균 기본일급", value: formatWon(dailyPaySummary.averageBasePay), color: "purple.400" },
    { label: "3개월 지급 합계", value: formatWon(financeTotal), color: "red.400" },
  ];

  const handleMonthChange = (ym) => {
    const [year, month] = ym.split("-").map(Number);
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const moveMonth = (amount) => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
  };

  const showWidget = (key) => {
    setWidgets((prev) => ({ ...prev, [key]: true }));
  };

  const hideWidget = (key) => {
    setWidgets((prev) => ({ ...prev, [key]: false }));
  };

  const hiddenWidgets = Object.entries(WIDGET_LABELS).filter(([key]) => !widgets[key]);

  const rightPanelCount =
    [widgets.approvalQueue, widgets.finance, widgets.employeeSnapshot].filter(Boolean).length || 1;
  const rightPanelRows = [
    widgets.approvalQueue ? "1fr" : null,
    widgets.finance ? "1.45fr" : null,
    widgets.employeeSnapshot ? "0.55fr" : null,
  ].filter(Boolean).join(" ") || `repeat(${rightPanelCount}, minmax(0, 1fr))`;

  return (
    <Box h="100%" minH="calc(100vh - 80px)" bg="gray.50" overflow="hidden">
      <Flex h="100%" direction="column" gap={3}>
        <Flex justify="space-between" align="center" gap={3}>
          <Box>
            <HStack spacing={3} mb={1}>
              <Heading size="md" color="gray.900">
                통합 Overview
              </Heading>
              <Badge colorScheme="blue" borderRadius="full" px={3}>
                {formatMonth(currentDate)}
              </Badge>
            </HStack>
            <Text color="gray.500" fontSize="sm">
              필요한 위젯만 켜서 관리자 홈 화면을 구성합니다.
            </Text>
          </Box>

          <HStack spacing={2}>
            {googleStatus.loading ? (
              <Spinner size="sm" color="blue.500" />
            ) : googleStatus.linked ? (
              <Tag colorScheme="green" borderRadius="full" px={3} py={2}>
                <HStack spacing={2}>
                  <FcGoogle />
                  <Text fontWeight="700">구글 연동</Text>
                </HStack>
              </Tag>
            ) : (
              <Button leftIcon={<FcGoogle />} variant="outline" size="sm" onClick={googleLogin}>
                구글 연결
              </Button>
            )}

            <MonthPicker
              value={formatMonth(currentDate)}
              onChange={handleMonthChange}
              size="sm"
              borderRadius="lg"
            />
            <IconButton
              aria-label="새로고침"
              icon={<RepeatIcon />}
              size="sm"
              variant="outline"
              isLoading={dailyPayLoading || approvalLoading}
              onClick={() => {
                fetchDailyPay({}, toast);
                setCurrentDate((prev) => new Date(prev));
              }}
            />
          </HStack>
        </Flex>

        {hiddenWidgets.length > 0 && (
          <HStack spacing={2} wrap="wrap">
            <Text fontSize="xs" color="gray.500" fontWeight="800">
              숨긴 위젯
            </Text>
            {hiddenWidgets.map(([key, label]) => (
              <Button
                key={key}
                leftIcon={<AddIcon />}
                size="xs"
                variant="outline"
                colorScheme="blue"
                onClick={() => showWidget(key)}
              >
                {label}
              </Button>
            ))}
          </HStack>
        )}

        {widgets.kpis && (
          <Box position="relative">
            <IconButton
              aria-label="상단 요약 카드 숨기기"
              icon={<MinusIcon />}
              size="xs"
              variant="ghost"
              position="absolute"
              top="4px"
              right="4px"
              zIndex={1}
              onClick={() => hideWidget("kpis")}
            />
            <SimpleGrid columns={{ base: 2, lg: 3, xl: 6 }} spacing={3}>
              {kpis.map((item) => (
                <DashboardCard key={item.label} p={3}>
                  <HStack justify="space-between" align="start">
                    <Box minW={0}>
                      <Text fontSize="xs" fontWeight="800" color="gray.500" mb={1}>
                        {item.label}
                      </Text>
                      <Text fontSize="xl" fontWeight="900" color="gray.900" noOfLines={1}>
                        {item.value}
                      </Text>
                    </Box>
                    <Box w="8px" h="8px" borderRadius="full" bg={item.color} mt={1} />
                  </HStack>
                </DashboardCard>
              ))}
            </SimpleGrid>
          </Box>
        )}

        <Grid
          flex="1"
          minH={0}
          gap={3}
          templateColumns={{
            base: "1fr",
            xl: widgets.calendar ? "minmax(0, 1.45fr) minmax(340px, 0.85fr)" : "1fr",
          }}
        >
          {widgets.calendar && (
            <DashboardCard p={3} display="flex" flexDirection="column" overflow="hidden">
              <SectionHeader
                title="월간 승인 캘린더"
                onRemove={() => hideWidget("calendar")}
                action={
                  <HStack spacing={1}>
                    <IconButton aria-label="이전 달" icon={<ArrowBackIcon />} size="xs" variant="ghost" onClick={() => moveMonth(-1)} />
                    <Text fontWeight="800" minW="86px" textAlign="center" fontSize="sm">
                      {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                    </Text>
                    <IconButton aria-label="다음 달" icon={<ArrowForwardIcon />} size="xs" variant="ghost" onClick={() => moveMonth(1)} />
                  </HStack>
                }
              />

              {approvalLoading && <Spinner size="sm" mb={2} />}
              <Box flex="1" minH={0} sx={{ ".fc": { height: "100%", fontSize: "12px" } }}>
                <CalendarView
                  events={events}
                  selectedDate={currentDate}
                  isMobile={false}
                  height="100%"
                  onEventClick={() => navigate("/dashboard/approval")}
                  renderEventContent={(arg) => {
                    const data = arg.event.extendedProps;
                    return (
                      <Box
                        px={2}
                        py="1px"
                        bg="orange.100"
                        color="orange.800"
                        borderRadius="md"
                        fontSize="11px"
                        fontWeight="800"
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                      >
                      {[data.user_name, data.work_shift || "근무"].filter(Boolean).join(" - ")}
                      </Box>
                    );
                  }}
                />
              </Box>
            </DashboardCard>
          )}

          <Grid minH={0} gap={3} templateRows={rightPanelRows}>
            {widgets.approvalQueue && (
              <DashboardCard p={3} overflow="hidden">
                <SectionHeader
                  title="승인 대기"
                  onRemove={() => hideWidget("approvalQueue")}
                  action={
                    <Button size="xs" rightIcon={<ExternalLinkIcon />} variant="outline" onClick={() => navigate("/dashboard/approval")}>
                      전체
                    </Button>
                  }
                />
                <HStack spacing={2} mb={3} wrap="wrap">
                  <Tag size="sm" colorScheme="orange">대기 {approvalSummary.total}</Tag>
                  <Tag size="sm" colorScheme="blue">주간 {approvalSummary.day}</Tag>
                  <Tag size="sm" colorScheme="purple">야간 {approvalSummary.night}</Tag>
                  <Tag size="sm" colorScheme="red">특근 {approvalSummary.special}</Tag>
                </HStack>
                <VStack align="stretch" spacing={2} maxH="calc(100% - 72px)" overflowY="auto">
                  {pendingPreview.length > 0 ? (
                    pendingPreview.map((item, index) => (
                      <Flex key={`${item.user_uuid}-${item.work_date}-${index}`} justify="space-between" align="center" gap={2} p={2} bg="gray.50" borderRadius="md">
                        <Box minW={0}>
                          <Text fontWeight="900" color="gray.800" fontSize="sm" noOfLines={1}>
                            {item.user_name}
                          </Text>
                          <Text fontSize="xs" color="gray.500" noOfLines={1}>
                            {item.work_place || "근무지 미지정"} · {item.work_shift || "근무"}
                          </Text>
                        </Box>
                        <HStack spacing={1}>
                          <IconButton aria-label="승인" icon={<CheckIcon />} size="xs" colorScheme="green" variant="ghost" onClick={() => navigate("/dashboard/approval")} />
                          <IconButton aria-label="반려" icon={<CloseIcon />} size="xs" colorScheme="red" variant="ghost" onClick={() => navigate("/dashboard/approval")} />
                        </HStack>
                      </Flex>
                    ))
                  ) : (
                    <Text fontSize="sm" color="gray.500">승인 대기 내역이 없습니다.</Text>
                  )}
                </VStack>
              </DashboardCard>
            )}

            {widgets.finance && (
              <DashboardCard p={3} display="flex" flexDirection="column" overflow="hidden">
                <SectionHeader
                  title="급여 현황"
                  onRemove={() => hideWidget("finance")}
                  action={<Button size="xs" variant="outline" onClick={() => navigate("/dashboard/total-sales")}>상세</Button>}
                />
                <Flex align="end" gap={3} flex="1" minH="180px" px={1}>
                  {threeMonthData.map((item) => {
                    const maxValue = Math.max(...threeMonthData.map((month) => Number(month.total || 0)), 1);
                    const percent = Math.max((Number(item.total || 0) / maxValue) * 100, 10);
                    return (
                      <Flex key={item.key} direction="column" align="center" justify="end" flex="1" h="100%" gap={2}>
                        <Text fontSize="xs" fontWeight="800" color="gray.600" noOfLines={1}>
                          {formatWon(item.total)}
                        </Text>
                        <Box
                          w="100%"
                          maxW="54px"
                          h={`${percent}%`}
                          minH="14px"
                          bg="blue.400"
                          borderRadius="md"
                        />
                        <Text fontSize="11px" color="gray.500" noOfLines={1}>
                          {item.label.replace("년", ".").replace("월", "")}
                        </Text>
                      </Flex>
                    );
                  })}
                </Flex>
                <VStack align="stretch" spacing={2} mt="auto" pt={3}>
                  <Divider />
                  <Flex justify="space-between">
                    <Text fontWeight="900">3개월 합계</Text>
                    <Text fontWeight="900" color="blue.600">{formatWon(financeTotal)}</Text>
                  </Flex>
                </VStack>
              </DashboardCard>
            )}

            {widgets.employeeSnapshot && (
              <DashboardCard p={3} overflow="hidden">
                <SectionHeader
                  title="직원 · 일급 요약"
                  onRemove={() => hideWidget("employeeSnapshot")}
                  action={<Button size="xs" variant="outline" onClick={() => navigate("/dashboard/admin")}>관리</Button>}
                />
                <SimpleGrid columns={3} spacing={2}>
                  <Box p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="xs" color="gray.500" fontWeight="800">직원</Text>
                    <Text fontSize="sm" fontWeight="900">{dailyPaySummary.users}명</Text>
                  </Box>
                  <Box p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="xs" color="gray.500" fontWeight="800">근무지</Text>
                    <Text fontSize="sm" fontWeight="900">{dailyPaySummary.places}곳</Text>
                  </Box>
                  <Box p={2} bg="gray.50" borderRadius="md">
                    <Text fontSize="xs" color="gray.500" fontWeight="800">평균</Text>
                    <Text fontSize="sm" fontWeight="900" noOfLines={1}>{formatWon(dailyPaySummary.averageBasePay)}</Text>
                  </Box>
                </SimpleGrid>
              </DashboardCard>
            )}
          </Grid>
        </Grid>
      </Flex>
    </Box>
  );
}
