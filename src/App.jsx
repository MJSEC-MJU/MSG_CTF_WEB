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
import AdminLogin from "./pages/AdminLogin";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminAuth from "./api/AdminAuth";
import Loading from "./components/Loading";
import TimerPage from "./pages/TimerPage";

const CONTEST_START_TIME = new Date("2025-03-27T13:33:00Z").getTime(); // UTC 기준 → 한국 시간은 +9시간

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedLoginStatus = localStorage.getItem("isLoggedIn");
    return savedLoginStatus === "true";
  });

  const [isContestStarted, setIsContestStarted] = useState(null);

  // 외부 NTP 서버에서 현재 한국 시간 가져오기
  useEffect(() => {
    const fetchServerTime = async () => {
      try {
        const response = await fetch("https://worldtimeapi.org/api/timezone/Asia/Seoul");
        const data = await response.json();
        const serverNow = new Date(data.datetime).getTime(); // 서버가 제공하는 한국 시간 사용
        setIsContestStarted(serverNow >= CONTEST_START_TIME);
      } catch (error) {
        console.error("시간 동기화 실패:", error);
        setIsContestStarted(Date.now() >= CONTEST_START_TIME); // 실패 시 로컬 시간 사용
      }
    };

    fetchServerTime();
    const interval = setInterval(fetchServerTime, 1000); // 1초마다 동기화

    return () => clearInterval(interval);
  }, []);

  // Private Route: 대회 시작 전에는 타이머 페이지로 이동
  const PrivateRoute = ({ element }) => {
    const location = useLocation();

    if (isContestStarted === null) {
      return <Loading />; // 시간 동기화가 끝날 때까지 로딩 화면 표시
    }

    if (!isContestStarted) {
      alert("대회 시간이 아닙니다!"); // 페이지를 누를 때마다 alert가 떠야 하므로 여기에 위치
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
            element={
              <PrivateRoute
                element={isLoggedIn ? <Ranking /> : <Navigate to="/login" />}
              />
            }
          />
          <Route
            path="/scoreboard"
            element={
              <PrivateRoute
                element={isLoggedIn ? <Scoreboard /> : <Navigate to="/login" />}
              />
            }
          />
          <Route
            path="/challenge"
            element={
              <PrivateRoute
                element={isLoggedIn ? <Challenge /> : <Navigate to="/login" />}
              />
            }
          />
          <Route
            path="/problem/:id"
            element={<PrivateRoute element={<ProblemDetail />} />}
          />
          <Route
            path="/myPage"
            element={
              <PrivateRoute
                element={isLoggedIn ? <MyPage /> : <Navigate to="/login" />}
              />
            }
          />
          <Route path="/adminLogin" element={<AdminLogin />} />
          <Route
            path="/login"
            element={<Login setIsLoggedIn={setIsLoggedIn} />}
          />
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
