import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  Text,
  InputGroup,
  InputLeftElement,
  Icon,
  Checkbox,
  Alert,
  AlertIcon,
  Link,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiUser, FiLock, FiShield } from "react-icons/fi";
import PasswordResetModal from "./PasswordResetModal";

const LoginForm = ({ role, values, errors, loginError, onChange, onSubmit, isLoading, rememberId, onRememberIdChange, failureCount = 0, isLoginLocked = false, onClearLoginError, onRetryAfterApproval }) => {
  const resetDisclosure = useDisclosure();
  const [resetRequestedFor, setResetRequestedFor] = useState("");
  const remaining = Math.max(0, 5 - failureCount);
  const normalizedId = values.id.trim().toLowerCase();
  const resetRequested = !!normalizedId && resetRequestedFor === normalizedId;

  useEffect(() => {
    if (resetRequestedFor && resetRequestedFor !== normalizedId) setResetRequestedFor("");
  }, [normalizedId, resetRequestedFor]);
  return (
    <Flex
      as="form"
      direction="column"
      onSubmit={onSubmit}
      gap={6}
    >
      {/* ================= 상단 영역 ================= */}
      <Box textAlign="center">
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color="gray.800"
        >
          {role === "admin" ? "관리자 로그인" : "사원 로그인"}
        </Text>
      </Box>

      {/* ================= 입력 영역 ================= */}
      <Flex direction="column" gap={5}>
        {/* 아이디 */}
        <FormControl isInvalid={!!errors.idError}>
          <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">아이디</FormLabel>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiUser} color="gray.400" />
            </InputLeftElement>
            <Input
              variant="filled"
              placeholder="아이디를 입력하세요"
              fontSize="md"
              bg="gray.50"
              _focus={{ bg: "white", borderColor: "blue.500" }}
              value={values.id}
              onChange={(e) => onChange("id", e.target.value)}
            />
          </InputGroup>
          <FormErrorMessage>{errors.idError}</FormErrorMessage>
        </FormControl>

        {/* 비밀번호 */}
        <FormControl isInvalid={!!errors.passwordError}>
          <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">비밀번호</FormLabel>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiLock} color="gray.400" />
            </InputLeftElement>
            <Input
              variant="filled"
              type="password"
              placeholder="비밀번호를 입력하세요"
              fontSize="md"
              bg="gray.50"
              _focus={{ bg: "white", borderColor: "blue.500" }}
              value={values.password}
              onChange={(e) => onChange("password", e.target.value)}
            />
          </InputGroup>
          <FormErrorMessage>{errors.passwordError}</FormErrorMessage>
        </FormControl>

        {/* 인증코드 (자리 고정) */}
        {role === "admin" && (
          <FormControl isInvalid={!!errors.admin_codeError}>
            <FormLabel fontSize="sm" fontWeight="semibold" color="gray.600">인증코드</FormLabel>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiShield} color="gray.400" />
              </InputLeftElement>
              <Input
                variant="filled"
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="인증코드 6자리"
                fontSize="md"
                bg="gray.50"
                _focus={{ bg: "white", borderColor: "blue.500" }}
                value={values.admin_code}
                onChange={(e) => onChange("admin_code", e.target.value)}
              />
            </InputGroup>
            <FormErrorMessage>{errors.admin_codeError}</FormErrorMessage>
          </FormControl>
        )}

        {/* 아이디 기억하기 */}
        <Checkbox
          colorScheme="blue"
          isChecked={rememberId}
          onChange={onRememberIdChange}
        >
          <Text fontSize="sm" color="gray.600">아이디 기억하기</Text>
        </Checkbox>

        {role === "user" && failureCount > 0 && !resetRequested && (
          <Alert status={isLoginLocked ? "error" : "warning"} borderRadius="md" fontSize="sm">
            <AlertIcon />
            {isLoginLocked ? "로그인 5회 실패로 재시도가 제한되었습니다." : `로그인에 실패했습니다. ${remaining}회 남았습니다.`}
          </Alert>
        )}

        {role === "user" && resetRequested && (
          <Alert status="info" borderRadius="md" fontSize="sm" alignItems="flex-start">
            <AlertIcon mt={1} />
            <Box flex="1">
              <Text>초기화 요청이 접수되었습니다. 관리자 처리 후 생년월일 6자리로 로그인해 주세요.</Text>
              <Button mt={3} size="sm" colorScheme="blue" variant="outline" onClick={() => { onRetryAfterApproval?.(values.id); setResetRequestedFor(""); }}>
                관리자 승인 완료 후 다시 시도
              </Button>
            </Box>
          </Alert>
        )}

        {loginError && failureCount === 0 && (
          <Alert status="error" borderRadius="md" fontSize="sm"><AlertIcon />{loginError}</Alert>
        )}

        {role === "user" && (
          <Link color="blue.600" fontSize="sm" fontWeight="semibold" onClick={() => { onClearLoginError?.(); resetDisclosure.onOpen(); }} textAlign="right">
            비밀번호를 잊으셨나요?
          </Link>
        )}
      </Flex>

      {/* ================= 하단 버튼 영역 ================= */}
      <Box pt={4}>
        <Button
          w="100%"
          size="lg"
          h="56px"
          colorScheme="blue"
          fontSize="lg"
          fontWeight="bold"
          type="submit"
          boxShadow="lg"
          isLoading={isLoading}
          isDisabled={isLoginLocked}
          loadingText="로그인 중..."
          _hover={{ transform: "translateY(-1px)", boxShadow: "xl" }}
          _active={{ transform: "translateY(0)" }}
        >
          로그인
        </Button>
      </Box>
      <PasswordResetModal
        isOpen={resetDisclosure.isOpen}
        onClose={resetDisclosure.onClose}
        initialUserId={values.id}
        onSubmitted={(requestedUserId) => {
          setResetRequestedFor(requestedUserId.trim().toLowerCase());
          onClearLoginError?.();
          onRetryAfterApproval?.(requestedUserId);
        }}
      />
    </Flex>
  );
};

export default LoginForm;
