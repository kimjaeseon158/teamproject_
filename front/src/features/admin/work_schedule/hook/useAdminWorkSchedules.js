import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@chakra-ui/react";

import { fetchAdminWorkSchedules, saveAdminWorkSchedules } from "../api/adminWorkSchedules";
import { addDaysToDateValue, toLocalDateValue } from "../../../common/utils/dateValue";

const tempUuid = () => `new-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function useAdminWorkSchedules() {
  const toast = useToast();
  const [date, setDate] = useState(toLocalDateValue);
  const [data, setData] = useState({ dates: [], users: [] });
  const [deleted, setDeleted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [pendingWorkDate, setPendingWorkDate] = useState("");

  const load = useCallback(async (targetDate = date) => {
    setLoading(true);
    try {
      const response = await fetchAdminWorkSchedules(targetDate, { toast });
      setData(response || { dates: [], users: [] });
      setDeleted([]);
      setPendingWorkDate("");
    } catch (error) {
      toast({ title: "주간 근무표 조회에 실패했습니다.", description: error.message, status: "error" });
    } finally {
      setLoading(false);
    }
  }, [date, toast]);

  useEffect(() => { load(); }, [load]);

  const changeDate = (nextDate) => {
    setDate(nextDate);
  };

  const upsertSchedule = ({ userUuid, workDate, schedule }) => {
    setPendingWorkDate((current) => current || workDate);
    setData((current) => ({
      ...current,
      users: current.users.map((user) => {
        if (user.user_uuid !== userUuid) return user;
        const daySchedules = user.days?.[workDate] || [];
        const clientUuid = schedule.schedule_uuid || schedule.__client_uuid || tempUuid();
        const exists = daySchedules.some((item) =>
          (item.schedule_uuid || item.__client_uuid) === clientUuid
        );
        const nextSchedule = {
          ...schedule,
          __client_uuid: clientUuid,
          __dirty: Boolean(schedule.schedule_uuid),
          status_label: schedule.status_label,
        };
        return {
          ...user,
          days: {
            ...user.days,
            [workDate]: exists
              ? daySchedules.map((item) =>
                  (item.schedule_uuid || item.__client_uuid) === clientUuid ? nextSchedule : item
                )
              : [...daySchedules, nextSchedule],
          },
        };
      }),
    }));
  };

  const removeSchedule = ({ userUuid, workDate, schedule }) => {
    setPendingWorkDate((current) => current || workDate);
    if (schedule.schedule_uuid) {
      setDeleted((current) => Array.from(new Set([...current, schedule.schedule_uuid])));
    }
    setData((current) => ({
      ...current,
      users: current.users.map((user) => user.user_uuid !== userUuid ? user : {
        ...user,
        days: {
          ...user.days,
          [workDate]: (user.days?.[workDate] || []).filter((item) =>
            (item.schedule_uuid || item.__client_uuid || item.__draft_id) !==
            (schedule.schedule_uuid || schedule.__client_uuid || schedule.__draft_id)
          ),
        },
      }),
    }));
  };

  const changes = useMemo(() => {
    const create = [];
    const update = [];
    data.users.forEach((user) => {
      data.dates.forEach((workDate) => {
        (user.days?.[workDate] || []).forEach((schedule) => {
          const values = {
            status: schedule.status,
            admin_work_place_uuid: schedule.status === "OFF" ? null : schedule.admin_work_place_uuid || null,
            work_place_detail: schedule.work_place_detail || "",
          };
          if (!schedule.schedule_uuid) create.push({ user_uuid: user.user_uuid, work_date: workDate, ...values });
          else if (schedule.__dirty) update.push({ schedule_uuid: schedule.schedule_uuid, ...values });
        });
      });
    });
    return { create, update, delete: deleted };
  }, [data, deleted]);

  const changeCount = changes.create.length + changes.update.length + changes.delete.length;

  const copyPreviousDay = async (mode = "replace") => {
    const previousDate = addDaysToDateValue(date, -1);
    setCopying(true);
    try {
      const sourceData = data.dates.includes(previousDate)
        ? data
        : await fetchAdminWorkSchedules(previousDate, { toast });
      const sourceByUser = new Map(
        (sourceData?.users || []).map((user) => [user.user_uuid, user.days?.[previousDate] || []])
      );

      if (mode === "replace") {
        setPendingWorkDate((current) => current || date);
        const persistedTargetUuids = data.users.flatMap((user) =>
          (user.days?.[date] || []).map((item) => item.schedule_uuid).filter(Boolean)
        );
        setDeleted((current) => Array.from(new Set([...current, ...persistedTargetUuids])));
      }

      setData((current) => ({
        ...current,
        users: current.users.map((user) => {
          const currentSchedules = mode === "replace" ? [] : (user.days?.[date] || []);
          const copied = (sourceByUser.get(user.user_uuid) || [])
            .map((item) => {
              const copiedItem = { ...item, __client_uuid: tempUuid() };
              delete copiedItem.schedule_uuid;
              delete copiedItem.__dirty;
              return copiedItem;
            })
            .filter((candidate) => !currentSchedules.some((item) =>
              item.status === candidate.status &&
              (item.work_place || "") === (candidate.work_place || "") &&
              (item.work_place_detail || "") === (candidate.work_place_detail || "")
            ));
          return {
            ...user,
            days: { ...user.days, [date]: [...currentSchedules, ...copied] },
          };
        }),
      }));
      toast({ title: `${previousDate} 근무를 ${date}로 불러왔습니다.`, status: "success" });
    } catch (error) {
      toast({ title: "전날 근무를 불러오지 못했습니다.", description: error.message, status: "error" });
    } finally {
      setCopying(false);
    }
  };

  const copyEmployeePrevious = (userUuid, previousSchedules = []) => {
    setData((current) => ({
      ...current,
      users: current.users.map((user) => {
        if (user.user_uuid !== userUuid) return user;
        const currentSchedules = user.days?.[date] || [];
        const copied = previousSchedules
          .filter((candidate) => !currentSchedules.some((item) =>
            item.status === candidate.status &&
            (item.work_place || "") === (candidate.work_place || "") &&
            (item.work_place_detail || "") === (candidate.work_place_detail || "")
          ))
          .map((item) => {
            const copiedItem = { ...item, __client_uuid: tempUuid() };
            delete copiedItem.schedule_uuid;
            delete copiedItem.__dirty;
            return copiedItem;
          });
        return { ...user, days: { ...user.days, [date]: [...currentSchedules, ...copied] } };
      }),
    }));
  };

  const save = async () => {
    if (!changeCount) return;
    setSaving(true);
    try {
      await saveAdminWorkSchedules({ date: pendingWorkDate || date, ...changes }, { toast });
      setDeleted([]);
      setPendingWorkDate("");
      await load(date);
      toast({ title: "주간 근무표를 저장했습니다.", status: "success" });
    } catch (error) {
      toast({ title: "주간 근무표 저장에 실패했습니다.", description: error.message, status: "error" });
    } finally {
      setSaving(false);
    }
  };

  return {
    changeCount,
    changeDate: pendingWorkDate,
    copying,
    copyEmployeePrevious,
    copyPreviousDay,
    data,
    date,
    loading,
    reload: () => load(date),
    removeSchedule,
    save,
    saving,
    setDate: changeDate,
    upsertSchedule,
  };
}
