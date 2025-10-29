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
} from "@chakra-ui/react";

import "react-big-calendar/lib/css/react-big-calendar.css";
import { login } from "../js/googleAuth"; // 백엔드로 리디렉트하는 함수(같은 창 리다이렉트)
import FinanceChart from "../components/FinalCahart";
import { employees } from "../js/employeeData";

const localizer = momentLocalizer(moment);

export default function Overview() {
  const { user, setUser } = useUser();
  const [events, setEvents] = useState([]);
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

  // ✅ 구글 성공 복귀 시: 서버에서 이벤트 받아오고, user 세팅 후 URL 파라미터 정리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cameFromGoogle = params.get("google_auth") === "success";
    if (!cameFromGoogle) return;

    (async () => {
      try {
        const res = await fetch("/api/google_calendar_auth/events/", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("이벤트 API 실패");
        const data = await res.json();

        // 프로필 정보가 응답에 있다면 사용자 세팅
        setUser({ name: data?.profile?.email ?? "googleUser", role: "user" });

        // 서버 이벤트를 캘린더 형식으로 변환
        const asEvents = (data?.events ?? []).map((e) => ({
          id: e.id,
          title: e.summary || "(제목 없음)",
          start: new Date(e.start?.dateTime || e.start?.date),
          end: new Date(e.end?.dateTime || e.end?.date),
          description: e.description || "",
          location: e.location || "",
        }));
        setEvents(asEvents);

        toast({
          title: "✅ Google 캘린더 연동 완료!",
          status: "success",
          duration: 2500,
          isClosable: true,
        });
      } catch (err) {
        console.error("구글 연동 후 이벤트 로드 실패:", err);
        toast({
          title: "세션 확인 또는 이벤트 로드 실패",
          status: "error",
          duration: 2500,
          isClosable: true,
        });
        setUser(null);
      } finally {
        // URL 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    })();
  }, [setUser, toast]);

  // ✅ 초기 진입/새로고침 시에도 서버에서 이벤트 로드(로그인되어 있으면 성공)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/google_calendar_auth/events/", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) return; // 미로그인 등
        const data = await res.json();
        const asEvents = (data?.events ?? []).map((e) => ({
          id: e.id,
          title: e.summary || "(제목 없음)",
          start: new Date(e.start?.dateTime || e.start?.date),
          end: new Date(e.end?.dateTime || e.end?.date),
          description: e.description || "",
          location: e.location || "",
        }));
        setEvents(asEvents);
        // (선택) user도 동기화하려면 아래처럼 세팅 가능
        // setUser(prev => prev ?? { name: data?.profile?.email ?? "googleUser", role: "user" });
      } catch (e) {
        console.error("이벤트 불러오기 실패:", e);
      }
    };
    load();
  }, [setUser]);

  const formatDateForInput = (date) => {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  // 🔹 Overview에 표시할 대기중 사원
  const pendingEmployees = employees.filter((emp) => emp.status === "대기중");

  return (
    <Box p={6} display="flex" flexDirection="column" height="100vh">
      {/* 상단 캘린더 영역 */}
      <Box mb={4} border="1px solid #ddd" borderRadius="8px" p={4}>
        <Flex justify="space-between" align="center" mb={4} gap={4}>
          {/* 로그인 버튼: user 없으면 노출 */}
          {!user && (
            <Button colorScheme="blue" onClick={() => login()}>
              구글 로그인하기
            </Button>
          )}

          <Button
            colorScheme="blue"
            onClick={() => {
              setModalEvent({
                id: "",
                title: "",
                description: "",
                location: "",
                start: "",
                end: "",
              });
              setIsEditing(false);
              onOpen();
            }}
            disabled={!user} // 로그인 사용자만 등록 가능(필요 시 정책 변경)
          >
            일정 등록하기
          </Button>
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
            {pendingEmployees.map((emp) => (
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
