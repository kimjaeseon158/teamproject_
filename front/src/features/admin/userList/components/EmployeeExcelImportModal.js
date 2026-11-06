import {
  Alert, AlertIcon, Box, Button, Flex, Icon, IconButton, ListItem,
  Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
  ModalOverlay, Text, UnorderedList, VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FiFile, FiUploadCloud, FiX } from "react-icons/fi";
import { createEmployeesBulk } from "../api/adminPageAddPerson";
import { parseEmployeeExcel } from "../utils/employeeExcel";

const ERROR_CODE_FIELDS = {
  DUPLICATE_RESIDENT_NUMBER: { type: "duplicate", label: "주민등록번호" },
  DUPLICATE_PHONE_NUMBER: { type: "duplicate", label: "전화번호" },
  DUPLICATE_USER_ID: { type: "duplicate", label: "아이디" },
  REQUIRED_USER_NAME: { type: "required", label: "이름" },
  REQUIRED_RESIDENT_NUMBER: { type: "required", label: "주민등록번호" },
  REQUIRED_MOBILE_CARRIER: { type: "required", label: "통신사" },
  REQUIRED_PHONE_NUMBER: { type: "required", label: "전화번호" },
  REQUIRED_ADDRESS: { type: "required", label: "주소" },
  REQUIRED_USER_ID: { type: "required", label: "아이디" },
};

const summarizeCodes = (codes) => {
  const duplicateFields = [];
  const requiredFields = [];
  const unknownCodes = [];

  [...new Set(codes)].forEach((code) => {
    const field = ERROR_CODE_FIELDS[code];
    if (!field) unknownCodes.push(code);
    else if (field.type === "duplicate") duplicateFields.push(field.label);
    else requiredFields.push(field.label);
  });

  const messages = [];
  if (duplicateFields.length) messages.push(`${duplicateFields.join(", ")}가 이미 등록되어 있습니다.`);
  if (requiredFields.length) messages.push(`${requiredFields.join(", ")}가 비어 있습니다.`);
  if (unknownCodes.length) messages.push(unknownCodes.join(", "));
  return messages.join(" ");
};

const formatServerErrors = (serverErrors, employeeNumbers = []) => {
  if (!Array.isArray(serverErrors)) return [];
  const grouped = new Map();
  const plainMessages = [];

  serverErrors.forEach((item) => {
    if (typeof item === "string") {
      plainMessages.push(item);
      return;
    }

    const key = `${item?.row ?? "unknown"}-${item?.user_name ?? ""}`;
    const employeeNumber = item?.row
      ? employeeNumbers[Number(item.row) - 1] || item.row
      : null;
    const current = grouped.get(key) || {
      employee: `${employeeNumber ? `번호 ${employeeNumber}` : "직원"}${item?.user_name ? ` (${item.user_name})` : ""}`,
      codes: [],
      messages: [],
    };
    current.codes.push(...(Array.isArray(item?.codes) ? item.codes : []));
    if (item?.message) current.messages.push(item.message);
    grouped.set(key, current);
  });

  return [
    ...[...grouped.values()].map(({ employee, codes, messages }) => {
      const summaries = [];
      if (codes.length) summaries.push(summarizeCodes(codes));
      summaries.push(...new Set(messages));
      return `${employee}: ${summaries.filter(Boolean).join(" ") || "등록에 실패했습니다."}`;
    }),
    ...plainMessages,
  ];
};

