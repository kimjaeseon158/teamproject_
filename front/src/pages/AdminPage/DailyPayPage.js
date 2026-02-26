import { useEffect, useState, useMemo } from "react";
import { useDailyPay } from "../../feactures/admin/work_palce/hook/useWorkList";
import { useToast, Button } from "@chakra-ui/react";
import { userPlace_listColmns } from "./DailyPayColmns";

import CommonTable from "../../feactures/common/mytable";
import AddRateModal from "../../feactures/admin/work_palce/components/AddRateModal";
import SearchRateModal from "../../feactures/admin/work_palce/components/SearchRateModal";

export default function DailyPayPage() {
  const toast = useToast();
  const { data, fetchDailyPay } = useDailyPay();

  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  /**
   * ✅ 최초 1회만 실행됨
   * fetchDailyPay가 고정되어 있으므로 무한루프 없음
   */
  useEffect(() => {
    fetchDailyPay({}, toast);
  }, [fetchDailyPay, toast]);

  const mergedData = useMemo(() => {
    return (
      data?.map((user) => {
        const rates = user.rates || [];

        const workPlaces = rates
          .map((r) => r.work_place)
          .filter(Boolean);

        const average = (arr) => {
          if (!arr.length) return null;
          const valid = arr.filter((v) => v != null);
          if (!valid.length) return null;

          return Math.round(
            valid.reduce((a, b) => a + Number(b), 0) /
              valid.length
          );
        };

        return {
          user_uuid: user.user_uuid,
          user_name: user.user_name,
          work_place: workPlaces.join(" / "),
          base_hourly_wage: average(
            rates.map((r) => r.base_hourly_wage)
          ),
          overtime_hourly_wage: average(
            rates.map((r) => r.overtime_hourly_wage)
          ),
          overnight_hourly_wage: average(
            rates.map((r) => r.overnight_hourly_wage)
          ),
        };
      }) || []
    );
  }, [data]);

  const columnsWithEdit = useMemo(
    () => [
      ...userPlace_listColmns,
      {
        key: "edit",
        label: "관리",
        render: (_, row) => (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              const user = data.find(
                (u) => u.user_uuid === row.user_uuid
              );
              setSelectedUser(user);
            }}
          >
            edit
          </Button>
        ),
      },
    ],
    [data]
  );

  return (
    <div>
      <div style={{ display: "flex", gap: "10px" }}>
        <Button
          colorScheme="blue"
          onClick={() => setIsSearchOpen(true)}
        >
          검색
        </Button>

        <Button
          onClick={() => fetchDailyPay({}, toast)}
        >
          전체보기
        </Button>
      </div>

      <CommonTable
        columns={columnsWithEdit}
        data={mergedData}
        rowKey="user_uuid"
      />

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
        onSearch={(params) =>
          fetchDailyPay(params, toast)
        }
      />
    </div>
  );
}