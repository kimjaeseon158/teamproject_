import {
  FormControl,
  FormLabel,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function PasswordField({
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
