import React, { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, HStack, Stack, Text, useToast, VStack } from "@chakra-ui/react";

import { useUser } from "../../auth/userContext";
import locationsList from "../../common/work_placeColumns/locationsList";
import { getExtraWorkTimes } from "../../common/workTimeUtils";
import workTimeList from "../data/workTimeList";
import { useOptionHandlers } from "../hook/useOptionHandlers";
import { calculateNetMinutes, diffMinutes, minutesToHM } from "../utils/timeUtils";
import OptionExtraWorkSection from "./OptionExtraWorkSection";
import OptionLocationSection from "./OptionLocationSection";
import OptionSegmentedControl from "./OptionSegmentedControl";
import OptionSubmitConfirmDialog from "./OptionSubmitConfirmDialog";
import OptionTimeSection from "./OptionTimeSection";
import "./activity.css";

const DEFAULT_MOBILE_START_TIME = "08:00";
const DEFAULT_MOBILE_FINISH_TIME = "17:00";
const DEFAULT_MOBILE_WORK_TIME = `${DEFAULT_MOBILE_START_TIME}~${DEFAULT_MOBILE_FINISH_TIME}`;

const createExtraWorkRow = (type = "weekday_ot", startTime = "", finishTime = "") => {
  const times = getExtraWorkTimes(type, startTime, finishTime);
  return {
    type,
    ...times,
    duration: minutesToHM(diffMinutes(times.start, times.finish)),
  };
};

