import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  useToast,
  Select,
} from "@chakra-ui/react";

import "react-big-calendar/lib/css/react-big-calendar.css";

import { login } from "../js/googleAuth"; // 구글 로그인 기능 분리한 파일 임포트

const localizer = momentLocalizer(moment);

const API_KEY = "AIzaSyCGRWAVWoRJuCslUhRcoWxMJkyIZ7jUJRw";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];

export default function Overview() {
  const [calendars, setCalendars] = useState([]);
  const [events, setEvents] = useState([]);
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [selectedCalendarId, setSelectedCalendarId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newEvent, setNewEvent] = useState({ title: "", start: "", end: "" });
  const toast = useToast();

  // 1. gapi 스크립트 로드 및 초기화
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      window.gapi.load("client", async () => {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        });
        setGapiLoaded(true);
      });
    };
    document.body.appendChild(script);
  }, []);

  // 캘린더 목록 불러오기
  useEffect(() => {
    if (!gapiLoaded || !accessToken) return;
    window.gapi.client.setToken({ access_token: accessToken });
    window.gapi.client.calendar.calendarList
      .list()
      .then((response) => {
        const items = response.result.items || [];
        setCalendars(items);
        if (items.length > 0) setSelectedCalendarId(items[0].id);
      })
      .catch((e) => {
        console.error("캘린더 목록 불러오기 실패:", e);
      });
  }, [gapiLoaded, accessToken]);

  // 이벤트 불러오기
  useEffect(() => {
    if (!gapiLoaded || !accessToken || !selectedCalendarId) return;

    window.gapi.client.calendar.events
      .list({
        calendarId: selectedCalendarId,
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 100,
        orderBy: "startTime",
      })
      .then((response) => {
        const fetchedEvents = response.result.items || [];
        const formattedEvents = fetchedEvents.map((e) => ({
          id: e.id,
          title: e.summary || "(제목 없음)",
          start: new Date(e.start.dateTime || e.start.date),
          end: new Date(e.end.dateTime || e.end.date),
        }));
        setEvents(formattedEvents);
      })
      .catch((e) => {
        console.error("이벤트 불러오기 실패:", e);
      });
  }, [gapiLoaded, accessToken, selectedCalendarId]);

  // 이벤트 등록 함수
  const addEvent = () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) {
      toast({
        title: "모든 필드를 입력하세요",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const event = {
      summary: newEvent.title,
      start: { dateTime: new Date(newEvent.start).toISOString() },
      end: { dateTime: new Date(newEvent.end).toISOString() },
    };

    window.gapi.client.calendar.events
      .insert({
        calendarId: selectedCalendarId,
        resource: event,
      })
      .then(() => {
        toast({
          title: "이벤트가 등록되었습니다",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
        setNewEvent({ title: "", start: "", end: "" });
        // 이벤트 다시 불러오기
        return window.gapi.client.calendar.events.list({
          calendarId: selectedCalendarId,
          timeMin: new Date().toISOString(),
          showDeleted: false,
          singleEvents: true,
          maxResults: 100,
          orderBy: "startTime",
        });
      })
      .then((response) => {
        const fetchedEvents = response.result.items || [];
        const formattedEvents = fetchedEvents.map((e) => ({
          id: e.id,
          title: e.summary || "(제목 없음)",
          start: new Date(e.start.dateTime || e.start.date),
          end: new Date(e.end.dateTime || e.end.date),
        }));
        setEvents(formattedEvents);
      })
      .catch((error) => {
        toast({
          title: "이벤트 등록 실패",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <Box
      p={6}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      {/* 상단: 로그인, 캘린더 선택, 캘린더 */}
      <Box
        flex="2" // 상단 영역 좀 더 넓게
        mb={4}
        border="1px solid #ddd"
        borderRadius="8px"
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        {!accessToken && (
          <Button
            colorScheme="blue"
            onClick={() => login(setAccessToken, toast)}
            m={4}
            width="130px"
          >
            구글 로그인하기
          </Button>
        )}

        {calendars.length > 0 && (
          <FormControl m={4} maxW="200px">
            <FormLabel>캘린더 선택</FormLabel>
            <Select
              value={selectedCalendarId || ""}
              onChange={(e) => setSelectedCalendarId(e.target.value)}
            >
              {calendars.map((cal) => (
                <option key={cal.id} value={cal.id}>
                  {cal.summary}
                </option>
              ))}
            </Select>
          </FormControl>
        )}

        {/* 일정 등록 모달 열기 버튼 */}
        <Button
          colorScheme="blue"
          onClick={onOpen}
          m={4}
          disabled={!accessToken}
          width="130px"
        >
          일정 등록하기
        </Button>

        <Box flex="1" p={4} style={{ minHeight: 0 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
          />
        </Box>
      </Box>

      {/* 하단 좌우 분할 영역 */}
      <Box
        flex="1" // 하단 영역은 상단의 절반 높이 정도
        display="flex"
        gap={4}
        border="1px solid #ddd"
        borderRadius="8px"
        overflow="hidden"
      >
        {/* 좌측: 총 지출액 */}
        <Box
          flex="1"
          bg="#f9f9f9"
          p={4}
          overflowY="auto"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <h3>총 지출액</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>₩123,456</p>
        </Box>

        {/* 우측: 승인 대기중 */}
        <Box
          flex="2" // 승인 대기중 영역은 좌측보다 넓게 잡기
          bg="#f0f0f0"
          p={4}
          overflowY="auto"
          display="flex"
          flexDirection="column"
        >
          <h3>승인 대기중</h3>
          <ul style={{ marginTop: 10, paddingLeft: 20 }}>
            {/* 승인 대기중 리스트 예시 */}
            <li>요청 1</li>
            <li>요청 2</li>
            <li>요청 3</li>
          </ul>
        </Box>
      </Box>

      {/* 일정 등록 모달 */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>일정 등록</ModalHeader>
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>제목</FormLabel>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>시작 시간</FormLabel>
              <Input
                type="datetime-local"
                value={newEvent.start}
                onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>종료 시간</FormLabel>
              <Input
                type="datetime-local"
                value={newEvent.end}
                onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={addEvent} disabled={!accessToken}>
              등록
            </Button>
            <Button onClick={onClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
