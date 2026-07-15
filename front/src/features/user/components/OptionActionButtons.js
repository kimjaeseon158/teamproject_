import { Button, VStack } from "@chakra-ui/react";

export default function OptionActionButtons({
  cartCount,
  onAddToCart,
  onSubmitAll,
}) {
  return (
    <VStack spacing={3} pt={2}>
      <Button
        w="100%"
        h="56px"
        colorScheme="blue"
        borderRadius="18px"
        fontSize="lg"
        fontWeight="800"
        onClick={onAddToCart}
        boxShadow="0 8px 20px -8px rgba(49, 130, 206, 0.5)"
      >
        임시 저장소에 추가
      </Button>

      {cartCount > 0 && (
        <Button
          w="100%"
          h="56px"
          colorScheme="green"
          variant="outline"
          borderWidth="2px"
          borderRadius="18px"
          onClick={onSubmitAll}
        >
          기록 모두 등록 ({cartCount}건)
        </Button>
      )}
    </VStack>
  );
}
