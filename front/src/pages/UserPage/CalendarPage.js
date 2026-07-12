import useCalendarPage from "../../features/user/hook/useCalendarPage";
import CalendarDesktopLayout from "../../features/user/layout/CalendarDesktopLayout";
import CalendarMobileLayout from "../../features/user/layout/CalendarMobileLayout";

import "../css/calendar.css";

export default function CalendarPage() {
  const layoutProps = useCalendarPage();

  return layoutProps.isMobile ? (
    <CalendarMobileLayout {...layoutProps} />
  ) : (
    <CalendarDesktopLayout {...layoutProps} />
  );
}
