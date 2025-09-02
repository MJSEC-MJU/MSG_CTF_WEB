import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../api/ProfileAPI";
import { fetchProblems } from "../api/ChallengeAllAPI";
import Loading from "../components/Loading";
import "./MyPage.css";
import { QRCodeCanvas } from "qrcode.react";

// ===== [개발용 ONLY] Mock 모드 스위치 =====
// 🚨 실제 배포시 아래 줄과 관련된 모든 MOCK 코드 블록은 삭제하세요.
const MOCK = new URLSearchParams(window.location.search).has("mock");

// ====== QR 토큰 생성 유틸 ======
const uuidLike = () => {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = [...b].map((v) => v.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10, 16).join("")}`;
};

// 🚨 실제 배포시 buildLocalQRPayload() 대신 백엔드 API 응답을 사용하세요.
const buildLocalQRPayload = (lifetimeSec = 300) => {
  const now = new Date();
  const expire = new Date(now.getTime() + lifetimeSec * 1000);
  const token = uuidLike();
  const qrData = `pay+ctf://checkout?token=${token}&exp=${expire.toISOString()}`;
  return { qrData, expireAt: expire.toISOString() };
};

const MyPage = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);

  const [solvedProblems, setSolvedProblems] = useState([]);
  const [unsolvedProblems, setUnsolvedProblems] = useState([]);
  const [problemsLoading, setProblemsLoading] = useState(true);
  const [problemsError, setProblemsError] = useState(false);

  const MILEAGE_PER_SOLVE = 500; // 푼 문제당 500 마일리지
  const mileage = useMemo(
    () => solvedProblems.length * MILEAGE_PER_SOLVE,
    [solvedProblems]
  );

  // 결제 QR 상태
  const [qrData, setQrData] = useState("");
  const [qrExpireAt, setQrExpireAt] = useState(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const refreshTimerRef = useRef(null);
  const tickRef = useRef(null);

  // 1) 프로필
  useEffect(() => {
    if (MOCK) {
      // 🚨 실제 배포시 이 블록은 삭제
      setProfile({
        teamName: "tester01",
        user_id: 1001,
        members: ["tester01@example.com", "tester02@example.com"],
        rank: 1,
        points: 1234,
        avatarUrl: "/assets/profileSample.webp",
      });
      return;
    }

    // ✅ 실제 배포시에는 아래 API 호출만 사용
    getProfile()
      .then((data) => {
        const user = data.data;
        setProfile({
          teamName: user.teamName ?? user.userId ?? "TEAM",
          user_id: user.user_id,
          // 백엔드가 members 배열을 주면 그대로 사용, 없으면 email을 단일 멤버로
          members: Array.isArray(user.members)
            ? user.members
            : user.email
            ? [user.email]
            : [],
          rank: 1, // 최초 진입 시 임시값, SSE에서 업데이트
          points: user.total_point,
          avatarUrl: "/assets/profileSample.webp",
        });
      })
      .catch(() => setProfileError(true));
  }, []);

  // 2) 문제
  useEffect(() => {
    if (MOCK) {
      // 🚨 실제 배포시 이 블록은 삭제
      const problems = Array.from({ length: 10 }).map((_, i) => ({
        challengeId: 1000 + i,
        title: `Sample Challenge ${i + 1}`,
        points: 50 + i * 10,
        solved: i % 3 === 0,
      }));
      setSolvedProblems(problems.filter((p) => p.solved));
      setUnsolvedProblems(problems.filter((p) => !p.solved));
      setProblemsLoading(false);
      return;
    }

    // ✅ 실제 배포시에는 아래 API 호출만 사용
    setProblemsLoading(true);
    fetchProblems(0, 20)
      .then(({ problems }) => {
        const solved = problems.filter((p) => p.solved === true);
        const unsolved = problems.filter((p) => p.solved === false);
        setSolvedProblems(solved);
        setUnsolvedProblems(unsolved);
      })
      .catch(() => setProblemsError(true))
      .finally(() => setProblemsLoading(false));
  }, []);

  // 3) 리더보드 SSE
  useEffect(() => {
    if (MOCK || !profile) return; // 🚨 실제 배포시 MOCK 체크 부분 삭제

    const eventSource = new EventSource(
      "https://msg.mjsec.kr/api/leaderboard/stream"
    );
    eventSource.onmessage = (event) => {
      try {
        let jsonStr = event.data;
        if (jsonStr.startsWith("data:")) jsonStr = jsonStr.substring(5);
        const payload = JSON.parse(jsonStr);
        const leaderboard = Array.isArray(payload) ? payload : payload.data;
        if (!Array.isArray(leaderboard)) return;

        const rankIndex = leaderboard.findIndex(
          (item) => item.userId === profile.teamName
        );
        if (rankIndex !== -1)
          setProfile((prev) => ({ ...prev, rank: rankIndex + 1 }));
      } catch {}
    };
    eventSource.onerror = () => {
      setLeaderboardError(true);
      eventSource.close();
    };
    return () => eventSource.close();
  }, [profile]);

  // ===== QR 발급 =====
  const issueQR = async () => {
    setQrLoading(true);
    setQrError(false);
    try {
      // 🚨 실제 배포시 아래 buildLocalQRPayload 대신 API 호출로 교체하세요.
      const payload = buildLocalQRPayload(300);

      setQrData(payload.qrData);
      setQrExpireAt(payload.expireAt);

      const now = new Date();
      const expire = new Date(payload.expireAt);
      const leftSec = Math.max(
        0,
        Math.floor((expire.getTime() - now.getTime()) / 1000)
      );
      setTimeLeft(leftSec);

      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(tickRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(issueQR, (leftSec + 0.5) * 1000);
    } catch {
      setQrError(true);
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    issueQR();
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const manualRefresh = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    issueQR();
  };

  const formatMMSS = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  if (profileError) {
    return (
      <div className="mypage-container message-container">
        <p className="error-message">사용자 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="mypage-container message-container">
        <Loading />
      </div>
    );
  }

  return (
    <div className="mypage-container">
      <div className="brand-bar" />

      {/* 프로필 */}
      <section className="profile card">
        <div className="profile-row">
          <div className="avatar">
            <img
              src={profile.avatarUrl}
              alt="User Avatar"
              className="avatar-image"
            />
          </div>
          <div className="profile-meta">
            <h2 className="profile-name">{profile.teamName}</h2>

            {/* 팀 멤버 목록 */}
            {profile.members?.length > 0 && (
              <ul className="member-list">
                {profile.members.map((m, i) => (
                  <li key={i} className="member-item">
                    {m}
                  </li>
                ))}
              </ul>
            )}

            <div className="profile-stats">
              <span className="pill">Rank #{profile.rank}</span>
              <span className="pill">{profile.points} pts</span>
            </div>

            <div className="mileage">
              마일리지&nbsp;
              <strong>{mileage.toLocaleString()}</strong>
              &nbsp;point
            </div>
          </div>
        </div>
      </section>

    {/* 결제 QR */}
    <section className="qr card">
      <div className="card-header qr-header">
        <h3>결제 QR</h3>
        <button className="btn ghost" onClick={manualRefresh}>재발급</button>
      </div>

      <div className="qr-body">
        <div className="qr-image">
          {qrLoading ? (
            <Loading />
          ) : qrError ? (
            <p className="error-message small">QR 발급에 실패했습니다. 재발급을 눌러주세요.</p>
          ) : qrData ? (
            <QRCodeCanvas value={qrData} size={192} includeMargin />
          ) : (
            <p className="error-message small">표시할 QR 데이터가 없습니다.</p>
          )}
        </div>

        <div className="qr-meta">
          <div className="qr-status">
            <span className="led" />
            <span>자동 갱신 · 남은 시간 <strong>{formatMMSS(timeLeft)}</strong></span>
          </div>
          {qrExpireAt && (
            <span className="dim">만료 시각: {new Date(qrExpireAt).toLocaleString()}</span>
          )}
        </div>
      </div>
    </section>

    {/* 문제 */}
    <section className="problems card">
      <div className="card-header"><h3>Solved Problems</h3></div>
      <div className="problems-box">
        {problemsLoading ? (
          <Loading />
        ) : problemsError ? (
          <p className="error-message">문제 데이터를 불러오는 중 오류가 발생했습니다.</p>
        ) : solvedProblems.length ? (
          <div className="chips">
            {solvedProblems.map((problem) => (
              <button
                key={problem.challengeId}
                className="chip"
                onClick={() => navigate(`/problem/${problem.challengeId}`)}
              >
                {problem.title}
                <span className="chip-pts">{problem.points} pts</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="dim">푼 문제가 없습니다.</p>
        )}
      </div>

      <div className="card-header mt24"><h3>Unsolved Problems</h3></div>
      <div className="problems-box">
        {problemsLoading ? (
          <Loading />
        ) : problemsError ? (
          <p className="error-message">문제 데이터를 불러오는 중 오류가 발생했습니다.</p>
        ) : unsolvedProblems.length ? (
          <div className="chips">
            {unsolvedProblems.map((problem) => (
              <button
                key={problem.challengeId}
                className="chip ghost"
                onClick={() => navigate(`/problem/${problem.challengeId}`)}
              >
                {problem.title}
                <span className="chip-pts">{problem.points} pts</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="dim">안 푼 문제가 없습니다.</p>
        )}
      </div>
    </section>


      {leaderboardError && (
        <p className="error-message">리더보드 업데이트에 실패했습니다.</p>
      )}
    </div>
  );
};

export default MyPage;

