import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const CONTEST_START_TIME = new Date('2025-03-26T17:35:00').getTime();

function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(CONTEST_START_TIME - Date.now());
  const [isStarted, setIsStarted] = useState(timeLeft <= 0);
  const location = useLocation(); // 현재 위치 가져오기

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = CONTEST_START_TIME - Date.now();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setIsStarted(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (isStarted) {
    const redirectPath = location.state?.from || "/";
    return <Navigate to={redirectPath} replace />;
  }

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours}시간 ${minutes}분 ${seconds}초`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-3xl font-bold" style={{ color: "white" }}>
        대회 시작까지 남은 시간
      </h2>
      <h1 className="text-2xl mt-4" style={{ color: "white" }}>
        {formatTime(timeLeft)}
      </h1>
    </div>
  );
}

export default TimerPage;
