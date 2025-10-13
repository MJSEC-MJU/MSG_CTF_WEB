// src/components/Timer.jsx (기존 ContestTimeProvider 대체)
import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { fetchContestTime } from '../api/ContestTimeAPI';

const ContestTimeContext = createContext(null);
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5분

export function ContestTimeProvider({ children }) {
  const [startMs, setStartMs] = useState(null);
  const [endMs, setEndMs] = useState(null);
  const [skewMs, setSkewMs] = useState(0); // serverNow = Date.now() + skewMs
  const [isLoading, setIsLoading] = useState(true);

  const refreshTimer = useRef(null);
  const tickTimer = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchContestTime();
      // "yyyy-MM-dd HH:mm:ss" → ISO
      const parse = (s) => Date.parse(s.includes(' ') ? s.replace(' ', 'T') : s);

      const s = parse(data.startTime);
      const e = parse(data.endTime);
      const nowServer = parse(data.currentTime);

      if (!Number.isNaN(s)) setStartMs(s);
      if (!Number.isNaN(e)) setEndMs(e);

      // 서버-클라이언트 시각차 보정
      const clientNow = Date.now();
      if (!Number.isNaN(nowServer)) setSkewMs(nowServer - clientNow);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 최초 로드
    load();

    // 5분마다 서버와 동기화 (한 곳에서만)
    refreshTimer.current = setInterval(load, REFRESH_INTERVAL);

    // 초당 1회 틱 → UI만 갱신(네트워크 호출 아님)
    tickTimer.current = setInterval(() => {
      // 아무 것도 안 해도 상태가 필요하면 useState로 더미 tick 해도 됨.
      // 여기선 소비측이 serverNow()를 매 렌더마다 계산하게 두고,
      // 1초 틱으로 강제 리렌더를 유도하려면 아래처럼:
      setSkewMs((v) => v); // no-op set → 리렌더 유도 (가볍게 유지)
    }, 1000);

    return () => {
      clearInterval(refreshTimer.current);
      clearInterval(tickTimer.current);
    };
  }, [load]);

  const serverNow = useCallback(() => Date.now() + skewMs, [skewMs]);

  const isContestStarted = useMemo(() => {
    if (startMs == null) return null;
    return serverNow() >= startMs;
  }, [startMs, serverNow]);

  const isContestEnded = useMemo(() => {
    if (endMs == null) return false;
    return serverNow() >= endMs;
  }, [endMs, serverNow]);

  const value = useMemo(() => ({
    contestStartTime: startMs,      // ms
    contestEndTime: endMs,          // ms
    isContestStarted,               // boolean | null (초기 null)
    isContestEnded,                 // boolean
    serverNow,                      // () => ms
    refreshContestTime: load,
    isLoading,
  }), [startMs, endMs, isContestStarted, isContestEnded, serverNow, load, isLoading]);

  return (
    <ContestTimeContext.Provider value={value}>
      {children}
    </ContestTimeContext.Provider>
  );
}

export function useContestTime() {
  return useContext(ContestTimeContext);
}
