# 📆 Calendar 컴포넌트 코드 리뷰

이 컴포넌트는 사원이 자신의 출석일을 확인하고 선택할 수 있는 캘린더 UI를 제공합니다.
직관적인 달력 렌더링과 날짜 선택 기능, 그리고 선택한 날짜에 대한 옵션 컴포넌트와 연결되어 있습니다.

---

##  다른 코드 리뷰 및 소개 보기

- [프로젝트 소개 컴포넌트 리뷰](/README.md)
- [로그인 컴포넌트 리뷰](./Code_Review/login.md)
- [어드민페이지 컴포넌트 리뷰](./Code_Review/adminPage.md)

---

##  주요 기능 요약

| 기능 항목       | 설명                                                       |
|----------------|------------------------------------------------------------|
| 달력 렌더링     | 현재 월을 기준으로 6주(42일)짜리 달력을 표시함            |
| 날짜 선택       | 클릭한 날짜를 상태에 저장하고 옵션 컴포넌트 표시           |
| 사용자 정보 표시 | Context에서 사용자 이름/사원번호 표시                      |
| 월 이동         | 이전 달, 다음 달로 이동 가능 (`date-fns` 활용)            |
| 시각 강조       | 현재 월/타월, 주말 등 날짜별 색상 차등 적용               |

##  상태 요약

| 상태               | 설명                                                             |
|--------------------|------------------------------------------------------------------|
| `date`             | 현재 기준이 되는 날짜 (월 단위로 이동 시 사용됨)                |
| `selectedDate`     | 사용자가 선택한 날짜 정보 (`year`, `month`, `day`, `formatted`) |
| `showOption`       | 날짜 클릭 시 옵션 컴포넌트 표시 여부                             |
| `user`, `employeeNumber` | 전역 로그인 사용자 정보 (`UserContext`에서 가져옴)         |

---

## 날짜 주차 그룹 함수

주 단위로 날짜를 묶어서 달력 테이블 형태로 구성

```js
// 📆 시작일부터 종료일까지 날짜를 주 단위 배열로 분할
const groupDatesByWeek = (startDay, endDay) => {
  const weeks = [], currentWeek = [];
  let currentDate = new Date(startDay);

  while (currentDate <= endDay) {
    currentWeek.push(new Date(currentDate));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek.length = 0;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (currentWeek.length) weeks.push(currentWeek);

  // 🔄 주가 6개 미만이면 추가로 채움
  while (weeks.length < 6) {
    const lastDate = new Date(weeks.at(-1).at(-1));
    const extraWeek = Array.from({ length: 7 }, (_, i) => {
      const newDate = new Date(lastDate);
      newDate.setDate(lastDate.getDate() + i + 1);
      return newDate;
    });
    weeks.push(extraWeek);
  }

  return weeks;
};ks;
};
```
- **지정된 시작일과 종료일 사이의 날짜를 7일씩 끊어서 배열에 저장**  
   → 매 주를 배열로 묶어 `weeks` 배열에 추가합니다.

- **남은 날짜가 7일이 안 될 경우에도 마지막 주로 추가**  
   → 잔여 일수를 버리지 않고 그대로 표시합니다.

- **달력 UI가 항상 6주(42칸)로 고정되도록 부족한 주는 자동 채움**  
   → 달력이 깔끔하게 유지되며, 날짜가 적은 달(예: 2월)도 균일한 레이아웃을 가집니다.

## 날짜 선택 처리

사용자가 날짜를 클릭하면 선택 정보를 상태에 저장하고 옵션 표시

```js
// ✨ 날짜 클릭 시 선택 상태 저장 및 옵션창 열기
const handleOnTarget = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = dateObj.getMonth() + 1;
  const d = dateObj.getDate();
  const pad = (n) => String(n).padStart(2, '0');

  setSelectedDate({
    year: y,
    month: m,
    day: d,
    formatted: `${y}-${pad(m)}-${pad(d)}`
  });

  setShowOption(true); // 옵션 컴포넌트 표시
};
```

- **선택한 날짜의 연,월,일 값을 추출**  
   → `getFullYear()`, `getMonth() + 1`, `getDate()`를 통해 날짜 정보를 숫자 형태로 구함

