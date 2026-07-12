import { Box, Button, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { FiShield } from "react-icons/fi";

import InputWarning from "../components/InputWarning";
import PasswordField from "../components/PasswordField";
import PasswordRequirementGrid from "../components/PasswordRequirementGrid";

const PASSWORD_FIELDS = [
  {
    name: "initialPassword",
    label: "초기 비밀번호",
    placeholder: "초기 비밀번호 입력",
  },
  {
    name: "newPassword",
    label: "새 비밀번호",
    placeholder: "새 비밀번호 입력",
  },
  {
    name: "confirmPassword",
    label: "새 비밀번호 확인",
    placeholder: "새 비밀번호 다시 입력",
  },
];

export default function PasswordChangeModal({ form }) {
  return (
    <Flex
      position="fixed"
      inset={0}
      zIndex={20}
      bg="rgba(15, 23, 42, 0.48)"
      align={{ base: "flex-start", md: "center" }}
      justify="center"
      px={{ base: 4, md: 6 }}
      py={6}
      overflowY="auto"
    >
      <Box
        as="form"
        onSubmit={form.handleSubmit}
        w="100%"
        maxW="520px"
        maxH={{ base: "calc(100dvh - 48px)", md: "none" }}
        overflowY={{ base: "auto", md: "visible" }}
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
          {PASSWORD_FIELDS.map((field) => (
            <PasswordField
              key={field.name}
              label={field.label}
              placeholder={field.placeholder}
              value={form.values[field.name]}
              isVisible={form.visible[field.name]}
              onChange={form.handleChange(field.name)}
              onKeyUp={form.handleKeyEvent}
              onKeyDown={form.handleKeyEvent}
              onToggle={() => form.toggleVisible(field.name)}
            />
          ))}
        </Flex>

        {(form.isCapsLockOn || form.hasKoreanInput) && (
          <Flex direction="column" gap={1.5} mt={4}>
            {form.isCapsLockOn && (
              <InputWarning>Caps Lock이 켜져 있습니다.</InputWarning>
            )}
            {form.hasKoreanInput && (
              <InputWarning>비밀번호에는 한글을 사용할 수 없습니다.</InputWarning>
            )}
          </Flex>
        )}

        <PasswordRequirementGrid checks={form.checks} />

        {form.submitError && (
          <Text mt={4} color="red.500" fontSize="sm" fontWeight="semibold">
            {form.submitError}
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
          isDisabled={!form.canSubmit}
          isLoading={form.isSubmitting}
          loadingText="변경 중"
        >
          비밀번호 변경
        </Button>
      </Box>
    </Flex>
  );
}
