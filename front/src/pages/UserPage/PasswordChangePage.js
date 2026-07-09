import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useToast,
} from "@chakra-ui/react";
import { FiAlertCircle, FiCheck, FiEye, FiEyeOff, FiShield } from "react-icons/fi";
import { useUser } from "../../features/auth/userContext";
import { changeUserPassword } from "../../features/user/api/changePassword";
import CalendarPage from "./CalendarPage";

const initialVisibility = {
  initialPassword: false,
  newPassword: false,
  confirmPassword: false,
};

const hasKorean = (value) => /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(value);

export default function PasswordChangePage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { logout, userUuid } = useUser();
  const [values, setValues] = useState({
    initialPassword: "1234",
    newPassword: "",
    confirmPassword: "",
  });
  const [visible, setVisible] = useState(initialVisibility);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const hasKoreanInput =
    hasKorean(values.initialPassword) ||
    hasKorean(values.newPassword) ||
    hasKorean(values.confirmPassword);

  const checks = useMemo(
    () => ({
      isInitialPasswordValid: values.initialPassword === "1234",
      minLength: values.newPassword.length >= 8,
      hasLetter: /[A-Za-z]/.test(values.newPassword),
      hasNumber: /\d/.test(values.newPassword),
      hasSpecial: /[^A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/.test(values.newPassword),
      isConfirmed:
        values.confirmPassword.length > 0 &&
        values.newPassword === values.confirmPassword,
    }),
    [values]
  );

  const canSubmit =
    Object.values(checks).every(Boolean) &&
    !hasKoreanInput &&
    values.newPassword !== "1234";

  const handleChange = (name) => (event) => {
    setSubmitError("");
    setValues((prev) => ({
      ...prev,
      [name]: event.target.value,
    }));
  };

  const handleKeyEvent = (event) => {
    setIsCapsLockOn(event.getModifierState?.("CapsLock") ?? false);
  };

  const toggleVisible = (name) => {
    setVisible((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const result = await changeUserPassword(
        {
          currentPassword: values.initialPassword,
          newPassword: values.newPassword,
          newPasswordConfirm: values.confirmPassword,
        },
        { toast }
      );

      if (!result.success) {
        setSubmitError(result.message);
        toast({
          title: "비밀번호 변경 실패",
          description: result.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        return;
      }

      try {
        await fetch("/api/user-logout/", {
          method: "DELETE",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_uuid: userUuid }),
        });
      } catch (logoutError) {
        console.error("Password change logout failed");
      }

      logout({ skipRefresh: true });

      toast({
        title: "비밀번호 변경 완료",
        description: "새 비밀번호로 다시 로그인해주세요.",
        status: "success",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
      navigate("/", { replace: true });
    } catch (error) {
      const message =
        error?.message || "비밀번호 변경 중 오류가 발생했습니다.";
      setSubmitError(message);
      toast({
        title: "비밀번호 변경 오류",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" position="relative">
      <Box
        filter="blur(2px)"
        pointerEvents="none"
        userSelect="none"
        maxH="100vh"
        overflow="hidden"
      >
        <CalendarPage />
      </Box>

      <Flex
        position="fixed"
        inset={0}
        zIndex={20}
        bg="rgba(15, 23, 42, 0.48)"
        align="center"
        justify="center"
        px={{ base: 4, md: 6 }}
        py={6}
      >
        <Box
          as="form"
          onSubmit={handleSubmit}
          w="100%"
          maxW="520px"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="8px"
          boxShadow="0 24px 70px rgba(15, 23, 42, 0.22)"
          px={{ base: 5, md: 7 }}
          py={{ base: 5, md: 7 }}
        >
          <Flex align="center" gap={3} mb={4}>
            <Flex
              w="42px"
              h="42px"
              align="center"
              justify="center"
              bg="blue.50"
              color="blue.600"
              borderRadius="8px"
              flex="0 0 auto"
            >
              <Icon as={FiShield} boxSize={5} />
            </Flex>
            <Box>
              <Heading as="h1" size="md" color="gray.900">
                비밀번호 변경
              </Heading>
              <Text color="gray.500" fontSize="sm" mt={1}>
                보안 확인이 필요합니다.
              </Text>
            </Box>
          </Flex>

          <Text color="gray.600" fontSize="sm" lineHeight="1.65" mb={5}>
            초기 비밀번호 1234를 확인한 뒤 새 비밀번호로 변경해주세요.
          </Text>

          <Flex direction="column" gap={4}>
            <PasswordField
              label="초기 비밀번호"
              placeholder="초기 비밀번호 입력"
              value={values.initialPassword}
              isVisible={visible.initialPassword}
              onChange={handleChange("initialPassword")}
              onKeyUp={handleKeyEvent}
              onKeyDown={handleKeyEvent}
              onToggle={() => toggleVisible("initialPassword")}
            />
            <PasswordField
              label="새 비밀번호"
              placeholder="새 비밀번호 입력"
              value={values.newPassword}
              isVisible={visible.newPassword}
              onChange={handleChange("newPassword")}
              onKeyUp={handleKeyEvent}
              onKeyDown={handleKeyEvent}
              onToggle={() => toggleVisible("newPassword")}
            />
            <PasswordField
              label="새 비밀번호 확인"
              placeholder="새 비밀번호 다시 입력"
              value={values.confirmPassword}
              isVisible={visible.confirmPassword}
              onChange={handleChange("confirmPassword")}
              onKeyUp={handleKeyEvent}
              onKeyDown={handleKeyEvent}
              onToggle={() => toggleVisible("confirmPassword")}
            />
          </Flex>

          {(isCapsLockOn || hasKoreanInput) && (
            <Flex direction="column" gap={1.5} mt={4}>
              {isCapsLockOn && (
                <InputWarning>Caps Lock이 켜져 있습니다.</InputWarning>
              )}
              {hasKoreanInput && (
                <InputWarning>비밀번호에는 한글을 사용할 수 없습니다.</InputWarning>
              )}
            </Flex>
          )}

          <Box mt={5} p={4} bg="gray.50" borderRadius="8px">
            <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={3}>
              비밀번호 조건
            </Text>
            <Box
              display="grid"
              gridTemplateColumns={{ base: "1fr", sm: "1fr 1fr" }}
              columnGap={4}
              rowGap={2}
            >
              <PasswordCheck isValid={checks.isInitialPasswordValid}>
                초기 비밀번호 확인
              </PasswordCheck>
              <PasswordCheck isValid={checks.minLength}>8자 이상</PasswordCheck>
              <PasswordCheck isValid={checks.hasLetter}>영문 포함</PasswordCheck>
              <PasswordCheck isValid={checks.hasNumber}>숫자 포함</PasswordCheck>
              <PasswordCheck isValid={checks.hasSpecial}>
                특수문자 포함
              </PasswordCheck>
              <PasswordCheck isValid={checks.isConfirmed}>
                비밀번호 일치
              </PasswordCheck>
            </Box>
          </Box>

          {submitError && (
            <Text mt={4} color="red.500" fontSize="sm" fontWeight="semibold">
              {submitError}
            </Text>
          )}

          <Button
            type="submit"
            w="100%"
            h="52px"
            mt={7}
            colorScheme="blue"
            fontSize="md"
            fontWeight="bold"
            isDisabled={!canSubmit}
            isLoading={isSubmitting}
            loadingText="변경 중"
          >
            비밀번호 변경
          </Button>
        </Box>
      </Flex>
    </Box>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  isVisible,
  onChange,
  onKeyUp,
  onKeyDown,
  onToggle,
}) {
  return (
    <FormControl>
      <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700">
        {label}
      </FormLabel>
      <InputGroup size="lg">
        <Input
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          onKeyUp={onKeyUp}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          bg="gray.50"
          borderColor="gray.200"
          _focus={{ bg: "white", borderColor: "blue.500", boxShadow: "none" }}
        />
        <InputRightElement>
          <IconButton
            aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
            icon={<Icon as={isVisible ? FiEyeOff : FiEye} />}
            variant="ghost"
            size="sm"
            onClick={onToggle}
          />
        </InputRightElement>
      </InputGroup>
    </FormControl>
  );
}

function PasswordCheck({ isValid, children }) {
  return (
    <Flex align="center" gap={2} color={isValid ? "green.600" : "gray.400"}>
      <Flex
        align="center"
        justify="center"
        w="18px"
        h="18px"
        borderRadius="full"
        bg={isValid ? "green.100" : "gray.200"}
        flex="0 0 auto"
      >
        <Icon as={FiCheck} boxSize={3} />
      </Flex>
      <Text fontSize="sm">{children}</Text>
    </Flex>
  );
}

function InputWarning({ children }) {
  return (
    <Flex align="center" gap={2} color="orange.600">
      <Icon as={FiAlertCircle} boxSize={4} />
      <Text fontSize="sm" fontWeight="semibold">
        {children}
      </Text>
    </Flex>
  );
}
