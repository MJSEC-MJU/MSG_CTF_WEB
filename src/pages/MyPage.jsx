import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTeamProfileRows } from "../api/TeamAPI"; // ✅ TeamAPI의 rows 사용
import { fetchPaymentQRToken, buildPaymentQRString } from "../api/PaymentAPI"; // ✅ 결제 QR 토큰 + 스킴 빌더
// import { fetchProblems } from "../api/ChallengeAllAPI"; // 🔒 팀단위 정리 전까지 미사용
import Loading from "../components/Loading";
import "./MyPage.css";
import { QRCodeCanvas } from "qrcode.react";

// ===== [개발용 ONLY] Mock 모드 스위치 =====
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

/**
 * 내 loginId 추정:
 * - ?loginId= 파라미터(테스트/개발 편의)
 * - localStorage('loginId')
 * 실제 배포에서는 백엔드가 fetchPaymentQRToken 응답에 loginId를 넣어주므로 그걸 우선 사용
 */
const resolveLoginIdFallback = () => {
  const qs = new URLSearchParams(window.location.search);
  const fromQuery = qs.get("loginId");
  const fromStorage = localStorage.getItem("loginId");
  return (fromQuery || fromStorage || "").trim();
};

// 🚨 실제 배포시 buildLocalQRPayload()는 Mock에서만 사용하세요.
const buildLocalQRPayload = (lifetimeSec = 300, loginId = "mockUser") => {
  const now = new Date();
  const expire = new Date(now.getTime() + lifetimeSec * 1000);
  const token = uuidLike();
  // ✅ 통일된 스킴 생성기 사용 (loginId 포함)
  const qrData = buildPaymentQRString({
    token,
    expiry: expire.toISOString(),
    loginId,
  });
  return { qrData, expireAt: expire.toISOString() };
};

