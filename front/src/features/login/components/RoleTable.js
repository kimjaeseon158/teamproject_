import { Flex, Box, Text } from "@chakra-ui/react";

const RoleTabs = ({ role, setRole }) => {
  const isAdmin = role === "admin";

  return (
    <Box position="relative" borderBottom="1px solid" borderColor="gray.200">
      <Flex>
        <Flex
          flex="1"
          justify="center"
          py={3}
          cursor="pointer"
          onClick={() => setRole("admin")}
        >
          <Text
            fontWeight={isAdmin ? "bold" : "medium"}
            color={isAdmin ? "blue.600" : "gray.500"}
            transition="all 0.2s"
          >
            관리자
          </Text>
        </Flex>

        <Flex
          flex="1"
          justify="center"
          py={3}
          cursor="pointer"
          onClick={() => setRole("user")}
        >
          <Text
            fontWeight={!isAdmin ? "bold" : "medium"}
            color={!isAdmin ? "blue.600" : "gray.500"}
            transition="all 0.2s"
          >
            사원
          </Text>
        </Flex>
      </Flex>

      {/* 움직이는 밑줄 */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        width="50%"
        height="3px"
        bg="blue.600"
        borderRadius="full"
        transform={isAdmin ? "translateX(0%)" : "translateX(100%)"}
        transition="transform 0.3s ease"
      />
    </Box>
  );
};

export default RoleTabs;
