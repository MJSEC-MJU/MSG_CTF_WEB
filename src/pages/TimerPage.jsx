import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const CONTEST_START_TIME = new Date("2025-03-26T13:54:00Z").getTime(); // UTC 기준 변환

function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(CONTEST_START_TIME - Date.now());
  const [isStarted, setIsStarted] = useState(timeLeft <= 0);
  const location = useLocation(); // 현재 위치 가져오기

  useEffect(() => {
    let countdownInterval;
    let syncInterval;

    const fetchTime = async () => {
      try {
        const response = await fetch("https://worldtimeapi.org/api/timezone/Asia/Seoul");
        const data = await response.json();
        const serverNow = new Date(data.datetime).getTime(); // 한국 시간 그대로 사용
        const remainingTime = CONTEST_START_TIME - serverNow;
        setTimeLeft(remainingTime);
        if (remainingTime <= 0) {
          setIsStarted(true);
          clearInterval(countdownInterval);
          clearInterval(syncInterval);
        }
      } catch (error) {
        console.error("시간 동기화 실패:", error);
        setTimeLeft(CONTEST_START_TIME - Date.now()); // 실패 시 로컬 시간 사용
      }
    };

    fetchTime(); // 최초 실행

    syncInterval = setInterval(fetchTime, 1000); // 1초마다 서버 시간 동기화

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
