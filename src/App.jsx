import "./App.css";
import { useState, useEffect, Suspense } from "react";
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
// import AdminLogin from "./pages/AdminLogin";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminAuth from "./api/AdminAuth";
import Loading from "./components/Loading";
import TimerPage from "./pages/TimerPage";

const CONTEST_START_TIME = new Date("2025-03-29T01:00:00Z").getTime(); // UTC 기준
const CONTEST_END_TIME = new Date("2025-03-29T13:00:00Z").getTime(); // 대회 종료 시간

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedLoginStatus = localStorage.getItem("isLoggedIn");
    return savedLoginStatus === "true";
  });

  const [isContestStarted, setIsContestStarted] = useState(null);
  const [isContestEnded, setIsContestEnded] = useState(false);
  const [alertShown, setAlertShown] = useState(false); // alert 중복 방지

  useEffect(() => {
    let syncInterval;
    let retryDelay = 1000; // 초기에 1초마다 요청

    const fetchServerTime = async () => {
      try {
        const response = await fetch("https://worldtimeapi.org/api/timezone/Asia/Seoul");
        if (!response.ok) throw new Error("시간 서버 응답 오류");

        const data = await response.json();
        const serverNow = new Date(data.datetime).getTime();
        setIsContestStarted(serverNow >= CONTEST_START_TIME);
        setIsContestEnded(serverNow >= CONTEST_END_TIME);

        if (serverNow < CONTEST_START_TIME || serverNow < CONTEST_END_TIME) {
          retryDelay = 10000; // 대회 시작 전 or 진행 중이면 10초마다 요청
        } else {
          clearInterval(syncInterval); // 대회 종료 후 중단
        }
      } catch (error) {
        //console.error("시간 동기화 실패:", error);
        const now = Date.now();
        setIsContestStarted(now >= CONTEST_START_TIME);
        setIsContestEnded(now >= CONTEST_END_TIME);
      }
    };

    fetchServerTime();
    syncInterval = setInterval(fetchServerTime, retryDelay);

    return () => clearInterval(syncInterval);
  }, []);

  // Private Route: 대회 시작 전에는 타이머 페이지로 이동, 종료 후 홈으로 이동 (adminPage 제외)
  const PrivateRoute = ({ element }) => {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith("/adminPage");

    if (isContestStarted === null) {
      return <Loading />;
    }

    if (isContestEnded && !isAdminPage) {
      if (!alertShown) {
        alert("대회가 종료되었습니다!");
        setAlertShown(true);
      }
      return <Navigate to="/" replace />;
    }

    if (!isContestStarted) {
      if (!alertShown) {
        alert("대회 시간이 아닙니다!");
        setAlertShown(true);
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
            element={<Ranking />}
            // element={<PrivateRoute element={isLoggedIn ? <Ranking /> : <Navigate to="/login" />} />}
          />
          <Route
            path="/scoreboard"
            element={<PrivateRoute element={isLoggedIn ? <Scoreboard /> : <Navigate to="/login" />} />}
          />
          <Route
            path="/challenge"
            element={<PrivateRoute element={isLoggedIn ? <Challenge /> : <Navigate to="/login" />} />}
          />
          <Route path="/problem/:id" element={<PrivateRoute element={<ProblemDetail />} />} />
          <Route
            path="/myPage"
            element={<PrivateRoute element={isLoggedIn ? <MyPage /> : <Navigate to="/login" />} />}
          />
          {/* <Route path="/adminLogin" element={<AdminLogin />} /> */}
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/adminPage"
            element={
              <AdminAuth>
                <Admin />
              </AdminAuth>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;

