import { useEffect, useRef, useState } from "react";
import { Badge, Button, HStack, Stack, Text, useDisclosure, useToast, VStack } from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";

import { useUser } from "../../auth/userContext";
import OptionActionButtons from "./OptionActionButtons";
import OptionExtraWorkSection from "./OptionExtraWorkSection";
import OptionLocationSection from "./OptionLocationSection";
import OptionNoteSection from "./OptionNoteSection";
import OptionSegmentedControl from "./OptionSegmentedControl";
import OptionSubmitConfirmDialog from "./OptionSubmitConfirmDialog";
import OptionTimeSection from "./OptionTimeSection";
import PreviousWorkApplyModal from "./PreviousWorkApplyModal";
import { fetchUserWorkPlaces } from "../api/userWorkPlaces";
import useOptionForm from "../hook/useOptionForm";
import "./activity.css";

const getDisplayDate = (selectedDate) => {
  const today = new Date();
  return (
    selectedDate ?? {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    }
  );
};

const Option = ({
  events = [],
  existingWorks = [],
  selectedDate,
  onRefresh,
  onClose,
  isMobile = false,
}) => {
  const { userUuid, userName, workPlaces, setUserWorkPlaces } = useUser();
  const toast = useToast();
  const cancelRef = useRef();
  const [workPlacesLoading, setWorkPlacesLoading] = useState(false);
  const previousWorkModal = useDisclosure();
  const displayDate = getDisplayDate(selectedDate);
  const form = useOptionForm({
    existingWorks,
    isMobile,
    onClose,
    onRefresh,
    selectedDate,
    toast,
    userName,
    userUuid,
  });

  const previousWork = events
    .flatMap((event) => {
      const data = event.extendedProps || {};
      return data.grouped_items?.length ? data.grouped_items : [data];
    })
    .filter(
      (work) =>
        (work.work_date || work.date) < selectedDate?.formatted &&
        work.work_shift === form.baseShift
    )
    .sort((a, b) =>
      String(b.work_date || b.date).localeCompare(String(a.work_date || a.date))
    )[0];

  useEffect(() => {
    if (!userUuid) return;

    let ignore = false;
    setWorkPlacesLoading(true);

    fetchUserWorkPlaces({ toast })
      .then((places) => {
        if (!ignore) setUserWorkPlaces(places);
      })
      .catch((error) => {
        if (!ignore) {
          toast({
            title: "근무지를 불러오지 못했습니다.",
            description: error?.message,
            status: "error",
          });
        }
      })
      .finally(() => {
        if (!ignore) setWorkPlacesLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [setUserWorkPlaces, toast, userUuid]);

  return (
    <Stack spacing={5} color="white" w="100%" pb={10}>
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={0}>
          <Text fontSize="2xl" fontWeight="900" letterSpacing="0">
            {displayDate.month}월 {displayDate.day}일
          </Text>
          <Text fontSize="xs" color="gray.500">
            {displayDate.year}년 근무 기록
          </Text>
        </VStack>
        <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
          {form.baseShift} {form.isSpecial && "/ 특근"}
        </Badge>
      </HStack>

      <OptionSegmentedControl
        baseShift={form.baseShift}
        isSpecial={form.isSpecial}
        onShiftChange={form.handleShiftChange}
        onSpecialToggle={() => form.setIsSpecial((prev) => !prev)}
      />

      <Button
        leftIcon={<RepeatIcon />}
        variant="outline"
        colorScheme="blue"
        borderRadius="12px"
        onClick={previousWorkModal.onOpen}
        isDisabled={!previousWork}
      >
        이전 근무 적용
      </Button>
      <Text mt={-3} textAlign="center" fontSize="xs" color="gray.500">
        {previousWork
          ? "가장 최근 동일 근무를 불러옵니다."
          : "이전에 등록된 동일 근무가 없습니다."}
      </Text>

      <OptionTimeSection
        isMobile={isMobile}
        startTime={form.startTime}
        finishTime={form.finishTime}
        workTime={form.workTime}
        totalWorkTimeHM={form.totalWorkTimeHM}
        filteredWorkTimeList={form.filteredWorkTimeList}
        onStartTimeChange={form.handleStartTimeChange}
        onFinishTimeChange={form.handleFinishTimeChange}
        onSelectWorkTime={form.handleSelectWorkTime}
      />

      <OptionLocationSection
        isMobile={isMobile}
        isLoading={workPlacesLoading}
        location={form.location}
        locations={workPlaces}
        onChange={form.setLocation}
      />

      <OptionNoteSection
        isMobile={isMobile}
        note={form.note}
        onChange={form.setNote}
      />

      <OptionExtraWorkSection
        enabled={form.extraEnabled}
        rows={form.extraWorks}
        isMobile={isMobile}
        onEnabledChange={form.setExtraEnabled}
        onAdd={form.handleAddExtraRow}
        onUpdate={form.updateExtraWork}
        onRemove={form.handleRemoveExtraRow}
      />

      <OptionActionButtons
        cartCount={form.cart.length}
        onAddToCart={form.handleAddToCart}
        onSubmitAll={form.handleSubmitAll}
      />

      <OptionSubmitConfirmDialog
        isOpen={form.isSubmitConfirmOpen}
        cancelRef={cancelRef}
        cart={form.cart}
        onClose={() => form.setIsSubmitConfirmOpen(false)}
        onDelete={form.handleDeleteFromCart}
        onConfirm={form.handleConfirmSubmitAll}
      />

      <PreviousWorkApplyModal
        isOpen={previousWorkModal.isOpen}
        onClose={previousWorkModal.onClose}
        previousWork={previousWork}
        isMobile={isMobile}
        workPlaces={workPlaces}
        onApply={(values) => {
          form.applyPreviousWork(values);
          previousWorkModal.onClose();
          toast({ title: "이전 근무를 적용했습니다.", status: "success" });
        }}
      />
    </Stack>
  );
};

export default Option;
