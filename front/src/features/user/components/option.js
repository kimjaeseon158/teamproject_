import { useRef } from "react";
import { Badge, HStack, Stack, Text, useToast, VStack } from "@chakra-ui/react";

import { useUser } from "../../auth/userContext";
import OptionActionButtons from "./OptionActionButtons";
import OptionExtraWorkSection from "./OptionExtraWorkSection";
import OptionLocationSection from "./OptionLocationSection";
import OptionSegmentedControl from "./OptionSegmentedControl";
import OptionSubmitConfirmDialog from "./OptionSubmitConfirmDialog";
import OptionTimeSection from "./OptionTimeSection";
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

const Option = ({ selectedDate, onRefresh, onClose, isMobile = false }) => {
  const { userUuid, userName, workPlaces } = useUser();
  const toast = useToast();
  const cancelRef = useRef();
  const displayDate = getDisplayDate(selectedDate);
  const form = useOptionForm({
    isMobile,
    onClose,
    onRefresh,
    selectedDate,
    toast,
    userName,
    userUuid,
  });

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
        location={form.location}
        locations={workPlaces}
        onChange={form.setLocation}
      />

      <OptionExtraWorkSection
        enabled={form.extraEnabled}
        rows={form.extraWorks}
        isMobile={isMobile}
        onEnabledChange={form.setExtraEnabled}
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
    </Stack>
  );
};

export default Option;
