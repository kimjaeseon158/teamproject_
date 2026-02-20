import { useEffect, useState } from "react";
import { useDailyPay } from "../hooks/useWorkList";
import { useToast } from "@chakra-ui/react";
import { userPlace_listColmns}  from "./DailyPayColmns";
import { useWorkPlaceRate } from "../hooks/useWrokPlaceRate";


import CommonTable from "../../shared/mytable";
import AddButton from "../../shared/AddButton";
import AddRateModal from "../testModal/AddRateModal";


export default function DailyPayPage() {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const { data, loading, fetchDailyPay } = useDailyPay();
  const {
    handleAdd,
    handleUpdate,
    handleDelete,
  } = useWorkPlaceRate(toast);
  useEffect(() => {
    fetchDailyPay({}, toast);
  }, []);

  return (
    <div>
      <AddButton
        addLabel="일급 추가"
        onAdd={() => setIsOpen(true)}
      />

       <AddRateModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => {
          console.log("데이터 다시 불러오기");
        }}
      />
      {loading && "로딩중..."}
      <CommonTable columns={userPlace_listColmns} data={data} />
    </div>
  );
}
