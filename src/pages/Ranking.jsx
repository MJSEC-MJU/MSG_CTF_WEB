// src/pages/Ranking.jsx
import { useEffect, useRef, useState } from "react";
import "./Ranking.css";
import Loading from "../components/Loading";

// .env의 VITE_API_URL 사용
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const STREAM_URL = `${API_BASE}/api/leaderboard/stream`;

const Ranking = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const esRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const hourlyTimerRef = useRef(null);

  const cleanup = () => {
    if (esRef.current) {
      try { esRef.current.close(); } catch {}
      esRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const parsePayloadToArray = (raw) => {
    if (!raw) return [];
    let text = String(raw).trim();
    // 혹시 서버가 "data:[{...}]" 형태로 보낼 때 대비
    if (text.startsWith("data:")) text = text.slice(5).trim();
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed?.data)) return parsed.data;
      return [];
    } catch {
      return [];
    }
  };

  const connect = () => {
    cleanup(); // 기존 연결 정리 후 재연결
    const es = new EventSource(STREAM_URL);
    esRef.current = es;

    es.onopen = () => {
      if (loading) setLoading(false);
    };

    es.onmessage = (event) => {
      const next = parsePayloadToArray(event.data);
      if (Array.isArray(next)) setScores(next);
    };

    es.onerror = () => {
      cleanup();
      // 에러 발생 시 3초 후 재연결
      reconnectTimerRef.current = setTimeout(connect, 3000);
    };
  };

  useEffect(() => {
    // 최초 연결
    connect();

    // 첫 이벤트가 오래 안 오더라도 스피너는 5초 후 내려줌
    const safety = setTimeout(() => setLoading(false), 5000);

    // 🔁 2시간마다 강제 재연결 (서버 부하 감소)
    hourlyTimerRef.current = setInterval(() => {
      connect();
    }, 2 * 60 * 60 * 1000);

    return () => {
      cleanup();
      clearTimeout(safety);
      if (hourlyTimerRef.current) {
        clearInterval(hourlyTimerRef.current);
        hourlyTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayScores = scores.map((row, index) => {
    const rank = row.rank ?? index + 1;
    return (
      <div className="card" key={row.teamId ?? `${row.teamName}-${rank}`}>
        <div className={`rank ${rank <= 3 ? "top3" : ""}`}>
          <span className={`rank-number ${rank <= 3 ? "top3" : ""}`}>{rank}</span>
          <span className="user">{row.teamName}</span>
        </div>
        <span className={`score ${rank <= 3 ? "top3" : ""}`}>{row.totalPoint}</span>
      </div>
    );
  });

  if (loading) {
    return (
      <div className="ranking-wrapper">
        <div className="loading-wrapper">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="responsive-wrapper">
      <div className="ranking-wrapper">
        <h2 className="title">Ranking</h2>
        <div className="list">{displayScores}</div>
      </div>
    </div>
  );
};

export default Ranking;


