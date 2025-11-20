// src/dashboard/pages/overview.js
import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../login/js/userContext";
import {
  Box,
  Button,
  Flex,
  Modal,
  Heading,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Tag,
  useDisclosure,
  useToast,
  Text,
} from "@chakra-ui/react";

import "react-big-calendar/lib/css/react-big-calendar.css";
import { login } from "../js/googleAuth";           // ✅ 백엔드로 리디렉트(같은 창)
import FinanceChart from "../components/FinalCahart";
import { employees } from "../js/employeeData";
import useGoogleLinkStatus from "../js/useGoogleLinkStatus";

const localizer = momentLocalizer(moment);

export default function Overview() {
  const { refetchMe, user } = useUser();            // ✅ 복귀 후 세션 동기화에 사용
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalEvent, setModalEvent] = useState({
    id: "",
    title: "",
    description: "",
    location: "",
    start: "",
    end: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // ✅ 구글 연동 여부만 판단 (버튼 표시 결정)
  const google = useGoogleLinkStatus();
  const events = google.events || [];  // 🔥 여기서 훅의 events 사용

  const formatDateForInput = (date) => {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const pendingEmployees = employees.filter((emp) => emp.status === "대기중");

  return (
    <Box p={6} display="flex" flexDirection="column" height="100vh">
      {/* 상단 캘린더 영역 */}
      <Box mb={4} border="1px solid #ddd" borderRadius="8px" p={4}>
        <Flex justify="space-between" align="center" mb={3} gap={4}>
          {/* ✅ 연동되지 않은 경우에만 버튼 노출 */}
          {!google.loading && !google.linked && (
            <Box>
              <Button
                colorScheme="blue"
                onClick={() => {
                  // 🔥 OAuth 진행 플래그 ON → 왕복 중 RequireAuth가 튕기지 않도록
                  sessionStorage.setItem("oauthInFlight", "1");
                  login(); // 백엔드로 리디렉트(같은 창)
                }}
              >
                구글 로그인하기
              </Button>

              {/* 선택: 이유별 안내 */}
              {google.reason === "network" && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  네트워크/쿠키/팝업 설정으로 연동 상태를 확인할 수 없습니다. 버튼을 눌러 다시 시도하세요.
                </Text>
              )}
              {google.reason === "unauthenticated" && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  로그인되지 않았거나 구글 연동되지 않았습니다. 로그인 후 다시 시도하세요.
                </Text>
              )}
              {google.reason === "server" && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  서버 응답이 불안정합니다. 잠시 후 다시 시도하세요.
                </Text>
              )}
            </Box>
          )}
        </Flex>

        <Flex>
          {/* 캘린더 */}
          <Box flex="3" pr={4}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 400 }}
              selectable
              views={["month", "week", "day"]}
              defaultView="month"
              onSelectEvent={(event) => {
                setModalEvent({
                  id: event.id,
                  title: event.title,
                  description: event.description,
                  location: event.location,
                  start: formatDateForInput(event.start),
                  end: formatDateForInput(event.end),
                });
                setIsEditing(true);
                onOpen();
              }}
            />
          </Box>

          {/* 일정 목록 */}
          <Box
            flex="1"
            borderLeft="1px solid #ddd"
            pl={4}
            maxHeight={400}
            overflowY="auto"
          >
            <h3>일정 목록</h3>
            {events.length > 0 ? (
              <ul style={{ marginTop: 10, paddingLeft: 20 }}>
                {events.map((e, i) => (
                  <li key={i} style={{ marginBottom: "10px" }}>
                    <strong>{e.title}</strong>
                    <br />
                    <small>
                      {e.start.toLocaleString()} ~ {e.end.toLocaleString()}
                    </small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>등록된 일정이 없습니다.</p>
            )}
          </Box>
        </Flex>
      </Box>

      {/* 하단 영역 */}
      <Flex
        flex="1"
        gap={4}
        border="1px solid #ddd"
        borderRadius="8px"
        overflow="hidden"
      >
        <Box
          flex="2"
          bg="#f9f9f9"
          p={4}
          display="flex"
          flexDirection="column"
          alignItems="center"
          position="relative"
        >
          <h3>총 지출액</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>₩123,456</p>
          <FinanceChart />
          <Button
            size="sm"
            position="absolute"
            top="10px"
            right="10px"
            onClick={() => navigate("/dashboard/total-sales")}
          >
            상세보기
          </Button>
        </Box>

        {/* 승인 대기중 사원 표시 */}
        <Box
          flex="1"
          bg="#f0f0f0"
          p={4}
          overflowY="auto"
          display="flex"
          flexDirection="column"
          position="relative"
        >
          <h3>승인 대기중</h3>
          <Button
            size="sm"
            position="absolute"
            top="10px"
            right="10px"
            onClick={() => navigate("/dashboard/approval")}
          >
            상세보기
          </Button>
          <ul style={{ marginTop: 10, paddingLeft: 10 }}>
            {employees
              .filter((emp) => emp.status === "대기중")
              .map((emp) => (
                <li key={emp.id} style={{ marginBottom: "12px" }}>
                  <strong>{emp.name}</strong>
                  <br />
                  <span>
                    사번: {emp.employeeNumber} / 신청일: {emp.date}
                  </span>
                  <br />
                  <Tag size="sm" colorScheme="yellow">
                    {emp.status}
                  </Tag>
                </li>
              ))}
          </ul>
        </Box>
      </Flex>

      {/* 모달 */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? "일정 수정/삭제" : "일정 등록"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>제목</FormLabel>
              <Input
                value={modalEvent.title}
                onChange={(e) =>
                  setModalEvent({ ...modalEvent, title: e.target.value })
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>시작</FormLabel>
              <Input
                type="datetime-local"
                value={modalEvent.start}
                onChange={(e) =>
                  setModalEvent({ ...modalEvent, start: e.target.value })
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>종료</FormLabel>
              <Input
                type="datetime-local"
                value={modalEvent.end}
                onChange={(e) =>
                  setModalEvent({ ...modalEvent, end: e.target.value })
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>세부 내용</FormLabel>
              <Input
                value={modalEvent.description}
                onChange={(e) =>
                  setModalEvent({ ...modalEvent, description: e.target.value })
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>장소</FormLabel>
              <Input
                value={modalEvent.location}
                onChange={(e) =>
                  setModalEvent({ ...modalEvent, location: e.target.value })
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            {isEditing ? (
              <>
                <Button colorScheme="blue" mr={3}>
                  수정
                </Button>
                <Button colorScheme="red" mr={3}>
                  삭제
                </Button>
              </>
            ) : (
              <Button colorScheme="blue" mr={3}>
                등록
              </Button>
            )}
            <Button onClick={onClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