const MyPage = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);

  // 🔒 문제 섹션은 팀 단위 API 정리 전까지 주석
  // const [solvedProblems, setSolvedProblems] = useState([]);
  // const [unsolvedProblems, setUnsolvedProblems] = useState([]);
  // const [problemsLoading, setProblemsLoading] = useState(true);
  // const [problemsError, setProblemsError] = useState(false);

  // 팀 마일리지는 API의 teamMileage 사용
  const mileage = profile?.mileage ?? 0;

  // 결제 QR 상태
  const [qrData, setQrData] = useState("");
  const [qrExpireAt, setQrExpireAt] = useState(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const refreshTimerRef = useRef(null);
  const tickRef = useRef(null);

  // 1) 팀 프로필 (rows -> 팀 객체로 재구성)
  useEffect(() => {
    if (MOCK) {
      setProfile({
        teamId: 1,
        teamName: "Admin",
        members: ["admin@example.com"],
        rank: 1,
        points: 0,
        mileage: 0,
        solvedCount: 0,
        avatarUrl: "/assets/profileSample.webp",
      });
      return;
    }

    (async () => {
      try {
        const rows = await fetchTeamProfileRows(); // [{teamId,teamName,userEmail,memberEmail,teamMileage,teamTotalPoint,teamSolvedCount}, ...]
        const list = Array.isArray(rows) ? rows : [];
        if (list.length === 0) {
          setProfileError(true);
          return;
        }
        const first = list[0];
        const members = [...new Set(list.map((r) => r.memberEmail).filter(Boolean))];

        setProfile({
          teamId: first.teamId,
          teamName: first.teamName ?? "TEAM",
          members,
          rank: 1, // 최초 진입 시 임시값, SSE에서 업데이트
          points: first.teamTotalPoint ?? 0,
          mileage: first.teamMileage ?? 0,
          solvedCount: first.teamSolvedCount ?? 0,
          avatarUrl: "/assets/profileSample.webp",
        });
      } catch {
        setProfileError(true);
      }
    })();
  }, []);

  // 2) 문제(팀단위 미구현 → 전면 주석)
  /*
  useEffect(() => {
    if (MOCK) {
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

    setProblemsLoading(true);
    fetchProblems(0, 20)
      .then(({ problems }) => {
        const list = Array.isArray(problems) ? problems : [];
        const solved = list.filter((p) => p.solved === true);
        const unsolved = list.filter((p) => p.solved === false);
        setSolvedProblems(solved);
        setUnsolvedProblems(unsolved);
      })
      .catch(() => setProblemsError(true))
      .finally(() => setProblemsLoading(false));
  }, []);
  */

  // 3) 리더보드 SSE (teamName 기준으로 순위 반영)
  useEffect(() => {
    if (MOCK || !profile?.teamName) return;

    const eventSource = new EventSource("https://msg.mjsec.kr/api/leaderboard/stream");
    eventSource.onmessage = (event) => {
      try {
        let jsonStr = event.data;
        if (jsonStr.startsWith("data:")) jsonStr = jsonStr.substring(5);
        const payload = JSON.parse(jsonStr);
        const leaderboard = Array.isArray(payload) ? payload : payload.data;
        if (!Array.isArray(leaderboard)) return;

        // 항목이 { teamName, points, ... } 구조라고 가정
        const rankIndex = leaderboard.findIndex((item) => item.teamName === profile.teamName);
        if (rankIndex !== -1) {
          setProfile((prev) => ({ ...prev, rank: rankIndex + 1 }));
        }
      } catch {
        // no-op
      }
    };
    eventSource.onerror = () => {
      setLeaderboardError(true);
      eventSource.close();
    };
    return () => eventSource.close();
  }, [profile?.teamName]);

  // ===== QR 발급 =====
  const issueQR = useCallback(async () => {
    setQrLoading(true);
    setQrError(false);
    try {
      if (MOCK) {
        // Mock 모드: 로컬 QR 생성 (loginId 포함)
        const fallbackLogin = resolveLoginIdFallback() || "mockUser";
        const payload = buildLocalQRPayload(300, fallbackLogin);
        setQrData(payload.qrData);
        setQrExpireAt(payload.expireAt);

        const now = new Date();
        const expire = new Date(payload.expireAt);
        const leftSec = Math.max(0, Math.floor((expire.getTime() - now.getTime()) / 1000));
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
        refreshTimerRef.current = setTimeout(() => issueQR(), (leftSec + 0.5) * 1000);
      } else {
        // 실제 API 호출
        const data = await fetchPaymentQRToken();
        const box = data?.data ?? data;
        // ✅ loginId 우선순위: 서버 응답 → (개발 보조) 쿼리/로컬스토리지
        const loginIdCandidate = data?.loginId ?? resolveLoginIdFallback();
        const loginId = typeof loginIdCandidate === "string" ? loginIdCandidate.trim() : "";

        // ✅ QR 데이터 생성: pay+ctf://checkout?token=...&exp=...&loginId=...
        const qrPayload = buildPaymentQRString({
          token: box.token,
          expiry: box.expiry,
          // loginId가 없으면 매개변수에서 생략됨(서버에서 토큰↔소유자 검증 권장)
          loginId: loginId || undefined,
        });

        setQrData(qrPayload);
        setQrExpireAt(data.expiry);

        // 남은 시간 계산
        const now = new Date();
        const expire = new Date(box.expiry);
        const leftSec = Math.max(0, Math.floor((expire.getTime() - now.getTime()) / 1000));
        setTimeLeft(leftSec);

        // 카운트다운 타이머 시작
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

        // 만료 시 자동 재발급
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = setTimeout(() => issueQR(), (leftSec + 0.5) * 1000);
      }
    } catch (err) {
      console.error("QR 토큰 발급 실패:", err);
      setQrError(true);
    } finally {
      setQrLoading(false);
    }
  }, []);

  useEffect(() => {
    issueQR();
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [issueQR]);

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

      {/* 프로필 + (우측) 결제 QR */}
      <section className="profile card">
        <div className="profile-layout">
          {/* 좌측: 팀 프로필 정보 */}
          <div className="profile-main">
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
                  {/* 팀 솔브 카운트가 필요하면 아래 라인을 풀 것:
                  <span className="pill">Solves {profile.solvedCount}</span>
                  */}
                </div>

                <div className="mileage">
                  마일리지&nbsp;
                  <strong>{Number(mileage || 0).toLocaleString()}</strong>
                  &nbsp;point
                </div>
              </div>
            </div>
          </div>

          {/* 우측: 결제 QR 패널 */}
          <aside className="profile-qr">
            <div className="qr-body">
              <div className="qr-image">
                {qrLoading ? (
                  <Loading />
                ) : qrError ? (
                  <p className="error-message small">
                    QR 발급에 실패했습니다.
                  </p>
                ) : qrData ? (
                  <QRCodeCanvas value={qrData} size={192} includeMargin />
                ) : (
                  <p className="error-message small">표시할 QR 데이터가 없습니다.</p>
                )}
              </div>

              <div className="qr-meta">
                <div className="qr-status">
                  <span>
                    <strong>{formatMMSS(timeLeft)}</strong>
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* 🔒 문제 섹션 (팀단위 API 정리 전까지 주석 처리)
      <section className="problems card">
        <div className="card-header">
          <h3>Solved Problems</h3>
        </div>
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

        <div className="card-header mt24">
          <h3>Unsolved Problems</h3>
        </div>
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
      */}

      {leaderboardError && (
        <p className="error-message">리더보드 업데이트에 실패했습니다.</p>
      )}
    </div>
  );
};

export default MyPage;