- **선택한 날짜를 상태에 저장 (formatted 포함)**  
   → `YYYY-MM-DD` 형식의 문자열과 함께 `selectedDate`에 저장됨

- **옵션 창 표시 플래그를 true로 변경**  
   → 클릭된 날짜에 대한 옵션 설정 컴포넌트가 화면에 표시됨

## 날짜 선택 여부 검사

현재 선택된 날짜인지 확인하여 하이라이트 적용

```js
  // ✅ 날짜 선택 여부 검사 함수
  const isSelected = (day) =>
    selectedDate &&
    selectedDate.day === day.getDate() &&
    selectedDate.month === day.getMonth() + 1 &&
    selectedDate.year === day.getFullYear();
```
- **매개변수 `day`와 상태의 `selectedDate`를 비교**  
- 연, 월, 일이 모두 일치하면 `true` 반환  
- 해당 날짜가 선택된 상태인지 판단하는 용도로 사용됨

## 렌더링 구조 (요약)

전체 UI는 `<table>`로 구성되어 요일과 날짜를 출력합니다.

```js
<table>
  <thead>
    <tr>
      <th>일</th><th>월</th>...<th>토</th> {/* 요일 헤더 */}
    </tr>
  </thead>
  <tbody>
    {weeks.map((week, i) => (
      <tr key={i}>
        {week.map((day, j) => (
          <td
            key={j}
            onClick={() => handleOnTarget(day)} // 날짜 클릭 시 선택 상태 변경
            style={{
              backgroundColor: isSelected(day) ? "lightblue" : "transparent", // 선택된 날짜 배경색 변경
              color:
                day.getMonth() !== month ? "lightgray" : // 다른 달 날짜는 연한 색
                day.getDay() === 0 ? "red" :             // 일요일은 빨간색
                day.getDay() === 6 ? "blue" : "black"    // 토요일은 파란색, 평일은 검정색
            }}
          >
            {day.getDate()} {/* 날짜 숫자 표시 */}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
```

- **`weeks` 배열을 순회해 6주(6행)의 테이블을 생성**  
- 각 날짜(`day`)는 클릭 이벤트로 선택 처리(`handleOnTarget`)  
- 선택된 날짜는 배경색 `lightblue`로 강조  
- 현재 달에 포함되지 않은 날짜는 연한 회색으로 표시  
- 일요일은 빨간색, 토요일은 파란색으로 요일 구분  
- 평일은 기본 검정색 글씨 사용

## 이전/다음 달 전환

이전 달과 다음달에 대한 정보를 

월을 앞뒤로 이동하며, 현재 연도와 월을 화면에 보여줍니다.

```js
<button onClick={() => setDate(subMonths(date, 1))}>이전 달</button> {/* 이전 달로 이동 */}
<span>{year}년 {month + 1}월</span> {/* 현재 연도와 월 표시 */}
<button onClick={() => setDate(addMonths(date, 1))}>다음 달</button> {/* 다음 달로 이동 */}
```

- **이전 달 버튼** 클릭 시 `date` 상태를 한 달 감소시켜 이전 달로 이동  
- **현재 연도와 월**를 텍스트로 화면에 표시  
- **다음 달 버튼** 클릭 시 `date` 상태를 한 달 증가시켜 다음 달로 이동

# submitWorkInfo 함수 개요

직원의 출근 및 퇴근 시간과 근무 장소 등 근무 정보를 서버에 전송하는 비동기 함수입니다.

---

## 개선 사항

| 항목              | 설명                                                                 |
|-------------------|----------------------------------------------------------------------|
| 유틸 함수 분리     | `groupDatesByWeek()` 함수는 `utils/calendar.js` 등으로 추출하는 것이 좋습니다 |
| 스타일 클래스 적용 | `color`, `backgroundColor` 등의 조건부 스타일은 CSS 클래스화 가능          |
| 오늘 날짜 강조     | `isToday()` 헬퍼 함수를 만들어 오늘 날짜를 별도 하이라이트하는 기능 추가 추천 |
