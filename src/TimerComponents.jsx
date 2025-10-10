import { createContext, useContext, useState, useEffect } from "react";

const ContestTimeContext = createContext();

export function ContestTimeProvider({ children }) {
  const [contestStartTime, setContestStartTime] = useState(() => {
    return localStorage.getItem("contestStartTime") || "";
  });
  const [contestEndTime, setContestEndTime] = useState(() => {
    return localStorage.getItem("contestEndTime") || "";
  });

  // localStorage에 자동 저장
  useEffect(() => {
    if (contestStartTime) localStorage.setItem("contestStartTime", contestStartTime);
    if (contestEndTime) localStorage.setItem("contestEndTime", contestEndTime);
  }, [contestStartTime, contestEndTime]);

  return (
    <ContestTimeContext.Provider
      value={{
        contestStartTime,
        contestEndTime,
        setContestStartTime,
        setContestEndTime,
      }}
    >
      {children}
    </ContestTimeContext.Provider>
  );
}

export function useContestTime() {
  return useContext(ContestTimeContext);
}
