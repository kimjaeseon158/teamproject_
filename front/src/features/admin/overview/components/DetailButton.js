import { Button } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export default function DetailButton({ onClick }) {
  return (
    <Button size="xs" variant="outline" rightIcon={<ExternalLinkIcon />} onClick={onClick} flexShrink={0}>
      상세
    </Button>
  );
}
