# 🔐 MJSEC_CTF PROJECT

이 프로젝트는 MJSEC_CTF(Capture The Flag) 대회를 위한 웹 사이트로, CTFd를 사용하지 않고 직접 개발되었습니다.
이 문서는 프로젝트의 설치 방법, 기여자 정보, 기술 스택, 협업 방식, 개발 기간, 시스템 아키텍처, ERD, 구현된 기능, 그리고 화면 구성을 설명합니다.
## Technology Stack
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-000000?style=flat-square&logo=gunicorn&logoColor=white)
![NGINX](https://img.shields.io/badge/NGINX-009639?style=flat-square&logo=nginx&logoColor=white)
![Docker Hub](https://img.shields.io/badge/Docker_Hub-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## 목차
1. [서버 설치 방법](#서버-설치-방법)
2. [기여자 표](#기여자-표)
3. [협업 방식](#협업-방식)
4. [개발 기간](#개발-기간)
5. [시스템 아키텍처](#시스템-아키텍처)
6. [ERD](#erd)
7. [구현된 기능](#구현된-기능)
8. [화면 구성](#화면-구성)

---

<a id="서버-설치-방법"></a>
## 📌 서버 설치 방법

아래 단계를 따라 서버를 설치하고 실행할 수 있습니다.

### 1. 저장소 복제
프로젝트는 백엔드, 프론트엔드, 디스코드 봇으로 나누어져 있습니다. 각 저장소를 복제합니다.

```bash
# 백엔드 저장소 복제
git clone https://github.com/MJSEC-MJU/MSG_CTF_BACK.git
cd backend

# 프론트엔드 저장소 복제
git clone https://github.com/MJSEC-MJU/MSG_CTF_WEB.git
cd frontend

# 디스코드 봇 저장소 복제
git clone https://github.com/MJSEC-MJU/MSG_DISCORDBOT.git
cd discord-bot
```
---

<a id="기여자-표"></a>
## 🙌 기여자 표

<table style="width:100%;">
  <tr>
    <!-- Backend Team -->
    <td style="vertical-align: top; width:33%;">
      <h3 align="center">Backend Team</h3>
      <table align="center" style="border-collapse: collapse;">
        <tr>
          <th style="border: 1px solid #ddd; padding: 6px;">Profile</th>
          <th style="border: 1px solid #ddd; padding: 6px;">Role</th>
          <th style="border: 1px solid #ddd; padding: 6px;">Expertise</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px;" align="center">
            <a href="https://github.com/jongcoding">
              <img src="https://github.com/jongcoding.png" width="50" height="50" alt="jongcoding"><br>
              <sub>jongcoding</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px;">PM/DevOps</td>
          <td style="border: 1px solid #ddd; padding: 6px;">Admin API, Sys Arch</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px;" align="center">
            <a href="https://github.com/minsoo0506">
              <img src="https://github.com/minsoo0506.png" width="50" height="50" alt="minsoo0506"><br>
              <sub>minsoo0506</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px;">Maintainer</td>
          <td style="border: 1px solid #ddd; padding: 6px;">Maintenance</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px;" align="center">
            <a href="https://github.com/ORI-MORI">
              <img src="https://github.com/ORI-MORI.png" width="50" height="50" alt="ORI-MORI"><br>
              <sub>ORI-MORI</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px;">Backend</td>
          <td style="border: 1px solid #ddd; padding: 6px;">Ranking API</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px;" align="center">
            <a href="https://github.com/tember8003">
              <img src="https://github.com/tember8003.png" width="50" height="50" alt="tember8003"><br>
              <sub>tember8003</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px;">Backend</td>
          <td style="border: 1px solid #ddd; padding: 6px;">User API</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px;" align="center">
            <a href="https://github.com/yunttai">
              <img src="https://github.com/yunttai.png" width="50" height="50" alt="yunttai"><br>
              <sub>yunttai</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px;">Backend</td>
          <td style="border: 1px solid #ddd; padding: 6px;">Signature API</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px;" align="center">
            <a href="https://github.com/alivemarin">
              <img src="https://github.com/alivemarin.png" width="50" height="50" alt="alivemarin"><br>
              <sub>alivemarin</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px;">Backend</td>
          <td style="border: 1px solid #ddd; padding: 6px;">LeaderBoard API</td>
        </tr>
      </table>
    </td>
  <td style="vertical-align: top; width:33%;">
      <h3 align="center">Frontend Team</h3>
      <table align="center" style="border-collapse: collapse;">
        <tr>
          <th style="border: 1px solid #ddd; padding: 6px;">Profile</th>
          <th style="border: 1px solid #ddd; padding: 6px;">Role</th>
          <th style="border: 1px solid #ddd; padding: 6px;">Expertise</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px;" align="center">
            <a href="https://github.com/MEspeaker">
              <img src="https://github.com/MEspeaker.png" width="50" height="50" alt="MEspeaker"><br>
              <sub>MEspeaker</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px;">Frontend</td>
          <td style="border: 1px solid #ddd; padding: 6px;">Design &amp; UI/UX</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px;" align="center">
            <a href="https://github.com/youminki">
              <img src="https://github.com/youminki.png" width="50" height="50" alt="youminki"><br>
              <sub>youminki</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px;">Frontend</td>
          <td style="border: 1px solid #ddd; padding: 6px;">UI/UX</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px;" align="center">
            <a href="https://github.com/jenn2i">
              <img src="https://github.com/jenn2i.png" width="50" height="50" alt="jenn2i"><br>
              <sub>jenn2i</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px;">Frontend</td>
          <td style="border: 1px solid #ddd; padding: 6px;">User API</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px;" align="center">
            <a href="https://github.com/hanwoooo">
              <img src="https://github.com/hanwoooo.png" width="50" height="50" alt="hanwoooo"><br>
              <sub>hanwoooo</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px;">Frontend</td>
          <td style="border: 1px solid #ddd; padding: 6px;">UI/UX &amp; Design</td>
        </tr>
      </table>
    </td>
   <td style="vertical-align: top; width:33%;">
      <h3 align="center">Discord Bot Team</h3>
      <table align="center" style="border-collapse: collapse;">
        <tr>
          <th style="border: 1px solid #ddd; padding: 6px;">Profile</th>
          <th style="border: 1px solid #ddd; padding: 6px;">Bot</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px; text-align: center;" align="center">
            <a href="https://github.com/jongcoding">
              <img src="https://github.com/jongcoding.png" width="50" height="50" alt="jongcoding"><br>
              <sub>jongcoding</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">FIRST_bot</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px; text-align: center;" align="center">
            <a href="https://github.com/jiyoon77">
              <img src="https://github.com/jiyoon77.png" width="50" height="50" alt="jiyoon77"><br>
              <sub>jiyoon77</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">DJ_BOT</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px; text-align: center;" align="center">
            <a href="https://github.com/tember8003">
              <img src="https://github.com/tember8003.png" width="50" height="50" alt="tember8003"><br>
              <sub>tember8003</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">TICKET_bot</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px; text-align: center;" align="center">
            <a href="https://github.com/walnutpy">
              <img src="https://github.com/walnutpy.png" width="50" height="50" alt="walnutpy"><br>
              <sub>walnutpy</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">ROLE_bot</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

---

<a id="협업-방식"></a>
## 🔥 협업 방식

| 플랫폼                                                                                                      | 사용 방식                   |
|----------------------------------------------------------------------------------------------------------|-------------------------|
| <img src="https://img.shields.io/badge/discord-5865F2?style=for-the-badge&logo=discord&logoColor=white"> | 매주 금요일 2시 회의, 라이브 코딩    |
| <img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=Github&logoColor=white">   | PR을 통해 변경사항 및 테스트 과정 확인 |<br/>|
| <img src="https://img.shields.io/badge/notion-000000?style=for-the-badge&logo=notion&logoColor=white">   | 컨벤션, API, 회의 기록 문서화     |

#### 🔗 [Notion 링크](https://plucky-ink-23c.notion.site/MSG_CTF_WEB-Project-1770f19c72be802e9358da5441dec400?pvs=4)

---

<a id="개발-기간"></a>
## 📆 개발 기간
- 2024.12.28 ~ 2025.01.04 : 팀 규칙 및 코딩 컨벤션 의논, 기능 정의</br>
- 2025.01.04 ~ 2025.01.18 : API 명세서 작성, ERD 설계</br>
- 2025.01.18 ~ 2025.01.25 : 프로젝트 환경 세팅, 로그인/회원가입 기능 구현</br>
- 2025.01.25 ~ 2025.02.01 : 문제 생성/수정/삭제 기능 구현</br>
- 2025.02.01 ~ 2025.02.08 : 문제 전체 조회, 문제 상세 조회, 문제 제출 기능 구현</br>
- 2025.02.08 ~ 2025.02.15 : 유저 프로필 조회, 리더보드(랭킹 & 그래프) 기능 구현</br>
- 2025.02.15 ~ 2025.02.22 : 디스코드봇 개발 및 연동</br>
- 2025.02.22 ~ 2025.03.01 : 관리자 기능(사용자/문제 생성, 조회, 수정, 삭제) 구현</br>
- 2025.03.01 ~ 2025.03.08 : 버그 수정</br>
- 2025.03.08 ~ 2025.07.01 : 테스트 및 코드 리펙토링</br>
- 2025.07.01 ~ 2025.07.31 : CTF v2.0 기획</br>
- 2025.08.01 ~ 2025.08.15 : 마일리지 기반 결제 기능 구현</br>
- 2025.08.15 ~ 2025.09.31 : 개인 단위에서 팀 단위로 로직 변경 (대회 정책 변경)</br>
- 2025.10.01 ~ 2025.10.08 : 시그니쳐 문제 조회/생성/삭제 기능 추가</br>
- 2025.10.08 ~ 2025.10.15 : 리더보드 조회 기능 수정 (팀 단위)</br>
- 2025.10.15 ~ 2025.11.09 : 테스트 및 코드 리펙토링</br>

---
<a id="시스템-아키텍처"></a>
## 🛠️ 시스템 아키텍처
![MJSECCTF drawio](https://github.com/user-attachments/assets/1257fdac-4325-4c3a-a94f-27f323842ab4)

---

<a id="erd"></a>
## 📝 ERD

![ERD](https://github.com/user-attachments/assets/196c5e96-2331-4f69-b9a2-59dfa1368858)

---

<a id="구현된-기능"></a>
## ⚙️ 구현된 기능

### ⭐️ USER
- 회원가입 / 로그인 / 로그아웃 기능
- 유저 프로필 조회 기능 (획득한 점수, 랭크, 푼 문제 조회)
- 이메일 인증 기능 (인증 코드 발송 및 검증)
- ID 및 이메일 중복 확인
- 개인 문제 풀이 히스토리 조회

### ⭐️ TEAM
- 팀 프로필 조회 (팀원 정보, 팀 점수, 팀 순위)
- 팀 문제 풀이 히스토리 조회

### ⭐️ CHALLENGE
- 문제 목록 전체 조회 (페이지네이션 지원)
- 문제 상세 조회 (문제 제목, 설명, 링크)
- 문제 파일 다운로드
- 문제 제출 (다이나믹 스코어링, 디스코드 봇 연동)

### ⭐️ SIGNATURE (시그니처 검증 시스템)
- 시그니처 코드 검증 및 문제 언락
- 팀별 언락 상태 조회
- 언락된 챌린지 목록 조회

### ⭐️ LEADERBOARD
- 팀 단위 실시간 리더보드 (SSE 스트리밍)
- 팀 단위 점수 그래프 (SSE 스트리밍)

### ⭐️ PAYMENT
- QR 기반 마일리지 결제 시스템
- 결제 토큰 생성
- 마일리지 체크아웃 처리
- 팀별 결제 히스토리 조회

### ⭐️ ADMIN - 회원 관리
- 회원 조회 / 추가 / 수정 / 삭제
- 조기 퇴소 상태 변경
- 전체 회원 목록 조회

### ⭐️ ADMIN - 문제 관리
- 문제 조회 / 생성 / 수정 / 삭제 (파일 첨부 지원)
- 문제 요약 정보 조회
- 전체 제출 기록 조회
- 문제별 제출 기록 조회
- 특정 사용자 제출 기록 철회
- 사용자별 전체 제출 기록 삭제

### ⭐️ ADMIN - 팀 관리
- 팀 생성 / 삭제
- 팀원 추가 / 삭제
- 팀 마일리지 부여
- 전체 팀 목록 조회

### ⭐️ ADMIN - 결제 관리
- 전체 결제 히스토리 조회
- 결제 철회 및 마일리지 환불

### ⭐️ ADMIN - 시그니처 관리
- 시그니처 코드 일괄 업서트 (JSON)
- 시그니처 코드 CSV 임포트/익스포트
- 코드 풀 조회 및 랜덤 코드 생성
- 코드 재배정 및 소비상태 초기화
- 단일/일괄 코드 삭제
- 강제 언락 처리

### ⭐️ ADMIN - IP 관리
- IP 차단 / 차단 해제 / 차단 연장
- 차단된 IP 목록 조회
- IP 활동 로그 조회
- 의심스러운 IP 목록 집계
- IP 화이트리스트 관리
- IP 밴 캐시 재구축

### ⭐️ ADMIN - 기타
- 점수 재계산
- 대회 시작/종료 시간 설정
- 관리자 권한 검증

### ⭐️ TIME
- 서버 시간 조회
- 대회 시간 조회 (시작/종료 시간)

### ⭐️ TOKEN
- Access Token / Refresh Token 재발급

### 👾️ DISCORD BOT
- First-Blood BOT : 채널 멤버에게 처음 문제를 풀이한 사람 정보 전달
- Role BOT : 채널 멤버에게 공지 사항, 대회 시작 정보, 우승자 정보 전달
- Ticket BOT : 티켓 생성 (관리자와 개인 채팅방 생성), 티켓 방 (티켓 방 내에서 대화한 로그 txt 형태로 저장, 대화 종료) 기능
- DJ BOT : 모든 멤버 음소거 / 음소거 해제, 노래 추가 / 재생 / 건너뛰기 / 중단, 플레이리스트 조회 기능



---
<a id="화면-구성"></a>
## 🖥️ 화면 구성

<table width="100%">
  <tr>
    <td style="width:50%; vertical-align:top; padding:8px;">
      <div style="text-align:center; font-weight:bold;">메인 페이지 1</div>
      <hr style="border:none; border-top:1px solid #ddd; margin:8px 0;">
      <img src="https://github.com/user-attachments/assets/fab53623-7fb8-40a5-a8fa-c338738240ba" style="width:100%; height:auto;" alt="메인 페이지 1">
    </td>
    <td style="width:50%; vertical-align:top; padding:8px;">
      <div style="text-align:center; font-weight:bold;">메인 페이지 2</div>
      <hr style="border:none; border-top:1px solid #ddd; margin:8px 0;">
      <img src="https://github.com/user-attachments/assets/9bb5333d-b692-4d9c-8be3-89ad40fc7312" style="width:100%; height:auto;" alt="메인 페이지 2">
    </td>
  </tr>
  <tr>
    <td style="width:50%; vertical-align:top; padding:8px;">
      <div style="text-align:center; font-weight:bold;">메인 페이지 3</div>
      <hr style="border:none; border-top:1px solid #ddd; margin:8px 0;">
      <img src="https://github.com/user-attachments/assets/252e89e1-5fc5-4418-812f-02abed62cb26" style="width:100%; height:auto;" alt="메인 페이지 3">
    </td>
    <td style="width:50%; vertical-align:top; padding:8px;">
      <div style="text-align:center; font-weight:bold;">메인 페이지 4</div>
      <hr style="border:none; border-top:1px solid #ddd; margin:8px 0;">
      <img src="https://github.com/user-attachments/assets/7684a272-cd5a-43b8-bf55-6bfd27fb9a70" style="width:100%; height:auto;" alt="메인 페이지 4">
    </td>
  </tr>
  <tr>
    <td style="width:50%; vertical-align:top; padding:8px;">
      <div style="text-align:center; font-weight:bold;">메인 페이지 5</div>
      <hr style="border:none; border-top:1px solid #ddd; margin:8px 0;">
      <img src="https://github.com/user-attachments/assets/7b979b83-a9bb-484d-85ee-83670229b36c" style="width:100%; height:auto;" alt="메인 페이지 5">
    </td>
    <td style="width:50%; vertical-align:top; padding:8px;">
      <div style="text-align:center; font-weight:bold;">로그인 페이지</div>
      <hr style="border:none; border-top:1px solid #ddd; margin:8px 0;">
      <img src="https://github.com/user-attachments/assets/e2b36c11-bdee-43f4-b478-d687140c1765" style="width:100%; height:auto;" alt="로그인 페이지">
    </td>
  </tr>
  <tr>
    <td style="width:50%; vertical-align:top; padding:8px;">
      <div style="text-align:center; font-weight:bold;">문제 리스트 페이지</div>
      <hr style="border:none; border-top:1px solid #ddd; margin:8px 0;">
      <img src="https://github.com/user-attachments/assets/5b2a8259-ae7a-4044-a97c-d53fd7dd27a4" style="width:100%; height:auto;" alt="문제 리스트 페이지">
    </td>
    <td style="width:50%; vertical-align:top; padding:8px;">
      <div style="text-align:center; font-weight:bold;">문제 상세 페이지</div>
      <hr style="border:none; border-top:1px solid #ddd; margin:8px 0;">
      <img src="https://github.com/user-attachments/assets/7c7ffb67-cce9-480b-b2d2-043033a15f96" style="width:100%; height:auto;" alt="문제 상세 페이지">
    </td>
  </tr>
  <tr>
    <td style="width:50%; vertical-align:top; padding:8px;">
      <div style="text-align:center; font-weight:bold;">리더보드 페이지(상단)</div>
      <hr style="border:none; border-top:1px solid #ddd; margin:8px 0;">
      <img src="https://github.com/user-attachments/assets/28a82754-509b-44c0-bc39-7e78d3b24a80" style="width:100%; height:auto;" alt="리더보드 페이지 상단">
    </td>
    <td style="width:50%; vertical-align:top; padding:8px;">
      <div style="text-align:center; font-weight:bold;">리더보드 페이지(하단)</div>
      <hr style="border:none; border-top:1px solid #ddd; margin:8px 0;">
      <img src="https://github.com/user-attachments/assets/2d94a50c-7682-4df5-899b-dd69ec36d97a" style="width:100%; height:auto;" alt="리더보드 페이지 하단">
    </td>
  </tr>
  <tr>
    <td style="width:50%; vertical-align:top; padding:8px;">
      <div style="text-align:center; font-weight:bold;">랭킹 페이지</div>
      <hr style="border:none; border-top:1px solid #ddd; margin:8px 0;">
      <img src="https://github.com/user-attachments/assets/7f2440a8-c15f-4170-8464-f43f7d684fd2" style="width:100%; height:auto;" alt="랭킹 페이지">
    </td>
    <td style="width:50%; vertical-align:top; padding:8px;">
      <div style="text-align:center; font-weight:bold;">마이 페이지</div>
      <hr style="border:none; border-top:1px solid #ddd; margin:8px 0;">
      <img src="https://github.com/user-attachments/assets/8b10fd2e-9892-4269-8f7c-01364ecd0258" style="width:100%; height:auto;" alt="마이 페이지">
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding:8px; vertical-align:top;">
      <div style="text-align:center; font-weight:bold;">타이머 페이지</div>
      <hr style="border:none; border-top:1px solid #ddd; margin:8px 0;">
      <img src="https://github.com/user-attachments/assets/046363d5-e29d-4625-a9a3-9d6ac0797dba" style="width:100%; height:auto;" alt="타이머 페이지">
    </td>
  </tr>
</table>


## 🤖 DISCORD BOT
-
<table>
  <tr>
    <td align="center"><b>🎟️ Ticket BOT</b></td>
    <td align="center"><b>🎭 Role BOT</b></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/602eb1c4-d33d-4f6f-88aa-cb525b1454b0" width="1470px"></td>
    <td><img src="https://github.com/user-attachments/assets/f86d8c02-a617-48a5-8763-51ca60c97140" width="1470px"></td>
  </tr>
  <tr>
    <td align="center"><b>🩸 First-Blood BOT</b></td>
    <td align="center"><b>🎵 DJ BOT</b></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/3b7c3e0b-7d91-45e3-a756-8bc891acc037" width="1470px"></td>
    <td><img src="https://github.com/user-attachments/assets/de5e2942-082f-40ed-b91c-5344fa5513ad" width="1470px"></td>
  </tr>
</table>
