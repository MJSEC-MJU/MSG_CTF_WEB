import "./App.css";
import { useState, useEffect, Suspense, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Ranking from "./pages/Ranking";
import Scoreboard from "./pages/Scoreboard";
import Challenge from "./pages/Challenge";
import ProblemDetail from "./pages/ProblemDetail";
import MyPage from "./pages/MyPage";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminAuth from "./api/AdminAuth";
import Loading from "./components/Loading";
import TimerPage from "./pages/TimerPage";
import ProblemDetailMock from './pages/ProblemDetailMock';
import { useContestTime } from "./components/Timer";
import { fetchServerTime } from "./api/ServerTimeAPI";

// const CONTEST_START_TIME = new Date("2025-10-08T08:22:00Z").getTime(); // UTC 기준
// const CONTEST_END_TIME = new Date("2025-10-29T13:00:00Z").getTime(); // 대회 종료 시간

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedLoginStatus = localStorage.getItem("isLoggedIn");
    return savedLoginStatus === "true";
  });

  const { contestStartTime, contestEndTime } = useContestTime();
  const [isContestStarted, setIsContestStarted] = useState(null);
  const [isContestEnded, setIsContestEnded] = useState(false);
  const alertRef = useRef({
    contestNotStarted: false,
    contestEnded: false,
  }); // alert 중복 방지

    // 실제 서버
useEffect(() => {
  if (!contestStartTime || !contestEndTime) return;

  const syncTime = async () => {
    try {
      const data = await fetchServerTime();
      console.log(data);

      // ✅ 서버 반환 구조: { serverTime: "2025-10-11T23:15:42.123" }
      // LocalDateTime은 timezone 정보가 없으므로 서버가 KST라면 그대로 사용 가능
      const now = new Date(data.serverTime).getTime();

      const start = new Date(contestStartTime).getTime();
      const end = new Date(contestEndTime).getTime();

      setIsContestStarted(now >= start);
      setIsContestEnded(now >= end);
    } catch (e) {
      console.error("[App] 서버 시간 동기화 실패, 로컬 시간 사용:", e);

      const now = Date.now();
      const start = new Date(contestStartTime).getTime();
      const end = new Date(contestEndTime).getTime();

      setIsContestStarted(now >= start);
      setIsContestEnded(now >= end);
    }
  };

  syncTime();
  const interval = setInterval(syncTime, 10000);
  return () => clearInterval(interval);
}, [contestStartTime, contestEndTime]);

  // 로컬 테스트
  // useEffect(() => {
  //   if (!contestStartTime || !contestEndTime) return;

  //   const syncTime = () => {
  //     const now = Date.now();
  //     const start = new Date(contestStartTime).getTime();
  //     const end = new Date(contestEndTime).getTime();

  //     setIsContestStarted(now >= start);
  //     setIsContestEnded(now >= end);
  //   };

  //   syncTime();
  //   const interval = setInterval(syncTime, 1000); // 1초마다 확인
  //   return () => clearInterval(interval);
  // }, [contestStartTime, contestEndTime]);

  // useEffect(() => {
  //   let syncInterval;
  //   let retryDelay = 1000; // 초기에 1초마다 요청

  //   const fetchServerTime = async () => {
  //     try {
  //       const response = await fetch("https://worldtimeapi.org/api/timezone/Asia/Seoul");
  //       if (!response.ok) throw new Error("시간 서버 응답 오류");

  //       const data = await response.json();
  //       const serverNow = new Date(data.datetime).getTime();
  //       setIsContestStarted(serverNow >= CONTEST_START_TIME);
  //       setIsContestEnded(serverNow >= CONTEST_END_TIME);

  //       if (serverNow < CONTEST_START_TIME || serverNow < CONTEST_END_TIME) {
  //         retryDelay = 10000; // 대회 시작 전 or 진행 중이면 10초마다 요청
  //       } else {
  //         clearInterval(syncInterval); // 대회 종료 후 중단
  //       }
  //     } catch (error) {
  //       //console.error("시간 동기화 실패:", error);
  //       const now = Date.now();
  //       setIsContestStarted(now >= CONTEST_START_TIME);
  //       setIsContestEnded(now >= CONTEST_END_TIME);
  //     }
  //   };

  //   fetchServerTime();
  //   syncInterval = setInterval(fetchServerTime, retryDelay);

  //   return () => clearInterval(syncInterval);
  // }, []);

  // Private Route: 대회 시작 전에는 타이머 페이지로 이동, 종료 후 홈으로 이동 (adminPage 제외)
  const PrivateRoute = ({ element, requireContestStarted = false }) => {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith("/adminPage");
    const isMyPage = location.pathname.startsWith("/mypage");

    if (isContestStarted === null) {
      return <Loading />;
    }

    if (isContestEnded && !isAdminPage && requireContestStarted) {
      if (!alertRef.current.contestEnded) {
        alert("대회가 종료되었습니다!");
        alertRef.current.contestEnded = true;
      }
      return <Navigate to="/" replace />;
    }

    if (!isContestStarted && !isMyPage) {
      if (!alertRef.current.contestNotStarted) {
        alert("대회 시간이 아닙니다!");
        alertRef.current.contestNotStarted = true;;
      }
      return <Navigate to="/timer" state={{ from: location.pathname }} />;
    }

    return element;
  };

  return (
    <Router>
      <Header />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/" element={<Home />} />
          <Route
            path="/ranking"
            // element={<Ranking />}
            element={<PrivateRoute element={isLoggedIn ? <Ranking /> : <Navigate to="/login" />} />}
          />
          <Route
            path="/scoreboard"
            // element={<Scoreboard />}
            element={<PrivateRoute element={isLoggedIn ? <Scoreboard /> : <Navigate to="/login" />} />}
          />
          <Route
            path="/challenge"
            // element={<Challenge />}
            element={<PrivateRoute element={isLoggedIn ? <Challenge /> : <Navigate to="/login" />} />}
          />
          <Route path="/problem/:id" element={<PrivateRoute element={<ProblemDetail />} />} />
          {/* 미리보기: /problem?mock 로 접속 (파라미터 없는 /problem 경로) */}
          <Route path="/problem" element={<ProblemDetailMock />} />
          <Route
            path="/myPage"
            // element={<MyPage />}
            element={<PrivateRoute element={isLoggedIn ? <MyPage /> : <Navigate to="/login" />} />}
          />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route
            path="/adminPage"
            element={
              <AdminAuth>
                <Admin />
              </AdminAuth>
              // <Admin />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