export default function EmployeeExcelImportModal({ isOpen, onClose, onSuccess, toast }) {
  const submitting = useRef(false);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeeNumbers, setEmployeeNumbers] = useState([]);
  const [errors, setErrors] = useState([]);
  const [resultSummary, setResultSummary] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setEmployees([]);
      setEmployeeNumbers([]);
      setErrors([]);
      setResultSummary(null);
    }
  }, [isOpen]);

  const selectFile = async (selectedFile) => {
    setFile(selectedFile);
    setEmployees([]);
    setEmployeeNumbers([]);
    setErrors([]);
    setResultSummary(null);
    if (!selectedFile) return;

    setParsing(true);
    try {
      const parsed = await parseEmployeeExcel(selectedFile);
      setEmployees(parsed.employees);
      setEmployeeNumbers(parsed.employeeNumbers);
      setErrors(parsed.errors);
    } catch (error) {
      setErrors([error.message || "엑셀 파일을 읽지 못했습니다."]);
    } finally {
      setParsing(false);
    }
  };

  const handleFileChange = (event) => selectFile(event.target.files?.[0] || null);

  const handleDrop = (event) => {
    event.preventDefault();
    if (saving) return;
    selectFile(event.dataTransfer.files?.[0] || null);
  };

  const clearFile = () => {
    setFile(null);
    setEmployees([]);
    setEmployeeNumbers([]);
    setErrors([]);
    setResultSummary(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (submitting.current || !employees.length || errors.length) return;
    submitting.current = true;
    setSaving(true);
    try {
      const result = await createEmployeesBulk(employees, { toast });
      const savedCount = Number(result?.saved_count) || 0;
      const failedCount = Number(result?.failed_count) || 0;
      const serverErrors = formatServerErrors(result?.errors, employeeNumbers);
      if (result?.error && !serverErrors.length) serverErrors.push(result.error);

      setResultSummary({ savedCount, failedCount });
      setErrors(serverErrors);

      if (savedCount > 0) {
        await onSuccess?.();
        toast?.({
          title: failedCount ? "직원 일부 등록 완료" : "직원 일괄등록 완료",
          description: `${savedCount.toLocaleString()}명 등록, ${failedCount.toLocaleString()}명 실패`,
          status: failedCount ? "warning" : "success",
          duration: 3500,
          isClosable: true,
        });
      }
      if (failedCount === 0 && savedCount === employees.length) onClose();
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose} size="lg" isCentered closeOnOverlayClick={!saving}>
      <ModalOverlay />
      <ModalContent borderRadius="xl">
        <ModalHeader>직원 엑셀 가져오기</ModalHeader>
        <ModalCloseButton isDisabled={saving} />
        <ModalBody>
          <VStack align="stretch" spacing={5}>
            <Alert status="info" borderRadius="md" alignItems="flex-start">
              <AlertIcon />
              <Text fontSize="sm" lineHeight="1.6" wordBreak="keep-all" overflowWrap="break-word">
                직원등록 시트의 번호, 이름, 주민등록번호, 통신사, 전화번호, 주소, 아이디 순서를 유지해 주세요.
              </Text>
            </Alert>

            <input ref={fileInputRef} type="file" accept=".xlsx" hidden onChange={handleFileChange} />
            {!file ? (
              <Box
                role="button"
                tabIndex={0}
                border="2px dashed"
                borderColor="blue.200"
                borderRadius="xl"
                bg="blue.50"
                px={6}
                py={9}
                textAlign="center"
                cursor="pointer"
                transition="all 0.15s ease"
                _hover={{ bg: "blue.100", borderColor: "blue.300" }}
                _focusVisible={{ boxShadow: "outline" }}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click();
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
              >
                <Icon as={FiUploadCloud} boxSize={9} color="blue.500" mb={2} />
                <Text fontWeight="700" color="gray.800">엑셀 파일을 놓거나 클릭해서 선택하세요</Text>
                <Text mt={1} fontSize="sm" color="gray.500">.xlsx 파일만 사용할 수 있습니다.</Text>
              </Box>
            ) : (
              <Flex align="center" gap={3} borderWidth="1px" borderColor="gray.200" borderRadius="lg" px={4} py={3} bg="gray.50">
                <Icon as={FiFile} boxSize={6} color="green.600" flexShrink={0} />
                <Box minW={0} flex={1}>
                  <Text fontWeight="600" fontSize="sm" noOfLines={1}>{file.name}</Text>
                  <Text fontSize="xs" color="gray.500">{(file.size / 1024).toLocaleString(undefined, { maximumFractionDigits: 1 })} KB</Text>
                </Box>
                <IconButton aria-label="선택한 파일 삭제" icon={<FiX />} size="sm" variant="ghost" colorScheme="red" onClick={clearFile} isDisabled={saving} />
              </Flex>
            )}

            {parsing && <Text fontSize="sm" color="blue.600">엑셀 파일을 확인하고 있습니다.</Text>}
            {!parsing && employees.length > 0 && errors.length === 0 && !resultSummary && (
              <Alert status="success" borderRadius="md">
                <AlertIcon />{employees.length.toLocaleString()}명의 직원 정보가 확인되었습니다.
              </Alert>
            )}
            {resultSummary && (
              <Alert status={resultSummary.failedCount ? "warning" : "success"} borderRadius="md">
                <AlertIcon />등록 {resultSummary.savedCount.toLocaleString()}명, 실패 {resultSummary.failedCount.toLocaleString()}명
              </Alert>
            )}
            {errors.length > 0 && (
              <Box bg="red.50" borderRadius="md" p={4} maxH="220px" overflowY="auto">
                <Text fontSize="sm" fontWeight="700" color="red.700" mb={2}>
                  {resultSummary ? "등록하지 못한 직원" : "확인이 필요한 항목"}
                </Text>
                <UnorderedList spacing={1} pl={4}>
                  {errors.slice(0, 50).map((message, index) => (
                    <ListItem
                      key={`${message}-${index}`}
                      fontSize="sm"
                      lineHeight="1.65"
                      color="red.700"
                      wordBreak="keep-all"
                      overflowWrap="break-word"
                    >
                      {message}
                    </ListItem>
                  ))}
                </UnorderedList>
                {errors.length > 50 && <Text mt={2} fontSize="xs" color="red.600">외 {errors.length - 50}건</Text>}
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button mr={2} onClick={onClose} isDisabled={saving}>{resultSummary ? "닫기" : "취소"}</Button>
          {!resultSummary && (
            <Button colorScheme="green" onClick={handleSubmit} isDisabled={parsing || !employees.length || errors.length > 0} isLoading={saving} loadingText="등록 중">
              전체 등록
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