const Option = ({ selectedDate, onRefresh, onClose, isMobile = false }) => {
  const { userUuid, userName } = useUser();
  const toast = useToast();
  const cancelRef = useRef();

  const [location, setLocation] = useState("");
  const [workTime, setWorkTime] = useState("");
  const [startTime, setStartTime] = useState("");
  const [finishTime, setFinishTime] = useState("");
  const [baseShift, setBaseShift] = useState("주간");
  const [isSpecial, setIsSpecial] = useState(false);
  const [extraEnabled, setExtraEnabled] = useState(false);
  const [extraWorks, setExtraWorks] = useState([]);
  const [cart, setCart] = useState([]);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredWorkTimeList = useMemo(
    () => workTimeList.filter((time) => time.shift === baseShift),
    [baseShift]
  );

  const today = new Date();
  const displayDate = selectedDate ?? {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };

  useEffect(() => {
    if (!isMobile) return;

    setStartTime((prev) => prev || DEFAULT_MOBILE_START_TIME);
    setFinishTime((prev) => prev || DEFAULT_MOBILE_FINISH_TIME);
    setWorkTime((prev) => prev || DEFAULT_MOBILE_WORK_TIME);
  }, [isMobile]);

  const totalWorkTimeHM = useMemo(() => {
    let totalMins = 0;

    if (startTime && finishTime) {
      totalMins += calculateNetMinutes(startTime, finishTime);
    }

    if (extraEnabled) {
      extraWorks.forEach((extraWork) => {
        if (extraWork.start && extraWork.finish) {
          totalMins += diffMinutes(extraWork.start, extraWork.finish);
        }
      });
    }

    return totalMins > 0 ? minutesToHM(totalMins) : "";
  }, [startTime, finishTime, extraEnabled, extraWorks]);

  useEffect(() => {
    if (extraEnabled && extraWorks.length === 0) {
      setExtraWorks([createExtraWorkRow("weekday_ot", startTime, finishTime)]);
    }
    if (!extraEnabled && extraWorks.length > 0) {
      setExtraWorks([]);
    }
  }, [extraEnabled, extraWorks.length, startTime, finishTime]);

  useEffect(() => {
    if (!extraEnabled || extraWorks.length === 0) return;

    setExtraWorks((prev) =>
      prev.map((row) => {
        const type = row.type || "weekday_ot";
        const times = getExtraWorkTimes(type, startTime, finishTime);
        return {
          ...row,
          type,
          ...times,
          duration: minutesToHM(diffMinutes(times.start, times.finish)),
        };
      })
    );
  }, [startTime, finishTime, extraEnabled, extraWorks.length]);

  const resetForm = () => {
    setLocation("");
    setWorkTime(isMobile ? DEFAULT_MOBILE_WORK_TIME : "");
    setStartTime(isMobile ? DEFAULT_MOBILE_START_TIME : "");
    setFinishTime(isMobile ? DEFAULT_MOBILE_FINISH_TIME : "");
    setIsSpecial(false);
    setExtraEnabled(false);
    setExtraWorks([]);
  };

  const handleShiftChange = (shift) => {
    setBaseShift(shift);
    setWorkTime("");
    setStartTime("");
    setFinishTime("");
  };

  const handleSelectWorkTime = (start, finish) => {
    setStartTime(start);
    setFinishTime(finish);
    setWorkTime(`${start}~${finish}`);
  };

  const handleStartTimeChange = (value) => {
    setStartTime(value);
    setWorkTime(`${value}~${finishTime || DEFAULT_MOBILE_FINISH_TIME}`);
  };

  const handleFinishTimeChange = (value) => {
    setFinishTime(value);
    setWorkTime(`${startTime || DEFAULT_MOBILE_START_TIME}~${value}`);
  };

  const updateExtraWork = (index, patch) => {
    setExtraWorks((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) return row;

        const nextRow = { ...row, ...patch };
        if (patch.type) {
          const times = getExtraWorkTimes(patch.type, startTime, finishTime);
          nextRow.start = times.start;
          nextRow.finish = times.finish;
        }
        nextRow.duration =
          nextRow.start && nextRow.finish
            ? minutesToHM(diffMinutes(nextRow.start, nextRow.finish))
            : "";
        return nextRow;
      })
    );
  };

  const handleRemoveExtraRow = (index) => {
    setExtraWorks((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const {
    handleAddToCart,
    handleDeleteFromCart,
    handleSubmitAll,
    handleConfirmSubmitAll,
  } = useOptionHandlers({
    selectedDate,
    userUuid,
    userName,
    cart,
    setCart,
    toast,
    resetForm,
    baseShift,
    isSpecial,
    startTime,
    finishTime,
    location,
    extraEnabled,
    extraWorks,
    setIsSubmitConfirmOpen,
    isSubmitting,
    setIsSubmitting,
    onRefresh,
    onClose,
  });

  useEffect(() => {
    if (cart.length === 0 && isSubmitConfirmOpen) {
      setIsSubmitConfirmOpen(false);
    }
  }, [cart.length, isSubmitConfirmOpen]);

  return (
    <Stack spacing={5} color="white" w="100%" pb={10}>
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={0}>
          <Text fontSize="2xl" fontWeight="900" letterSpacing="0">
            {displayDate.month}월 {displayDate.day}일
          </Text>
          <Text fontSize="xs" color="gray.500">
            {displayDate.year}년 노동 기록
          </Text>
        </VStack>
        <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
          {baseShift} {isSpecial && "/ 특근"}
        </Badge>
      </HStack>

      <OptionSegmentedControl
        baseShift={baseShift}
        isSpecial={isSpecial}
        onShiftChange={handleShiftChange}
        onSpecialToggle={() => setIsSpecial((prev) => !prev)}
      />

      <OptionTimeSection
        isMobile={isMobile}
        startTime={startTime}
        finishTime={finishTime}
        workTime={workTime}
        totalWorkTimeHM={totalWorkTimeHM}
        filteredWorkTimeList={filteredWorkTimeList}
        onStartTimeChange={handleStartTimeChange}
        onFinishTimeChange={handleFinishTimeChange}
        onSelectWorkTime={handleSelectWorkTime}
      />

      <OptionLocationSection
        location={location}
        locations={locationsList}
        onChange={setLocation}
      />

      <OptionExtraWorkSection
        enabled={extraEnabled}
        rows={extraWorks}
        isMobile={isMobile}
        onEnabledChange={setExtraEnabled}
        onUpdate={updateExtraWork}
        onRemove={handleRemoveExtraRow}
      />

      <VStack spacing={3} pt={2}>
        <Button
          w="100%"
          h="56px"
          colorScheme="blue"
          borderRadius="18px"
          fontSize="lg"
          fontWeight="800"
          onClick={handleAddToCart}
          boxShadow="0 8px 20px -8px rgba(49, 130, 206, 0.5)"
        >
          임시 저장소에 추가
        </Button>

        {cart.length > 0 && (
          <Button
            w="100%"
            h="56px"
            colorScheme="green"
            variant="outline"
            borderWidth="2px"
            borderRadius="18px"
            onClick={handleSubmitAll}
          >
            기록 모두 등록 ({cart.length}건)
          </Button>
        )}
      </VStack>

      <OptionSubmitConfirmDialog
        isOpen={isSubmitConfirmOpen}
        cancelRef={cancelRef}
        cart={cart}
        onClose={() => setIsSubmitConfirmOpen(false)}
        onDelete={handleDeleteFromCart}
        onConfirm={handleConfirmSubmitAll}
      />
    </Stack>
  );
};

export default Option;
