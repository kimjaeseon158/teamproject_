import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import {
  Box,
  Button,
  Flex,
  Modal,
  Select,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import "react-big-calendar/lib/css/react-big-calendar.css";
import { login } from "../js/googleAuth";

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

  // 날짜 포맷 변환 함수 (Date → yyyy-MM-ddTHH:mm)
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // gapi 로드
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

  // 캘린더 목록
  useEffect(() => {
    if (!gapiLoaded || !accessToken) return;
    window.gapi.client.setToken({ access_token: accessToken });
    window.gapi.client.calendar.calendarList
      .list()
      .then((res) => {
        const items = res.result.items || [];
        setCalendars(items);
        if (items.length > 0) setSelectedCalendarId(items[0].id);
      })
      .catch((e) => console.error("캘린더 목록 실패:", e));
  }, [gapiLoaded, accessToken]);

  // 이벤트 불러오기
  const fetchEvents = () => {
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
      .then((res) => {
        const fetchedEvents = res.result.items || [];
        const formattedEvents = fetchedEvents.map((e) => ({
          id: e.id,
          title: e.summary || "(제목 없음)",
          start: new Date(e.start.dateTime || e.start.date),
          end: new Date(e.end.dateTime || e.end.date),
          description: e.description || "",
          location: e.location || "",
        }));
        setEvents(formattedEvents);
      })
      .catch((e) => console.error("이벤트 불러오기 실패:", e));
  };

  useEffect(() => {
    fetchEvents();
  }, [gapiLoaded, accessToken, selectedCalendarId]);

  // 이벤트 등록
  const addEvent = () => {
    if (!modalEvent.title || !modalEvent.start || !modalEvent.end) {
      toast({
        title: "모든 필드를 입력하세요",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const resource = {
      summary: modalEvent.title,
      description: modalEvent.description,
      location: modalEvent.location,
      start: { dateTime: new Date(modalEvent.start).toISOString() },
      end: { dateTime: new Date(modalEvent.end).toISOString() },
    };

    window.gapi.client.calendar.events
      .insert({
        calendarId: selectedCalendarId,
        resource,
      })
      .then(() => {
        toast({ title: "등록 완료", status: "success", duration: 2000, isClosable: true });
        onClose();
        setModalEvent({ id: "", title: "", description: "", location: "", start: "", end: "" });
        fetchEvents();
      })
      .catch((e) => toast({ title: "등록 실패", description: e.message, status: "error" }));
  };

  // 이벤트 수정
  const editEvent = () => {
    const resource = {
      summary: modalEvent.title,
      description: modalEvent.description,
      location: modalEvent.location,
      start: { dateTime: new Date(modalEvent.start).toISOString() },
      end: { dateTime: new Date(modalEvent.end).toISOString() },
    };
    window.gapi.client.calendar.events
      .update({
        calendarId: selectedCalendarId,
        eventId: modalEvent.id,
        resource,
      })
      .then(() => {
        toast({ title: "수정 완료", status: "success", duration: 2000, isClosable: true });
        onClose();
        setModalEvent({ id: "", title: "", description: "", location: "", start: "", end: "" });
        fetchEvents();
      })
      .catch((e) => toast({ title: "수정 실패", description: e.message, status: "error" }));
  };

  // 이벤트 삭제
  const deleteEvent = () => {
    window.gapi.client.calendar.events
      .delete({ calendarId: selectedCalendarId, eventId: modalEvent.id })
      .then(() => {
        toast({ title: "삭제 완료", status: "success", duration: 2000, isClosable: true });
        onClose();
        setModalEvent({ id: "", title: "", description: "", location: "", start: "", end: "" });
        fetchEvents();
      })
      .catch((e) => toast({ title: "삭제 실패", description: e.message, status: "error" }));
  };

  // 이벤트 클릭
  const handleEventClick = (event) => {
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
  };

  // 새 이벤트 클릭
  const handleNewEvent = () => {
    setModalEvent({ id: "", title: "", description: "", location: "", start: "", end: "" });
    setIsEditing(false);
    onOpen();
  };

  return (
    <Box p={6} style={{ display: "flex", flexDirection: "column", height: "100vh", boxSizing: "border-box" }}>
      {/* 상단 */}
      <Box mb={4} border="1px solid #ddd" borderRadius="8px" p={4}>
        <Flex justify="space-between" align="center" mb={4}>
          {!accessToken && (
            <Button colorScheme="blue" onClick={() => login(setAccessToken, toast)}>
              구글 로그인하기
            </Button>
          )}
          {calendars.length > 0 && (
            <FormControl maxW="250px">
              <FormLabel>캘린더 선택</FormLabel>
              <Select
                value={selectedCalendarId || ""}
                onChange={(e) => setSelectedCalendarId(e.target.value)}
              >
                {calendars.map((cal) => (
                  <option key={cal.id} value={cal.id}>{cal.summary}</option>
                ))}
              </Select>
            </FormControl>
          )}
          <Button colorScheme="blue" onClick={handleNewEvent} disabled={!accessToken}>
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
              onSelectEvent={handleEventClick}
            />
          </Box>

          {/* 일정 목록 */}
          <Box flex="1" borderLeft="1px solid #ddd" pl={4} style={{ maxHeight: 400, overflowY: "auto" }}>
            <h3>일정 목록</h3>
            {events.length > 0 ? (
              <ul style={{ marginTop: 10, paddingLeft: 20 }}>
                {events.map((e, i) => (
                  <li key={i} style={{ marginBottom: "10px" }}>
                    <strong>{e.title}</strong><br/>
                    <small>{e.start.toLocaleString()} ~ {e.end.toLocaleString()}</small>
                  </li>
                ))}
              </ul>
            ) : <p>등록된 일정이 없습니다.</p>}
          </Box>
        </Flex>
      </Box>

      {/* 하단 */}
      <Flex flex="1" gap={4} border="1px solid #ddd" borderRadius="8px" overflow="hidden">
        <Box flex="2" bg="#f9f9f9" p={4} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
          <h3>총 지출액</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>₩123,456</p>
        </Box>
        <Box flex="1" bg="#f0f0f0" p={4} overflowY="auto" display="flex" flexDirection="column">
          <h3>승인 대기중</h3>
          <ul style={{ marginTop: 10, paddingLeft: 20 }}>
            <li>요청 1</li>
            <li>요청 2</li>
            <li>요청 3</li>
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
              <Input value={modalEvent.title} onChange={(e) => setModalEvent({ ...modalEvent, title: e.target.value })} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>시작</FormLabel>
              <Input type="datetime-local" value={modalEvent.start} onChange={(e) => setModalEvent({ ...modalEvent, start: e.target.value })} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>종료</FormLabel>
              <Input type="datetime-local" value={modalEvent.end} onChange={(e) => setModalEvent({ ...modalEvent, end: e.target.value })} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>세부 내용</FormLabel>
              <Input value={modalEvent.description} onChange={(e) => setModalEvent({ ...modalEvent, description: e.target.value })} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>장소</FormLabel>
              <Input value={modalEvent.location} onChange={(e) => setModalEvent({ ...modalEvent, location: e.target.value })} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            {isEditing ? (
              <>
                <Button colorScheme="blue" mr={3} onClick={editEvent}>수정</Button>
                <Button colorScheme="red" mr={3} onClick={deleteEvent}>삭제</Button>
              </>
            ) : (
              <Button colorScheme="blue" mr={3} onClick={addEvent}>등록</Button>
            )}
            <Button onClick={onClose}>취소</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
