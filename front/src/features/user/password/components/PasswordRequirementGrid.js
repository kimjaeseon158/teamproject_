import { Box, Text } from "@chakra-ui/react";

import PasswordCheck from "./PasswordCheck";

export default function PasswordRequirementGrid({ checks }) {
  return (
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
  );
}
