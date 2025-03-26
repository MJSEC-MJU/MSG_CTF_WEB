import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const CONTEST_START_TIME = new Date("2025-03-26T21:35:00+09:00").getTime(); // 한국 시간 기준

function TimerPage() {
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState(null);
  const [isStarted, setIsStarted] = useState(false); // 기본값 false로 설정

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const response = await fetch("https://worldtimeapi.org/api/timezone/Asia/Seoul");
        const data = await response.json();
        const serverNow = new Date(data.utc_datetime).getTime() + 9 * 60 * 60 * 1000; // UTC → KST 변환
        const remainingTime = CONTEST_START_TIME - serverNow;

        setTimeLeft(remainingTime);
        if (remainingTime <= 0) {
          setIsStarted(true);
        }
      } catch (error) {
        console.error("시간 동기화 실패:", error);
        const localRemainingTime = CONTEST_START_TIME - Date.now();
        setTimeLeft(localRemainingTime);
        if (localRemainingTime <= 0) {
          setIsStarted(true);
        }
      }
    };

    fetchTime();
    const syncInterval = setInterval(fetchTime, 100000);
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        const newTimeLeft = prev - 1000;
        if (newTimeLeft <= 0) {
          setIsStarted(true);
          clearInterval(countdownInterval);
          clearInterval(syncInterval);
        }
        return newTimeLeft;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
      clearInterval(syncInterval);
    };
  }, []);

  if (isStarted) {
    const redirectPath = location.state?.from || "/";
    return <Navigate to={redirectPath} replace />;
  }

  if (timeLeft === null) {
    return <h1>시간 동기화 중...</h1>;
  }

  const formatTime = (ms) => {
    if (ms <= 0) return "대회가 시작되었습니다!";
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
