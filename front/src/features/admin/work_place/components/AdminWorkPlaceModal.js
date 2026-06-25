import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { CheckIcon, DeleteIcon } from "@chakra-ui/icons";
import { useEffect, useMemo, useState } from "react";

import {
  createAdminWorkPlace,
  deleteAdminWorkPlace,
  updateAdminWorkPlace,
} from "../api/adminWorkPlace";

const RATE_FIELDS = [
  { key: "base_hourly_wage", label: "기본일급" },
  { key: "overtime_hourly_wage", label: "연장일급" },
  { key: "meal_ot_hourly_wage", label: "식대연장" },
  { key: "special_hourly_wage", label: "특근" },
  { key: "day_special_hourly_wage", label: "주간 특근" },
  { key: "night_special_hourly_wage", label: "야간 특근" },
  { key: "overnight_hourly_wage", label: "철야" },
  { key: "overnight_ot_hourly_wage", label: "철야연장" },
  { key: "early_hourly_wage", label: "조기 출근" },
];

const initialForm = {
  admin_work_place_uuid: "",
  work_place: "",
  base_hourly_wage: "",
  overtime_hourly_wage: "",
  meal_ot_hourly_wage: "",
  special_hourly_wage: "",
  day_special_hourly_wage: "",
  night_special_hourly_wage: "",
  overnight_hourly_wage: "",
  overnight_ot_hourly_wage: "",
  early_hourly_wage: "",
};

const toNumberOrNull = (value) => {
  if (value === "" || value == null) return null;
  const normalized = String(value).replaceAll(",", "");
  return Number.isNaN(Number(normalized)) ? null : Number(normalized);
};

const toForm = (place = {}) => ({
  ...initialForm,
  ...Object.keys(initialForm).reduce((next, key) => {
    next[key] = place[key] ?? "";
    return next;
  }, {}),
});

const formatWon = (value) => {
  if (value == null || value === "" || Number.isNaN(Number(value))) return "-";
  return `${Number(value).toLocaleString()}원`;
};

