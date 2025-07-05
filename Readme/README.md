# 📄 프로젝트 소개

반복적인 출석 체크와 일급 계산 과정을 간소화하기 위해, 직원 출석 현황을 기록하고 자동으로 일급을 계산해주는 프로그램을 개발하였습니다. 이 시스템을 통해 인사 담당자는 보다 빠르고 정확하게 데이터를 관리할 수 있을 뿐더러 직업들 또한 자신의 일급에 대해 자세히 볼수 있습니다.

 💡 **프로젝트 특징**  
> - 직원 출석과 일급을 쉽고 빠르게 관리  
> - 직관적인 UI로 인사 담당자와 직원 모두에게 편리함 제공

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

TRAMPROJECT_
│
├── Back/
│     ├── myproject/
│          ├── myapp/
│                └── apps.py                     # Django 앱 설정 등록 
│                └── auth_utils.py               # 용자 및 관리자 로그인 인증 함수 구현
│                └── models.py                   # user(사용자), admin(관리자), 근무정보, 급여 데이터 모델 정의
│                └── serializers.py              # 모델 데이터를 JSON으로 직렬화/역직렬화 처리
│                └── urls.py                     # API 엔드포인트 라우팅 (현재 `/items/` 단일 경로)
│                └── views.py                    # API 요청 분기 처리, `data_type`에 따라 기능 실행
│     ├── dbsqlite3                              # Django 내장 데이터베이스, 데이터베이스 스키마와 데이터를 파일 기반 저장
│     ├── manage.py                              # Django 프로젝트 관리 커맨드 실행
│
├── Front/
│     ├── src/
│          ├── calenderTest/
│              ├── calenderFront/
│                └── calender.js                 # 달력 및 날짜선택
│                └── calenderinfo.js             # 작업 입력 컴포넌트
│
│          ├── js/
│                └── submitWorkInfo.js           # 서버 전송 함수
│                └── timeUtils.js                # 시간 계산 함수
│                └── locationsList.js            # 장소 리스트
│                └── workTimeList.js             # 시간 리스트
│ 
│     ├── adminpage/
│          ├── adminpag-Font/
│                └── adminPage.js                # 메인 관리자 페이지
│                └── adminInformation.js         # 정보 수정 
│                └── addPersonModal.js           # 직원 추가 
│                └── adminAddBtn.js              # 추가 버튼
│                └── addPanel.js                 # 회사·일급 입력
│                └── adminResizableTable.js      # 너비·높이 조절
│
│          ├── js/
│                └── adminPageLogic.js           # 필터/정렬 API 호출 로직
│                └── admnsdbPost.js              # POST 요청
│                └── adminPageUpdate.js          # 직원 정보 업데이트
│                └── adminPageDelete.js          # 직원 삭제 요청
│                └── useAdminpanelLogic.js       # 일급 관리
│                └── useAdminInformationLogic.js # 직원 정보 수정
│                └── useAddPersonLogic.js        # 신규 직원 등록
│
│     ├──  login/
│          ├── login-Font/
│                └── login.js                    # 로그인 컴포넌트
│
│          ├── js/
│                └── logindata.js                # 로그인 API 호출
│                └── userContext.js              # 로그인 사용자 정보 관리
│                └── validation.js               # 로그인 유효성 검사

##  🔍코드 리뷰 보기

- [로그인 컴포넌트 리뷰](./Code_Review/login.md)
- [캘린더 컴포넌트 리뷰](./Code_Review/calender.md)
- [어드민페이지 컴포넌트 리뷰](./Code_Review/adminPage.md)
- [백엔드 API 연동 및 데이터 처리 리뷰](./Code_Review/DB연동.md)

