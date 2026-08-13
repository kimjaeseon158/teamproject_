import { Text } from "@chakra-ui/react";

const LoginError = ({ message }) => {
  if (!message) return null;
  return (
    <Text color="red.500" fontSize="sm" mt={3}>
      {message}
    </Text>
  );
};

export default LoginError;
