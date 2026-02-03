import { Flex, Button, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const RoleTabs = ({ role, setRole }) => {
  const isAdmin = role === "admin";

  return (
    <Flex
      position="relative"
      bg="gray.100"
      h="48px"
      p="4px"
      mb={2}
      borderTopRadius="xl"     // 🔥 지붕 느낌
      borderBottomRadius="md"  // 🔥 아래는 살짝만
    >
      {/* 🔥 움직이는 지붕 캡 */}
      <MotionBox
        position="absolute"
        top="4px"
        left="4px"
        w="calc(50% - 4px)"
        h="calc(100% - 8px)"
        bg="blue.600"
        borderTopRadius="lg"   // 🔥 캡 느낌
        borderBottomRadius="md"
        transform={isAdmin ? "translateX(0%)" : "translateX(100%)"}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 24,
        }}
        zIndex={0}
        boxShadow="sm"         // 🔥 살짝 떠 있는 느낌
      />

      {/* 관리자 */}
      <Button
        flex="1"
        h="100%"
        px={0}
        zIndex={1}
        variant="ghost"
        fontSize="sm"
        fontWeight="600"
        color={isAdmin ? "white" : "gray.600"}
        _hover={{ bg: "transparent" }}
        onClick={() => setRole("admin")}
      >
        관리자
      </Button>

      {/* 사원 */}
      <Button
        flex="1"
        h="100%"
        px={0}
        zIndex={1}
        variant="ghost"
        fontSize="sm"
        fontWeight="600"
        color={!isAdmin ? "white" : "gray.600"}
        _hover={{ bg: "transparent" }}
        onClick={() => setRole("user")}
      >
        사원
      </Button>
    </Flex>
  );
};

export default RoleTabs;
