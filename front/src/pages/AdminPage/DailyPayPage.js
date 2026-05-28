import { useEffect, useState, useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import { EditIcon, RepeatIcon, SearchIcon } from "@chakra-ui/icons";

import { useDailyPay } from "../../feactures/admin/work_palce/hook/useWorkList";
import { userPlace_listColmns } from "./DailyPayColmns";

import CommonTable from "../../feactures/common/mytable";
import AddRateModal from "../../feactures/admin/work_palce/components/AddRateModal";
import SearchRateModal from "../../feactures/admin/work_palce/components/SearchRateModal";

const formatWon = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toLocaleString()}원`;
};

const average = (arr) => {
  const valid = arr.filter((v) => v != null);
  if (!valid.length) return null;

  return Math.round(
    valid.reduce((sum, value) => sum + Number(value), 0) / valid.length
  );
};

export default function DailyPayPage() {
  const toast = useToast();
  const { data, loading, fetchDailyPay } = useDailyPay();

  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    fetchDailyPay({}, toast);
  }, []);

  const mergedData = useMemo(() => {
    return data?.map((user) => {
      const rates = user.rates || [];
      const workPlaces = rates.map((r) => r.work_place).filter(Boolean);

      return {
        user_uuid: user.user_uuid,
        user_name: user.user_name,
        work_place: workPlaces.join(" / "),
        base_hourly_wage: average(rates.map((r) => r.base_hourly_wage)),
        overtime_hourly_wage: average(rates.map((r) => r.overtime_hourly_wage)),
        special_hourly_wage: average(rates.map((r) => r.special_hourly_wage)),
        overnight_hourly_wage: average(rates.map((r) => r.overnight_hourly_wage)),
      };
    }) || [];
  }, [data]);

  const summary = useMemo(() => {
    const places = new Set();
    data?.forEach((user) => {
      user.rates?.forEach((rate) => {
        if (rate.work_place) places.add(rate.work_place);
      });
    });

    return {
      users: mergedData.length,
      places: places.size,
      averageBasePay: average(mergedData.map((row) => row.base_hourly_wage)),
    };
  }, [data, mergedData]);

  const columnsWithEdit = useMemo(() => [
    ...userPlace_listColmns.map((column) => ({
      ...column,
      render:
        column.key.includes("wage")
          ? (value) => formatWon(value)
          : column.render,
    })),
    {
      key: "edit",
      label: "관리",
      render: (_, row) => (
        <Button
          size="sm"
          leftIcon={<EditIcon />}
          colorScheme="green"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            const user = data.find((u) => u.user_uuid === row.user_uuid);
            setSelectedUser(user);
          }}
        >
          수정
        </Button>
      ),
    },
  ], [data]);

  const statCards = [
    { label: "등록 직원", value: `${summary.users.toLocaleString()}명` },
    { label: "근무지 수", value: `${summary.places.toLocaleString()}곳` },
    { label: "평균 기본일급", value: formatWon(summary.averageBasePay) },
  ];

  return (
    <Box minH="100vh" bg="gray.50" p={{ base: 4, md: 6 }}>
      <Flex
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
        mb={6}
      >
        <Box>
          <HStack spacing={3} mb={2}>
            <Heading size="lg" color="gray.800">
              일급 관리
            </Heading>
            <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
              {loading ? "불러오는 중" : "최신 데이터"}
            </Badge>
          </HStack>
          <Text color="gray.500" fontSize="sm">
            직원별 근무지 일급 단가를 확인하고 수정합니다.
          </Text>
        </Box>

        <HStack spacing={2}>
          <Button
            leftIcon={<SearchIcon />}
            colorScheme="blue"
            onClick={() => setIsSearchOpen(true)}
          >
            검색
          </Button>
          <Button
            leftIcon={<RepeatIcon />}
            variant="outline"
            onClick={() => fetchDailyPay({}, toast)}
            isLoading={loading}
          >
            전체보기
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        {statCards.map((card) => (
          <Box
            key={card.label}
            bg="white"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="lg"
            p={5}
            boxShadow="sm"
          >
            <Text fontSize="sm" fontWeight="700" color="gray.500" mb={2}>
              {card.label}
            </Text>
            <Text fontSize="2xl" fontWeight="900" color="gray.800">
              {card.value}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.100"
        borderRadius="lg"
        boxShadow="sm"
        overflow="hidden"
      >
        <Flex
          justify="space-between"
          align="center"
          px={6}
          py={4}
          borderBottom="1px solid"
          borderColor="gray.100"
        >
          <Box>
            <Heading size="sm" color="gray.800">
              직원별 일급 단가
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              평균 단가는 등록된 근무지 단가를 기준으로 계산됩니다.
            </Text>
          </Box>
          <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
            {mergedData.length.toLocaleString()}건
          </Badge>
        </Flex>

        <Box sx={{ "> div": { boxShadow: "none", borderRadius: 0 } }}>
          <CommonTable
            columns={columnsWithEdit}
            data={mergedData}
            rowKey="user_uuid"
          />
        </Box>
      </Box>

      {selectedUser && (
        <AddRateModal
          isOpen
          mode="edit"
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => {
            fetchDailyPay({}, toast);
            setSelectedUser(null);
          }}
        />
      )}

      <SearchRateModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={(params) => fetchDailyPay(params, toast)}
      />
    </Box>
  );
}
