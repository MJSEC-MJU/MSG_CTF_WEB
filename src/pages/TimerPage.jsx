import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const CONTEST_START_TIME = new Date("2025-03-26T14:17:00Z").getTime(); // UTC 기준

function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(CONTEST_START_TIME - Date.now());
  const [isStarted, setIsStarted] = useState(timeLeft <= 0);
  const location = useLocation();

  useEffect(() => {
    let countdownInterval;
    let syncInterval;
    let retryDelay = 1000; // 초기 1초마다 요청

    const fetchTime = async () => {
      try {
        const response = await fetch("https://worldtimeapi.org/api/timezone/Asia/Seoul");
        if (!response.ok) throw new Error("시간 서버 응답 오류");

        const data = await response.json();
        const serverNow = new Date(data.datetime).getTime();
        const remainingTime = CONTEST_START_TIME - serverNow;
        setTimeLeft(remainingTime);

        if (remainingTime <= 0) {
          setIsStarted(true);
          clearInterval(countdownInterval);
          clearInterval(syncInterval);
        } else {
          retryDelay = 10000; // 대회 시작 전에는 10초마다 동기화
        }
      } catch (error) {
        console.error("시간 동기화 실패:", error);
        setTimeLeft(CONTEST_START_TIME - Date.now());
      }
    };

    fetchTime();
    syncInterval = setInterval(fetchTime, retryDelay);

    countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTimeLeft = prev - 1000;
        if (newTimeLeft <= 0) {
          setIsStarted(true);
          clearInterval(countdownInterval);
          clearInterval(syncInterval);
          return 0;
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
