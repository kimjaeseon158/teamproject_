# 📄 프로젝트 소개

- 반복적인 근무 기록과 일급 계산 과정을 간소화하기 위해, 직원 근무 현황을 기록하고 자동으로 일급을 계산해주는 프로그램을 개발하였습니다. 이 시스템을 통해 관리자는 보다 빠르고 정확하게 데이터를 관리할 수 있을 뿐더러 사용자들 또한 자신의 근무 기록 및 일급에 대해 빠르고 정확히 볼수 있습니다.


 💡 **프로젝트 특징**  
 - **user(사용자)** 의 날짜, 장소, 시간 등의 일일 근무 내용을 입력하여 기록하는 프로그램
 - 기록된 근무 내용을 바탕으로 일급 계산 후 저장, 캘린더 아래 한 달동안 일한 일급의 합계를 표시
 - **admin(관리자)** 은 **user(사용자)** 의 정보를 추가, 삭제, 수정 할 수 있으며 **user(사용자)** 의 일급을 각각 다르게 설정 할 수 있습니다 
 - **admin(관리자)** 은 **user(사용자)** 의 근무 내용을 엑셀로 다운 받을 수 있습니다(향후 개발 예정)

## 목차
- [프로젝트 소개](#프로젝트-소개)
- [사용 기술 및 도구](#사용-기술-및-도구)
- [설치 방법](#설치-방법-installation)
- [코드 리뷰 보기](#코드-리뷰-보기)

## 🛠 사용 기술 및 도구

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![DBeaver](https://img.shields.io/badge/DBeaver-4A90E2?style=for-the-badge&logo=dbeaver&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![Notion](https://img.shields.io/badge/Notion-%23000000.svg?style=for-the-badge&logo=notion&logoColor=white)
![npm version](https://img.shields.io/npm/v/package-name.svg)
![License](https://img.shields.io/badge/license-MIT-green)


- **Frontend**: React, HTML, CSS, JavaScript
- **Backend**: Python, Django
- **Database**: SQLite3
- **Version Control**: Git, GitHub
- **DB 모델링 툴**:  DBeaver
- **협업 툴**: Notion


## 🛠️ 설치 방법 (Installation)

이 프로젝트는 **React (프론트엔드)**와 **Django (백엔드)**를 사용하여 개발되었으며, **SQLite3**를 데이터베이스로 사용합니다.

👉 [설치 가이드 보기](./Code_Review/Installation.md)

## 📁PROJECT 폴더 구조

```
TRAMPROJECT_
│
├── Back/
│     ├── myproject/
│          ├── myapp/
│                └── apps.py                     # Django 앱 설정 등록 
│                └── auth_utils.py               # 용자 및 관리자 로그인 인증 함수 구현
│                └── models.py                   # user(사용자), admin(관리자), 근무정보, 급여, 수입지출 데이터 모델 정의
│                └── serializers.py              # 모델 데이터를 JSON으로 직렬화/역직렬화 처리
│                └── jwt_utils.py                # 쿠키에서 토큰 추출 후 검증, Access Token 문자열로 부터 토큰 검증, 고유 식별자 employee_number, admin_id 등 원하는 값으로 지정
│                └── urls.py                     # 각 기능 마다 API 분리, admin page 등 page 분류하여 API 관리 
│                                                  (/api/check_admin_login/ 등 각각의 경로 지정)
│                └── views.py                    # API 요청 분기 처리, 각 class 따라 기능 실행, 각각의 class 마다 JWT 검증 로직 구성
│     ├── dbsqlite3                              # Django 내장 데이터베이스, 데이터베이스 스키마와 데이터를 파일 기반 저장
│     ├── manage.py                              # Django 프로젝트 관리 커맨드 실행
│
├── Front/
│     ├── src/
│          ├── calenderTest/
│              ├── calenderFront/
│                └── calender.js                 # 캘린더 날짜 강조 및 옵션 표시
│                └── calenderinfo.js             # 작업 기록 입력
│
│          ├── js/
│                └── submitWorkInfo.js           # 근정 정보 전송
│                └── timeUtils.js                # 작업 시간 계산
│                └── locationsList.js            # 근무지 
│                └── workTimeList.js             # 작업 시간
│ 
│     ├── adminpage/
│          ├── adminpag-Font/
│                └── adminPage.js                # 사원 관리 페이지 (추가·수정·삭제·검색/정렬)
│                └── adminInformation.js         # 사원 정보 수정 
│                └── addPersonModal.js           # 사원 정보 입력 
│                └── adminAddBtn.js              # 직원 추가·삭제·검색 버튼
│                └── addPanel.js                 # 회사명·일급 입력 
│                └── adminResizableTable.js      # 테이블 행·열 크기 조절(Dashborad 사용으로 삭제 예정)
│                └── admnsButon.js               # 회사별 일급 수정
│
│          ├── js/
│                └── adminPageAddPerson.js       # 신규 사용자 서버 전송 
│                └── adminPageDelete.js          # 선택 사원 삭제 서버 함수
│                └── adminPageLogic.js           # 사원 필터링/정렬 서버 조회 함수
│                └── adminPageUpdate.js          # 사원 정보 업데이트 서버 함수
│                └── admnsdbPost.js              # 사원 목록 조회 서버 함수
│                └── useAddPersonLogic.js        # 사원 추가
│                └── useAdminInformationLogic.js # 사원 정보 모달 로직
│                └── useAdminpanelLogic.js       # 일급 관리 패널 로직
│                └── utils.js                    # 사원 주민등록번호·전화번호 포맷
│
│     ├── dashboard/
│                └── dashboard.js                # Dashboard 레이아웃
│          ├── components/
│                └── FinalCahart.js              # 월별 수입·지출 차트 표시
│                └── Header.js                   # 관리자 문구와 로그아웃 버튼 표시
│                └── sideBar.js                  # 사이드바 메뉴와 Total Sales 하위 메뉴 표시 및 활성 
│          ├── adminpag-Font/
│                └── employeeData.js             # 직원 근무·상태·시간·위치 등 데이터 배열
│                └── googleAuth.js               # 구글 OAuth 토큰 연동
│          ├── adminpag-Font/
│                └── ApprovalPage.js             # 사원 목록과 승인/거절 관리
│                └── DailyPayPage.js             # 일급 관리 페이지 표시
│                └── EmployeeList.js             # AdminPage 렌더링
│                └── overview.js                 # Google Calendar 연동과 총 지출/승인 대기 사원 표시
│                └── TotalSalesPage.js           # 업체별 매출, 지출 및 순이익 그래프
│
│     ├──  login/
│          ├── login-Font/
│                └── login.js                    # 로그인 컴포넌트
│
│          ├── js/
│                └── validation.js               # 로그인 API 호출
│                └── userContext.js              # 로그인 사용자 정보 관리
│                └── user_login_info.js          # 사원 로그인 시도 후 성공 시 사원 정보, 실패 시 오류 반환
│                └── admin_login_info.js         # 로그인 시도 후 결과와 사용자 데이터 반환
```

##  🔍코드 리뷰 보기

- [로그인 컴포넌트 리뷰](./Code_Review/login.md)
- [캘린더 컴포넌트 리뷰](./Code_Review/calender.md)
- [어드민페이지 컴포넌트 리뷰](./Code_Review/adminPage.md)
- [백엔드 API 연동 및 데이터 처리 리뷰](./Code_Review/DB연동.md)

