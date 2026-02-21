import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  Text,
} from "@chakra-ui/react";

const LoginForm = ({ role, values, errors, onChange, onSubmit }) => {
  return (
    <Flex
      as="form"
      direction="column"
      h="400px"                 // 🔥 전체 기준 높이
      onSubmit={onSubmit}
    >
      {/* ================= 상단 영역 ================= */}
      <Box mb={6}>
        <Text
          fontSize="xl"
          fontWeight="bold"
          color="gray.800"
          textAlign="center"
        >
          {role === "admin" ? "관리자 로그인" : "사원 로그인"}
        </Text>
      </Box>

      {/* ================= 입력 영역 ================= */}
      <Flex direction="column" gap={4}>
        {/* 아이디 */}
        <FormControl isInvalid={!!errors.idError}>
          <FormLabel color="gray.700">아이디</FormLabel>
          <Input
            h="44px"              // 🔥 입력 높이 통일
            bg="white"
            value={values.id}
            onChange={(e) => onChange("id", e.target.value)}
          />
          <FormErrorMessage>{errors.idError}</FormErrorMessage>
        </FormControl>

        {/* 비밀번호 */}
        <FormControl isInvalid={!!errors.passwordError}>
          <FormLabel color="gray.700">비밀번호</FormLabel>
          <Input
            h="44px"
            type="password"
            bg="white"
            value={values.password}
            onChange={(e) => onChange("password", e.target.value)}
          />
          <FormErrorMessage>{errors.passwordError}</FormErrorMessage>
        </FormControl>

        {/* 인증코드 (자리 고정) */}
        <FormControl
          isInvalid={!!errors.admin_codeError}
          visibility={role === "admin" ? "visible" : "hidden"}
        >
          <FormLabel color="gray.700">인증코드</FormLabel>
          <Input
            h="44px"
            type="password"
            inputMode="numeric"
            maxLength={6}
            bg="white"
            value={values.admin_code}
            onChange={(e) => onChange("admin_code", e.target.value)}
            disabled={role !== "admin"}
          />
          <FormErrorMessage>{errors.admin_codeError}</FormErrorMessage>
        </FormControl>
      </Flex>

      {/* ================= 하단 버튼 영역 ================= */}
      <Box mt="auto">
        <Button
          w="100%"
          h="48px"               // 🔥 버튼 높이 고정
          bg="blue.600"
          color="white"
          fontSize="md"
          _hover={{ bg: "blue.700" }}
          type="submit"
        >
          로그인
        </Button>
      </Box>
    </Flex>
  );
};

export default LoginForm;