export default function AdminWorkPlaceModal({
  isOpen,
  onClose,
  onSuccess,
  workPlaceCount = 0,
  workPlaces = [],
}) {
  const toast = useToast();
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isEditMode = !isAdding && Boolean(form.admin_work_place_uuid);

  const filteredWorkPlaces = useMemo(() => {
    const keyword = search.trim();
    if (!keyword) return workPlaces;
    return workPlaces.filter((place) => place.work_place?.includes(keyword));
  }, [search, workPlaces]);

  useEffect(() => {
    if (!isOpen) return;
    if (!isAdding && !form.admin_work_place_uuid && workPlaces.length > 0) {
      setForm(toForm(workPlaces[0]));
    }
  }, [form.admin_work_place_uuid, isAdding, isOpen, workPlaces]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNew = () => {
    setIsAdding(true);
    setForm(initialForm);
  };

  const handleClose = () => {
    if (saving || deleting) return;
    setForm(initialForm);
    setSearch("");
    setIsAdding(false);
    onClose?.();
  };

  const buildPayload = () => ({
    ...(isEditMode ? { admin_work_place_uuid: form.admin_work_place_uuid } : {}),
    work_place: form.work_place.trim(),
    ...RATE_FIELDS.reduce((next, field) => {
      next[field.key] = toNumberOrNull(form[field.key]);
      return next;
    }, {}),
  });

  const handleSubmit = async () => {
    if (!form.work_place.trim()) {
      toast({
        title: "근무지명을 입력해주세요.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    try {
      setSaving(true);
      const result = isEditMode
        ? await updateAdminWorkPlace(buildPayload(), toast)
        : await createAdminWorkPlace(buildPayload(), toast);

      if (result?.success === false) {
        throw new Error(result?.message || "근무지 저장에 실패했습니다.");
      }

      toast({
        title: isEditMode ? "근무지를 수정했습니다." : "근무지를 등록했습니다.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      onSuccess?.();
      if (!isEditMode) {
        setIsAdding(true);
        setForm(initialForm);
      }
    } catch (err) {
      toast({
        title: "근무지 저장 중 오류가 발생했습니다.",
        description: err?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.admin_work_place_uuid) return;

    try {
      setDeleting(true);
      const result = await deleteAdminWorkPlace(form.admin_work_place_uuid, toast);

      if (result?.success === false) {
        throw new Error(result?.message || "근무지 삭제에 실패했습니다.");
      }

      toast({
        title: "근무지를 삭제했습니다.",
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      setIsAdding(true);
      setForm(initialForm);
      onSuccess?.();
    } catch (err) {
      toast({
        title: "근무지 삭제 중 오류가 발생했습니다.",
        description: err?.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="6xl">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
      <ModalContent borderRadius="2xl" overflow="hidden" maxH="92vh" mx={4}>
        <ModalHeader p={0}>
          <Box bg="linear-gradient(135deg, #F0FFF4 0%, #EBF8FF 100%)" px={7} py={6}>
            <Flex justify="space-between" align="flex-start" gap={4}>
              <Box>
                <HStack spacing={2} mb={1}>
                  <Text fontSize="xl" fontWeight="900" color="gray.900">
                    관리자 근무지 관리
                  </Text>
                  <Badge colorScheme="green" borderRadius="full" px={3}>
                    현재 {workPlaceCount.toLocaleString()}곳
                  </Badge>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  전체 근무지 목록을 추가, 수정, 삭제하고 기본 일급 단가를 관리합니다.
                </Text>
              </Box>
              <ModalCloseButton position="static" />
            </Flex>
          </Box>
        </ModalHeader>

        <ModalBody bg="gray.50" px={7} py={6} overflow="auto">
          <Flex direction={{ base: "column", lg: "row" }} gap={5} align="stretch">
            <Box
              bg="white"
              border="1px solid"
              borderColor="gray.100"
              borderRadius="xl"
              p={5}
              w={{ base: "100%", lg: "34%" }}
              minW={{ lg: "320px" }}
            >
              <Flex justify="space-between" align="center" gap={3} mb={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="900" color="gray.700">
                    근무지 목록
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    항목을 선택하면 오른쪽에서 수정합니다.
                  </Text>
                </Box>
                <Button size="sm" colorScheme="blue" onClick={handleNew}>
                  추가
                </Button>
              </Flex>

              <Input
                size="sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="근무지 검색"
                mb={3}
              />

              <VStack align="stretch" spacing={2} maxH="420px" overflowY="auto" pr={1}>
                {filteredWorkPlaces.length === 0 ? (
                  <Box bg="gray.50" borderRadius="lg" p={4}>
                    <Text fontSize="sm" color="gray.500">
                      등록된 근무지가 없습니다.
                    </Text>
                  </Box>
                ) : (
                  filteredWorkPlaces.map((place) => {
                    const selected =
                      place.admin_work_place_uuid === form.admin_work_place_uuid;

                    return (
                      <Box
                        key={place.admin_work_place_uuid}
                        as="button"
                        type="button"
                        textAlign="left"
                        border="1px solid"
                        borderColor={selected ? "blue.300" : "gray.100"}
                        bg={selected ? "blue.50" : "gray.50"}
                        borderRadius="lg"
                        p={3}
                        onClick={() => {
                          setIsAdding(false);
                          setForm(toForm(place));
                        }}
                      >
                        <Text fontSize="sm" fontWeight="900" color="gray.800" noOfLines={1}>
                          {place.work_place}
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          기본 {formatWon(place.base_hourly_wage)}
                        </Text>
                      </Box>
                    );
                  })
                )}
              </VStack>
            </Box>

            <Box
              bg="white"
              border="1px solid"
              borderColor="gray.100"
              borderRadius="xl"
              p={5}
              flex="1"
              minW={0}
            >
              <Flex justify="space-between" align="center" gap={3} mb={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="900" color="gray.700">
                    {isEditMode ? "근무지 수정" : "근무지 추가"}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    저장 후 검색 목록과 유저 일급 등록 모달에 반영됩니다.
                  </Text>
                </Box>
                {isEditMode && (
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    leftIcon={<DeleteIcon />}
                    onClick={handleDelete}
                    isLoading={deleting}
                  >
                    삭제
                  </Button>
                )}
              </Flex>

              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5} minW={0}>
                <Box gridColumn={{ base: "auto", lg: "1 / -1" }} minW={0}>
                  <Text fontSize="xs" fontWeight="800" color="gray.500" mb={1}>
                    근무지명
                  </Text>
                  <Input
                    w="100%"
                    value={form.work_place}
                    onChange={(e) => handleChange("work_place", e.target.value)}
                    placeholder="예: 삼성전자(천안)"
                  />
                </Box>
                {RATE_FIELDS.map((field) => (
                  <Box key={field.key} minW={0}>
                    <Text fontSize="xs" fontWeight="800" color="gray.500" mb={1}>
                      {field.label}
                    </Text>
                    <Input
                      w="100%"
                      type="number"
                      value={form[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder="금액 입력"
                    />
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </Flex>
        </ModalBody>

        <Divider />

        <ModalFooter bg="white" px={7} py={4}>
          <Flex w="100%" justify="space-between" align="center" gap={3}>
            <Text fontSize="sm" color="gray.500">
              삭제 전 해당 근무지와 연결된 유저 단가가 있는지 확인해주세요.
            </Text>
            <HStack>
              <Button variant="ghost" onClick={handleClose} isDisabled={saving || deleting}>
                닫기
              </Button>
              <Button
                leftIcon={<CheckIcon />}
                colorScheme="blue"
                onClick={handleSubmit}
                isLoading={saving}
                isDisabled={deleting}
              >
                {isEditMode ? "수정" : "추가"}
              </Button>
            </HStack>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
