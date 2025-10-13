// src/App.jsx
import "./App.css";
import { useState, Suspense, useRef } from "react";
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem("isLoggedIn");
    return saved === "true";
  });

  const { isContestStarted, isContestEnded, isLoading } = useContestTime();
  const alertRef = useRef({ contestNotStarted: false, contestEnded: false });

  const PrivateRoute = ({ element, requireContestStarted = false }) => {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith("/adminPage");
    const isMyPage = location.pathname.startsWith("/mypage");

    if (isLoading || isContestStarted === null) {
      return <Loading />;
    }

    if (requireContestStarted && isContestEnded && !isAdminPage) {
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
