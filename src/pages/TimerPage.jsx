import { useEffect, useState } from "react";

const CONTEST_START_TIME = new Date('2025-03-26T18:00:00+09:00').getTime(); // 한국시간

function TimerPage() {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const response = await fetch("http://worldtimeapi.org/api/timezone/Etc/UTC");
        const data = await response.json();
        const serverNow = new Date(data.utc_datetime).getTime(); // NTP 기반 현재 시간
        setTimeLeft(CONTEST_START_TIME - serverNow);
      } catch (error) {
        console.error("시간 동기화 실패:", error);
        setTimeLeft(CONTEST_START_TIME - Date.now()); // 실패 시 fallback
      }
    };

    fetchTime(); // 처음 API 호출해서 서버 시간 가져옴
    const interval = setInterval(fetchTime, 10000); // 10초마다 동기화

    return () => clearInterval(interval);
  }, []);

  if (timeLeft === null) {
    return <div>시간을 불러오는 중...</div>;
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
