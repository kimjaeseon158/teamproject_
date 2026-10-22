import { Box, Button, Checkbox, Flex, HStack, Select, Tag, Text } from "@chakra-ui/react";
import { getStatusColor, getWorkTypeColor } from "../utils/approvePresentation";

export default function ApproveMobileTable({ rows, selectedIds, toggleAll, toggleOne, onRowClick, sortField, onMobileSort, selectableIds, selectedOnPageCount }) {
  return (
    <Box>
      <Flex px={4} py={3} align="center" justify="space-between" borderBottomWidth="1px" borderColor="gray.100">
        <Checkbox colorScheme="teal" isChecked={selectableIds.length > 0 && selectedOnPageCount === selectableIds.length} isIndeterminate={selectedOnPageCount > 0 && selectedOnPageCount < selectableIds.length} isDisabled={!selectableIds.length} onChange={(e) => toggleAll(e.target.checked, selectableIds)}>전체 선택</Checkbox>
        <Select aria-label="승인 내역 정렬" size="sm" w="118px" value={sortField} onChange={(e) => onMobileSort(e.target.value)}><option value="date">근무일순</option><option value="name">이름순</option><option value="totalWorkMinutes">근무시간순</option></Select>
      </Flex>
      {!rows.length && <Text py={16} textAlign="center" color="gray.500">조회된 근무 내역이 없습니다.</Text>}
      {rows.map((row) => <Flex key={row.id} px={4} py={4} gap={3} align="center" borderBottomWidth="1px" borderColor="gray.100" bg={selectedIds.has(row.id) ? "teal.50" : "white"}>
        <Checkbox p={1} colorScheme="teal" aria-label={`${row.name} ${row.date} 선택`} isChecked={selectedIds.has(row.id)} isDisabled={row.canApprove === false} onChange={(e) => toggleOne(row.id, e.target.checked)} />
        <Button variant="unstyled" h="auto" minW={0} flex={1} whiteSpace="normal" textAlign="left" onClick={() => onRowClick(row)} aria-label={`${row.name} ${row.date} 상세 보기`}>
          <Flex justify="space-between" align="center" gap={2}><Text fontWeight="700">{row.name}</Text><Text fontSize="sm" color="gray.700">{row.totalWorkDisplay || row.totalWorkHM || "-"}</Text></Flex>
          <Text mt={1.5} fontSize="sm" fontWeight="400" color="gray.500" overflowWrap="anywhere">{row.date} · {row.location || "근무지 미등록"}</Text>
          <HStack mt={2}><Tag size="sm" colorScheme={getWorkTypeColor(row.workType)}>{row.workType || "근무"}</Tag><Tag size="sm" colorScheme={getStatusColor(row.status)}>{row.status}</Tag></HStack>
        </Button>
      </Flex>)}
    </Box>
  );
}
