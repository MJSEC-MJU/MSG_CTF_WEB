import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { fetchContestTime } from "../api/ContestTimeAPI";

function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let countdownInterval;
    let syncInterval;

    const fetchAndSyncTime = async () => {
      try {
        const data = await fetchContestTime();

        // 서버 응답: { startTime, endTime, currentTime }
        // 형식: "yyyy-MM-dd HH:mm:ss"
        const contestStart = new Date(data.startTime.replace(' ', 'T')).getTime();
        const serverNow = new Date(data.currentTime.replace(' ', 'T')).getTime();

        const remainingTime = contestStart - serverNow;
        setTimeLeft(remainingTime);

        if (remainingTime <= 0) {
          setIsStarted(true);
          clearInterval(countdownInterval);
          clearInterval(syncInterval);
        }
      } catch (error) {
        console.error("대회 시간 동기화 실패:", error);
        // 실패 시 로컬 시간 사용 (fallback)
      }
    };

    // 초기 로드
    fetchAndSyncTime();

    // 10초마다 서버와 동기화
    syncInterval = setInterval(fetchAndSyncTime, 10000);

    // 1초마다 카운트다운
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
    <div className="flex flex-col items-center justify-center" style={{ transform: "translateY(120px)" }}>
      <h2 className="text-3xl font-bold mb-4" style={{ color: "red" }}>
        대회 시작까지 남은 시간
      </h2>
      <h1 className="text-2xl mt-6" style={{ color: "black" }}>
        {formatTime(timeLeft)}
      </h1>
    </div>
  );
}

export default TimerPage;
