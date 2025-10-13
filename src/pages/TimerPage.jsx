// src/pages/TimerPage.jsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useContestTime } from "../components/Timer";

function TimerPage() {
  const location = useLocation();
  const { contestStartTime, isContestStarted, serverNow, isLoading } = useContestTime();

  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (contestStartTime == null) return;

    const calc = () => {
      const remain = contestStartTime - serverNow();
      setTimeLeft(remain);
    };

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [contestStartTime, serverNow]);

  if (!isLoading && isContestStarted) {
    const redirectPath = location.state?.from || "/";
    return <Navigate to={redirectPath} replace />;
  }

  const formatTime = (ms) => {
    if (ms === null) return "로딩 중...";
    if (ms <= 0) return "대회가 시작되었습니다!";
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / (1000 * 60)) % 60;
    const h = Math.floor(ms / (1000 * 60 * 60));
    return `${h}시간 ${m}분 ${s}초`;
  };

  return (
    <div className="flex flex-col items-center justify-center" style={{ transform: "translateY(120px)" }}>
      <h2 className="text-3xl font-bold mb-4" style={{ color: "red" }}>
        대회 시작까지 남은 시간
      </h2>
      <h1 className="text-2xl mt-6" style={{ color: "black" }}>
        {formatTime(timeLeft)}
      </h1>
      {(isLoading || timeLeft === null) && (
        <p className="text-sm mt-2" style={{ color: "#666" }}>
          서버 시간 동기화 중...
        </p>
      )}
    </div>
  );
}

export default TimerPage;
