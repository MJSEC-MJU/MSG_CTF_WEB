// src/pages/TimerPage.jsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useContestTime } from "../components/Timer";
import SevenSegment from "../components/SevenSegment";
import "./TimerPage.css";

function TimerPage() {
  const location = useLocation();
  const { contestStartTime, isContestStarted, serverNow, isLoading } = useContestTime();

  const [timeLeft, setTimeLeft] = useState(null);
  const [initialTimeLeft, setInitialTimeLeft] = useState(null);
  // const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    // if (testMode) return; // 테스트 모드일 때는 실제 타이머 비활성화
    if (contestStartTime == null) return;

    const calc = () => {
      const remain = contestStartTime - serverNow();
      setTimeLeft(remain);

      // 초기 시간 저장 (한 번만)
      if (initialTimeLeft === null && remain > 0) {
        setInitialTimeLeft(remain);
      }
    };

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [contestStartTime, serverNow, initialTimeLeft]);

  // 테스트 모드 타이머
  // useEffect(() => {
  //   if (!testMode) return;

  //   const id = setInterval(() => {
  //     setTimeLeft(prev => {
  //       if (prev === null || prev <= 0) return 0;
  //       return prev - 1000;
  //     });
  //   }, 1000);

  //   return () => clearInterval(id);
  // }, [testMode]);

  if (!isLoading && isContestStarted) {
    const redirectPath = location.state?.from || "/";
    return <Navigate to={redirectPath} replace />;
  }

  const formatTimeDigits = (ms) => {
    if (ms === null || ms <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / (1000 * 60)) % 60;
    const h = Math.floor(ms / (1000 * 60 * 60));
    return { hours: h, minutes: m, seconds: s };
  };

  const getProgress = () => {
    // 대회가 시작되었거나 초기값이 없으면 100%
    if (!initialTimeLeft || timeLeft === null || timeLeft <= 0) return 100;

    // 진행도 계산: (초기 시간 - 남은 시간) / 초기 시간 * 100
    // 시간이 지날수록 진행도가 0% → 100%로 증가
    const elapsed = initialTimeLeft - timeLeft;
    const progressPercent = (elapsed / initialTimeLeft) * 100;

    return Math.max(0, Math.min(100, progressPercent));
  };

  const { hours, minutes, seconds } = formatTimeDigits(timeLeft);
  const progress = getProgress();

  // 10초 이하 남았는지 확인
  const isFinalCountdown = timeLeft !== null && timeLeft > 0 && timeLeft <= 10000;
  const finalSeconds = isFinalCountdown ? Math.ceil(timeLeft / 1000) : 0;

  // 테스트 버튼 핸들러
  // const handleTestCountdown = () => {
  //   setTestMode(true);
  //   setTimeLeft(15000); // 15초로 설정 (10초 카운트다운 보기 위해)
  //   setInitialTimeLeft(15000);
  // };

  // const handleResetTest = () => {
  //   setTestMode(false);
  //   setTimeLeft(null);
  //   setInitialTimeLeft(null);
  // };

  return (
    <div className="timer-page">
      {/* 테스트 버튼 */}
      {/* <div className="test-buttons">
        <button onClick={handleTestCountdown} className="test-btn">
          10초 카운트다운 테스트
        </button>
        <button onClick={handleResetTest} className="test-btn reset">
          리셋
        </button>
      </div> */}

      <div className={`oven-container ${isFinalCountdown ? 'final-countdown' : ''}`}>
        <div className="oven-display">
          {/* 오븐 상단 헤더 */}
          <div className="oven-header">
            <div className="oven-brand">MSG CTF OVEN</div>
            <div className={`cooking-indicator ${!isLoading && timeLeft > 0 ? 'active' : ''}`}>
              <span className="cooking-text">{isFinalCountdown ? 'STARTING!' : 'PREPARING'}</span>
            </div>
          </div>

          {/* LED 디스플레이 */}
          <div className={`led-display ${isFinalCountdown ? 'urgent' : ''}`}>
            {isLoading || timeLeft === null ? (
              <div className="loading-text">SYNC...</div>
            ) : timeLeft <= 0 ? (
              <div className="ready-text">READY!</div>
            ) : isFinalCountdown ? (
              <div className="final-countdown-display">
                <SevenSegment digit={finalSeconds} size="large" urgent={true} />
                <div className="countdown-label">SECONDS</div>
              </div>
            ) : (
              <div className="time-digits">
                <div className="digit-group">
                  <div className="segment-pair">
                    <SevenSegment digit={Math.floor(hours / 100)} />
                    <SevenSegment digit={Math.floor((hours % 100) / 10)} />
                    <SevenSegment digit={hours % 10} />
                  </div>
                  <div className="digit-label">HOURS</div>
                </div>
                <div className="separator-segment">:</div>
                <div className="digit-group">
                  <div className="segment-pair">
                    <SevenSegment digit={Math.floor(minutes / 10)} />
                    <SevenSegment digit={minutes % 10} />
                  </div>
                  <div className="digit-label">MINUTES</div>
                </div>
                <div className="separator-segment">:</div>
                <div className="digit-group">
                  <div className="segment-pair">
                    <SevenSegment digit={Math.floor(seconds / 10)} />
                    <SevenSegment digit={seconds % 10} />
                  </div>
                  <div className="digit-label">SECONDS</div>
                </div>
              </div>
            )}
          </div>

          {/* 진행 바 (히팅 바) */}
          <div className="heating-bar-container">
            <div className="heating-label">
              <span>PROGRESS</span>
            </div>
            <div className="heating-bar">
              <div
                className="heating-progress"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* 오븐 정보 */}
          {isLoading && (
            <div className="oven-info">
              <div className="info-item sync">
                <span className="info-text">SYNCHRONIZING...</span>
              </div>
            </div>
          )}
        </div>

        {/* 오븐 컨트롤 패널 (장식용) */}
        <div className="oven-controls">
          <div className="control-knob">
            <div className="knob"></div>
            <div className="knob-label">TEMP</div>
          </div>
          <div className="control-knob">
            <div className="knob"></div>
            <div className="knob-label">TIME</div>
          </div>
          <div className="control-knob">
            <div className="knob"></div>
            <div className="knob-label">MODE</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimerPage;
