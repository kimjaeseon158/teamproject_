import React, { useState, useContext } from "react";
import {
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  Flex,
  Text,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { validation } from "../js/validation";
import { HandleLogin } from "../js/logindata";
import UserContext from "../js/userContext";

const MotionBox = motion(Box);

const Login = () => {
  const { setUser, setEmployeeNumber, setUserData } = useContext(UserContext);
  const navigate = useNavigate();
  const toast = useToast();

  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");

  const [userId, setUserId] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const [role, setRole] = useState("user"); // 사원 먼저 보이도록 초기값 "user"
  const [errors, setErrors] = useState({
    idError: "",
    passwordError: "",
    admin_codeError: "",
  });

  const [adminLoginError, setAdminLoginError] = useState("");
  const [userLoginError, setUserLoginError] = useState("");
  const [fadeOut, setFadeOut] = useState(false);

  const validation_Patterns = {
    admin_Id: /^[A-Za-z0-9]{4,16}$/,
    admin_Password: /^[A-Za-z0-9]{4,14}$/,
    admin_Otp: /^\d{6}$/,
    user_Id: /^[A-Za-z0-9]{4,16}$/,
    user_Pw: /^[A-Za-z0-9]{4,14}$/,
  };

  const handlecheck = async (e) => {
    e.preventDefault();

    setAdminLoginError("");
    setUserLoginError("");

    const currentId = role === "admin" ? adminId : userId;
    const setId = role === "admin" ? setAdminId : setUserId;
    const currentPassword = role === "admin" ? adminPassword : userPassword;
    const setPassword = role === "admin" ? setAdminPassword : setUserPassword;

    const isValid = await validation({
      id: currentId,
      setId,
      password: currentPassword,
      setPassword,
      admin_code: adminCode,
      setadmin_code: setAdminCode,
      role,
      validation_Patterns,
      setErrors,
    });

    if (isValid.success) {
      const loginsuccess = await HandleLogin(
        currentId,
        currentPassword,
        isValid.dataType,
        adminCode
      );

      if (loginsuccess.success === "admin") {
        setFadeOut(true);
        setUser("admin");
        setUserData(loginsuccess.user_Data);
        sessionStorage.setItem("userRole", "admin");
        sessionStorage.setItem("userData", JSON.stringify(loginsuccess.user_Data));
        setTimeout(() => navigate("/adminPage"), 500);
      } else if (loginsuccess.success === "user") {
        setFadeOut(true);
        setUser(loginsuccess.name);
        setEmployeeNumber(loginsuccess.employee_number);
        sessionStorage.setItem("userRole", "user");
        sessionStorage.setItem("userName", loginsuccess.name);
        sessionStorage.setItem("employeeNumber", loginsuccess.employee_number);
        setTimeout(() => navigate("/data"), 500);
      } else {
        if (role === "admin") {
          setAdminLoginError("아이디, 비밀번호 또는 인증코드가 틀렸습니다.");
        } else {
          setUserLoginError("아이디 또는 비밀번호가 틀렸습니다.");
        }
      }
    }
  };

  const preventSpace = (e) => {
    if (e.key === " ") e.preventDefault();
  };

  return (
    <form onSubmit={handlecheck}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        minH="100vh"
        bg="gray.50"
        px={4}
        className={fadeOut ? "fade-out" : ""}
      >
        {/* Role Toggle */}
        <Flex
          mb={6}
          bg="gray.200"
          p={1}
          rounded="md"
          w="300px"
          justify="space-between"
          position="relative"
          h="40px"
          alignItems="center"
        >
          <MotionBox
            position="absolute"
            top="0"
            left={role === "admin" ? "0" : "50%"}
            w="50%"
            h="100%"
            bg="blue.500"
            borderRadius="md"
            zIndex={0}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
          <Button
            flex="1"
            zIndex={1}
            color={role === "admin" ? "white" : "black"}
            variant="ghost"
            onClick={() => setRole("admin")}
          >
            관리자
          </Button>
          <Button
            flex="1"
            zIndex={1}
            color={role === "user" ? "white" : "black"}
            variant="ghost"
            onClick={() => setRole("user")}
          >
            사원
          </Button>
        </Flex>

        {/* 로그인 폼 */}
        <VStack
          as={MotionBox}
          spacing={4}
          w="90%"
          maxW="350px"
          p={6}
          bg="white"
          borderRadius="md"
          boxShadow="md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          minH="320px"
          justifyContent="center"
        >
          <Text fontSize="2xl" fontWeight="bold" textAlign="center" w="100%">
            {role === "admin" ? "관리자 로그인" : "사원 로그인"}
          </Text>

          {/* ID */}
          <FormControl isInvalid={errors.idError}>
            <FormLabel>아이디</FormLabel>
            <Input
              value={role === "admin" ? adminId : userId}
              onChange={(e) =>
                role === "admin" ? setAdminId(e.target.value) : setUserId(e.target.value)
              }
              onKeyDown={preventSpace}
            />
            <FormErrorMessage>{errors.idError}</FormErrorMessage>
          </FormControl>

          {/* PW */}
          <FormControl isInvalid={errors.passwordError}>
            <FormLabel>비밀번호</FormLabel>
            <Input
              type="password"
              value={role === "admin" ? adminPassword : userPassword}
              onChange={(e) =>
                role === "admin"
                  ? setAdminPassword(e.target.value)
                  : setUserPassword(e.target.value)
              }
              onKeyDown={preventSpace}
            />
            <FormErrorMessage>{errors.passwordError}</FormErrorMessage>
          </FormControl>

          {/* 관리자일 때만 OTP 입력 */}
          {role === "admin" && (
            <FormControl isInvalid={errors.admin_codeError}>
              <FormLabel>인증코드</FormLabel>
              <Input
                type="password"
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                autoComplete="off"
                value={adminCode}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val)) setAdminCode(val);
                }}
                onKeyDown={preventSpace}
              />
              <FormErrorMessage>{errors.admin_codeError}</FormErrorMessage>
            </FormControl>
          )}

          {/* 로그인 실패 메시지 */}
          {(adminLoginError || userLoginError) && (
            <Text color="red.500" fontSize="sm" textAlign="center" w="100%">
              {adminLoginError || userLoginError}
            </Text>
          )}

          {/* 버튼 */}
          <Button
            colorScheme="blue"
            type="submit"
            w="100%"
            mt={4}
            _hover={{ bg: "blue.600" }}
          >
            로그인
          </Button>
        </VStack>
      </Flex>
    </form>
  );
};

export default Login;
