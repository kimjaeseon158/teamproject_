import ApproveFilterBar from "./ApproveFilterBar";

export default function ApprovalFilters({ approval }) {
  return (
        <ApproveFilterBar
          status={approval.status}
          setStatus={approval.setStatus}
          onStatusChange={approval.handleStatusChange}
          workPlace={approval.workPlace}
          setWorkPlace={approval.setWorkPlace}
          workPlaces={approval.workPlaces}
          workPlacesLoading={approval.workPlacesLoading}
          workType={approval.workType}
          setWorkType={approval.setWorkType}
          userName={approval.userName}
          setUserName={approval.setUserName}
          extraWork={approval.extraWork}
          setExtraWork={approval.setExtraWork}
          range={approval.range}
          setRange={approval.handleRangeChange}
          rangeLabel={approval.rangeLabel}
          selectedMonth={approval.selectedMonth}
          onMonthChange={approval.handleMonthChange}
          onRangeReset={approval.handleRangeReset}
          onReset={approval.handleResetFilters}
          loading={approval.loading}
          onSearch={approval.handleSearch}
        />
  );
}
