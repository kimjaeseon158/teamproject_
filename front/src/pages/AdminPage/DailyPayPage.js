import { useEffect, useState, useMemo } from "react";
import { useDailyPay } from "../../feactures/admin/work_palce/hook/useWorkList";
import { useToast, Button } from "@chakra-ui/react";
import { userPlace_listColmns } from "./DailyPayColmns";

import CommonTable from "../../feactures/admin/common/mytable";
import AddButton from "../../common/AddButton";
import AddRateModal from "../../feactures/admin/work_palce/components/AddRateModal";
import SearchRateModal from "../../feactures/admin/work_palce/components/SearchRateModal";

export default function DailyPayPage() {
  const toast = useToast();
  const { data, loading, fetchDailyPay } = useDailyPay();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

useEffect(() => {
  fetchDailyPay({}, toast);
}, []);
  const flatData =
    data?.flatMap(user =>
      user.rates.map(rate => ({
        user_uuid: user.user_uuid,
        user_name: user.user_name,
        rate_uuid: rate.rate_uuid,
        work_place: rate.work_place,
        base_hourly_wage: rate.base_hourly_wage,
        overtime_hourly_wage: rate.overtime_hourly_wage,
        overnight_hourly_wage: rate.overnight_hourly_wage,
      }))
    ) || [];

  const columnsWithEdit = useMemo(() => [
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
              u => u.user_uuid === row.user_uuid
            );
            setSelectedUser(user);
          }}
        >
          edit
        </Button>
      ),
    },
  ], [data]);

  return (
    <div>

      {/* 상단 버튼 영역 */}
      <div style={{ display: "flex", gap: "10px" }}>
        {/* <AddButton
          addLabel="일급 추가"
          onAdd={() => setIsAddOpen(true)}
        /> */}

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
        data={flatData}
        rowKey="rate_uuid"
      />

      {/* 추가 모달 */}
      {isAddOpen && (
        <AddRateModal
          isOpen
          mode="add"
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => fetchDailyPay({}, toast)}
        />
      )}

      {/* 수정 모달 */}
      {selectedUser && (
        <AddRateModal
          isOpen
          mode="edit"
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => fetchDailyPay({}, toast)}
        />
      )}

      {/* 🔥 검색 모달 */}
      <SearchRateModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={(params) => fetchDailyPay(params, toast)}
      />
    </div>
  );
}