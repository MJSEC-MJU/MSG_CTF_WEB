# MJSEC_CTF PROJECT

이 프로젝트는 MJSEC_CTF(Capture The Flag) 대회를 위한 웹 사이트로, CTFd를 사용하지 않고 직접 개발되었습니다. 
이 문서는 프로젝트의 설치 방법, 기여자 정보, 시스템 아키텍처, 기술 스택, 협업 방식, 개발 기간, ERD, 그리고 구현된 기능을 설명합니다.
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
3. [시스템 아키텍처](#시스템-아키텍처)
4. [협업 방식](#협업-방식)
5. [개발 기간](#개발-기간)
6. [ERD](#erd)
7. [구현된 기능](#구현된-기능)
8. [화면 구성](#화면-구성)

---

## 서버 설치 방법

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
## 기여자 표

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
          <td style="border: 1px solid #ddd; padding: 6px;" align="center">
            <a href="https://github.com/jongcoding">
              <img src="https://github.com/jongcoding.png" width="50" height="50" alt="jongcoding"><br>
              <sub>jongcoding</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px;">FIRST_bot</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px;" align="center">
            <a href="https://github.com/jiyoon77">
              <img src="https://github.com/jiyoon77.png" width="50" height="50" alt="jiyoon77"><br>
              <sub>jiyoon77</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px;">DJ_BOT</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px;" align="center">
            <a href="https://github.com/tember8003">
              <img src="https://github.com/tember8003.png" width="50" height="50" alt="tember8003"><br>
              <sub>tember8003</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px;">TICKET_bot</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 6px;" align="center">
            <a href="https://github.com/walnutpy">
              <img src="https://github.com/walnutpy.png" width="50" height="50" alt="walnutpy"><br>
              <sub>walnutpy</sub>
            </a>
          </td>
          <td style="border: 1px solid #ddd; padding: 6px;">ROLE_bot</td>
        </tr>
      </table>
    </td>
  </tr>
</table>


---

## 시스템 아키텍처
![MJSECCTF drawio](https://github.com/user-attachments/assets/1257fdac-4325-4c3a-a94f-27f323842ab4)

---

## 협업 방식

| 플랫폼 | 사용 방식 |
|--------|------------------------------------------------|
| <img src="https://img.shields.io/badge/discord-5865F2?style=for-the-badge&logo=discord&logoColor=white"> | 매주 금요일 2시 회의, 라이브 코딩 |
| <img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=Github&logoColor=white"> | PR을 통해 변경사항 및 테스트 과정 확인 |



---

## 개발 기간
2024.12.28 ~ 2025.01.04 : 팀 규칙 및 코딩 컨벤션 의논, 기능 정의</br>
2025.01.04 ~ 2025.01.18 : API 명세서 작성, ERD 설계</br>
2025.01.18 ~ 2025.01.25 : 프로젝트 환경 세팅, 로그인/회원가입 기능 구현</br>
2025.01.25 ~ 2025.02.01 : 문제 생성/수정/삭제 기능 구현</br>
2025.02.01 ~ 2025.02.08 : 문제 전체 조회, 문제 상세 조회, 문제 제출 기능 구현</br>
2025.02.08 ~ 2025.02.15 : 유저 프로필 조회, 리더보드(랭킹 & 그래프) 기능 구현</br>
2025.02.15 ~ 2025.02.22 : 디스코드봇 개발 및 연동</br>
2025.02.22 ~ 2025.03.01 : 관리자 기능(사용자/문제 생성, 조회, 수정, 삭제) 구현</br>
2025.03.01 ~ 2025.03.08 : 버그 수정</br>
2025.03.08 ~            : 테스트 및 코드 리펙토링

---

## ERD
<img width="1251" alt="Image" src="https://github.com/user-attachments/assets/5d644a6d-3d45-4fb8-8a08-78fb70319fa0" />

---

## 구현된 기능

---

## 화면 구성

