import './App.css';
import { useState, useEffect, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Ranking from './pages/Ranking';
import Scoreboard from './pages/Scoreboard';
import Challenge from './pages/Challenge';
import ProblemDetail from './pages/ProblemDetail';
import MyPage from './pages/MyPage';
import AdminLogin from './pages/AdminLogin';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';
import AdminAuth from './api/AdminAuth';
import Loading from './components/Loading';
import TimerPage from './pages/TimerPage';

const CONTEST_START_TIME = new Date('2025-03-25T10:35:00').getTime(); // 대회 시작 시간 설정

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedLoginStatus = localStorage.getItem('isLoggedIn');
    return savedLoginStatus === 'true';
  });

  const [isContestStarted, setIsContestStarted] = useState(
    Date.now() >= CONTEST_START_TIME
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() >= CONTEST_START_TIME) {
        setIsContestStarted(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Private Route: 대회 시작 전에는 타이머 페이지로 이동
  const PrivateRoute = ({ element }) => {
    const location = useLocation();

    if (!isContestStarted) {
      alert("대회 시간이 아닙니다!");
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
          <Route path="/" element={<Home />}/>
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

