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
} from "@chakra-ui/react";
import { FiUser, FiLock, FiShield } from "react-icons/fi";

const LoginForm = ({ role, values, errors, onChange, onSubmit, isLoading, rememberId, onRememberIdChange }) => {
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
          loadingText="로그인 중..."
          _hover={{ transform: "translateY(-1px)", boxShadow: "xl" }}
          _active={{ transform: "translateY(0)" }}
        >
          로그인
        </Button>
      </Box>
    </Flex>
  );
};

export default LoginForm;
