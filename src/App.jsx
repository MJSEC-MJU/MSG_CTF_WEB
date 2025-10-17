// src/App.jsx
import "./App.css";
import { useState, Suspense, useRef, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Loading from "./components/Loading";
import { useContestTime } from "./components/Timer";

// 코드 스플리팅: 페이지 컴포넌트들을 lazy loading
const Home = lazy(() => import("./pages/Home"));
const Ranking = lazy(() => import("./pages/Ranking"));
const Scoreboard = lazy(() => import("./pages/Scoreboard"));
const Challenge = lazy(() => import("./pages/Challenge"));
const ProblemDetail = lazy(() => import("./pages/ProblemDetail"));
const MyPage = lazy(() => import("./pages/MyPage"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminAuth = lazy(() => import("./api/AdminAuth"));
const TimerPage = lazy(() => import("./pages/TimerPage"));
const ProblemDetailMock = lazy(() => import('./pages/ProblemDetailMock'));

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem("isLoggedIn");
    return saved === "true";
  });

  const { isContestStarted, isContestEnded, isLoading } = useContestTime();
  const alertRef = useRef({ contestNotStarted: false, contestEnded: false });

  const PrivateRoute = ({ element, requireContestStarted = false }) => {
    const location = useLocation();
    const isChallengePage = location.pathname.startsWith("/challenge");
    const isMyPage = location.pathname.startsWith("/mypage");

    if (isLoading || isContestStarted === null) {
      return <Loading />;
    }

    if (requireContestStarted && isContestEnded && isChallengePage) {
      if (!alertRef.current.contestEnded) {
        alert("대회가 종료되었습니다!");
        alertRef.current.contestEnded = true;
      }
      return <Navigate to="/" replace />;
    }

    if (requireContestStarted && !isContestStarted && !isMyPage) {
      if (!alertRef.current.contestNotStarted) {
        alert("대회 시간이 아닙니다!");
        alertRef.current.contestNotStarted = true;
      }
      return <Navigate to="/timer" state={{ from: location.pathname }} />;
    }

    // 대회가 시작되면 alert 플래그 초기화 (다음 대회를 위해)
    if (isContestStarted && alertRef.current.contestNotStarted) {
      alertRef.current.contestNotStarted = false;
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
            element={<PrivateRoute requireContestStarted element={isLoggedIn ? <Ranking /> : <Navigate to="/login" />} />}
          />
          <Route
            path="/scoreboard"
            element={<PrivateRoute requireContestStarted element={isLoggedIn ? <Scoreboard /> : <Navigate to="/login" />} />}
          />
          <Route
            path="/challenge"
            element={<PrivateRoute requireContestStarted element={isLoggedIn ? <Challenge /> : <Navigate to="/login" />} />}
          />
          <Route path="/problem/:id" element={<PrivateRoute requireContestStarted element={<ProblemDetail />} />} />
          <Route path="/problem" element={<ProblemDetailMock />} />
          <Route
            path="/myPage"
            element={<PrivateRoute requireContestStarted element={isLoggedIn ? <MyPage /> : <Navigate to="/login" />} />}
          />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
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
