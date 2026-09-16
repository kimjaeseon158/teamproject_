import { useBreakpointValue } from "@chakra-ui/react";
import ApproveMobileFilterBar from "./ApproveMobileFilterBar";
import ApproveDesktopFilterBar from "./ApproveDesktopFilterBar";

export default function ApproveFilterBar(props) {
  const mobile = useBreakpointValue({ base: true, md: false });
  const Filter = mobile ? ApproveMobileFilterBar : ApproveDesktopFilterBar;
  return <Filter {...props} />;
}
