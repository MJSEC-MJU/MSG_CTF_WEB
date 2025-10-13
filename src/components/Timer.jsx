import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { fetchContestTime } from "../api/ContestTimeAPI";

const ContestTimeContext = createContext();

// 서버에서 시간을 가져오는 간격 (5분)
const REFRESH_INTERVAL = 5 * 60 * 1000;

export function ContestTimeProvider({ children }) {
  const [contestStartTime, setContestStartTime] = useState("");
  const [contestEndTime, setContestEndTime] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);

  // 서버에서 대회 시간 가져오기
  const loadContestTime = useCallback(async () => {
    try {
      const data = await fetchContestTime();
      if (data?.startTime) setContestStartTime(data.startTime);
      if (data?.endTime) setContestEndTime(data.endTime);
      // currentServerTime은 state로 관리하지 않음 (불필요한 리렌더링 방지)
      return data; // 필요한 곳에서 직접 사용
    } catch (e) {
      console.warn('[Timer] Failed to fetch contest time from server:', e);
      return null;
    }
  }, []);

  // 초기 로드 및 주기적 갱신
  useEffect(() => {
    // 초기 로드
    (async () => {
      await loadContestTime();
      setIsLoading(false);
    })();

    // 주기적으로 서버에서 시간 갱신 (5분마다)
    intervalRef.current = setInterval(() => {
      loadContestTime();
    }, REFRESH_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadContestTime]);

  // 관리자가 시간을 수동으로 변경할 때 사용 (즉시 반영 및 다시 로드)
  const setContestStartTimeManual = useCallback((time) => {
    setContestStartTime(time);
    // 서버 업데이트 후 다시 로드
    setTimeout(() => loadContestTime(), 1000);
  }, [loadContestTime]);

  const setContestEndTimeManual = useCallback((time) => {
    setContestEndTime(time);
    // 서버 업데이트 후 다시 로드
    setTimeout(() => loadContestTime(), 1000);
  }, [loadContestTime]);

  return (
    <ContestTimeContext.Provider
      value={{
        contestStartTime,
        contestEndTime,
        setContestStartTime: setContestStartTimeManual,
        setContestEndTime: setContestEndTimeManual,
        isLoading,
        refreshContestTime: loadContestTime, // 수동 갱신용
      }}
    >
      {children}
    </ContestTimeContext.Provider>
  );
}

export function useContestTime() {
  return useContext(ContestTimeContext);
}