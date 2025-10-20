import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTeamProfile, fetchTeamHistory } from "../api/TeamAPI"; // ✅ TeamAPI의 rows 사용
import { fetchPaymentQRToken, buildPaymentQRString, fetchPaymentHistory } from "../api/PaymentAPI"; // 결제 QR 토큰 + 스킴 빌더 + 히스토리
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

  // 결제 히스토리
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);

  // 팀 히스토리 (문제 풀이 기록)
  const [teamHistory, setTeamHistory] = useState([]);
  const [teamHistoryLoading, setTeamHistoryLoading] = useState(false);
  const [teamHistoryError, setTeamHistoryError] = useState(false);

  // 1) 팀 프로필 (rows -> 팀 객체로 재구성)
  useEffect(() => {
    if (MOCK) {
      setProfile({
        teamId: 1,
        teamName: "Admin",
        members: ["admin@example.com"],
        rank: 1,
        toalPoint: 0,
        mileage: 0,
        solvedCount: 0,
        avatarUrl: "/src/assets/MsgLogo.svg",
      });
      return;
    }

    (async () => {
      try {
        const rows = await fetchTeamProfile(); // [{teamId,teamName,userEmail,memberEmail,teamMileage,teamTotalPoint,teamSolvedCount}, ...]
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
          toalPoint: first.teamTotalPoint ?? 0,
          mileage: first.teamMileage ?? 0,
          solvedCount: first.teamSolvedCount ?? 0,
          avatarUrl: "/src/assets/MsgLogo.svg",
        });
      } catch {
        setProfileError(true);
      }
    })();
  }, []);

  // 3) 리더보드 SSE (teamName 기준으로 순위 반영)
  useEffect(() => {
    if (MOCK || !profile?.teamName) return;

    const eventSource = new EventSource("/api/leaderboard/stream");
    eventSource.onmessage = (event) => {
      try {
        let payloadStr = event.data;
        if (typeof payloadStr === "string" && payloadStr.startsWith("data:")) {
          payloadStr = payloadStr.slice(5);
        }
        const parsed = JSON.parse(payloadStr);
        const leaderboard = Array.isArray(parsed) ? parsed : parsed?.data;
        if (!Array.isArray(leaderboard)) return;

        const mine = leaderboard.find((item) => item.teamId === profile.teamId)
                ?? leaderboard.find((item) => item.teamName === profile.teamName);

        if (mine) {
          setProfile((prev) => ({
            ...prev,
            rank: mine.rank ?? prev.rank,
            totalPoint: mine.totalPoint ?? prev.totalPoint,
          }));
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
  }, [profile?.teamId, profile?.teamName]);

  // ===== 결제 히스토리 로드 =====
  const loadPaymentHistory = useCallback(async () => {
    if (MOCK) {
      setPaymentHistory([
        {
          teamPaymentHistoryId: 1,
          mileageUsed: 500,
          requesterLoginId: "admin",
          createdAt: new Date().toISOString(),
        },
        {
          teamPaymentHistoryId: 2,
          mileageUsed: 300,
          requesterLoginId: "user",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
      return;
    }

    setHistoryLoading(true);
    setHistoryError(false);
    try {
      const history = await fetchPaymentHistory();
      setPaymentHistory(Array.isArray(history) ? history : []);
    } catch (err) {
      console.error('결제 히스토리 로딩 실패:', err);
      setHistoryError(true);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaymentHistory();
  }, [loadPaymentHistory]);

  // ===== 팀 히스토리 로드 =====
  const loadTeamHistory = useCallback(async () => {
    if (MOCK) {
      setTeamHistory([
        {
          teamId: 1,
          teamName: "Admin",
          challengeId: "1",
          title: "Sample Challenge 1",
          solvedTime: new Date().toISOString(),
          currentScore: 100,
          solvedBy: "admin",
        },
        {
          teamId: 1,
          teamName: "Admin",
          challengeId: "2",
          title: "Sample Challenge 2",
          solvedTime: new Date(Date.now() - 3600000).toISOString(),
          currentScore: 200,
          solvedBy: "user1",
        },
      ]);
      return;
    }

    setTeamHistoryLoading(true);
    setTeamHistoryError(false);
    try {
      const history = await fetchTeamHistory();
      setTeamHistory(Array.isArray(history) ? history : []);
    } catch (err) {
      console.error('팀 히스토리 로딩 실패:', err);
      setTeamHistoryError(true);
    } finally {
      setTeamHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeamHistory();
  }, [loadTeamHistory]);

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

        // ✅ loginId 우선순위: 서버 응답 → (개발 보조) 쿼리/로컬스토리지
        const loginIdCandidate = data?.loginId ?? resolveLoginIdFallback();
        const loginId = typeof loginIdCandidate === "string" ? loginIdCandidate.trim() : "";

        // ✅ QR 데이터 생성: pay+ctf://checkout?token=...&exp=...&loginId=...
        const qrPayload = buildPaymentQRString({
          token: data.token,
          expiry: data.expiry,
          // loginId가 없으면 매개변수에서 생략됨(서버에서 토큰↔소유자 검증 권장)
          loginId: loginId || undefined,
        });

        setQrData(qrPayload);
        setQrExpireAt(data.expiry);

        // 남은 시간 계산 (서버 시간 기준)
        // createdAt은 서버의 현재 시간, expiry는 만료 시간
        const createdAtStr = typeof data.createdAt === 'string' && data.createdAt.includes(' ')
          ? data.createdAt.replace(' ', 'T')
          : data.createdAt;
        const expiryStr = typeof data.expiry === 'string' && data.expiry.includes(' ')
          ? data.expiry.replace(' ', 'T')
          : data.expiry;

        const serverNow = new Date(createdAtStr);
        const expire = new Date(expiryStr);

        // 유효하지 않은 날짜인 경우 기본값 5분 사용
        let leftSec;
        if (isNaN(serverNow.getTime()) || isNaN(expire.getTime())) {
          console.warn('[MyPage] Invalid date format, using 5 minutes default');
          leftSec = 300; // 5분
        } else {
          leftSec = Math.max(0, Math.floor((expire.getTime() - serverNow.getTime()) / 1000));
        }

        console.log('[MyPage] Server time:', createdAtStr, 'Expiry:', expiryStr, 'Time left:', leftSec, 'seconds');
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

        // 만료 시 자동 재발급 (최소 10초 이상일 때만)
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        if (leftSec > 10) {
          refreshTimerRef.current = setTimeout(() => issueQR(), (leftSec + 0.5) * 1000);
        } else {
          console.warn('[MyPage] QR expiry time too short, not scheduling auto-refresh');
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기 마운트 시 한 번만 실행

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
                  <span className="pill">{profile.totalPoint} pts</span>
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

      {/* 결제 히스토리 섹션 */}
      <section className="card">
        <div className="card-header">
          <h3>결제 히스토리</h3>
          <button
            onClick={loadPaymentHistory}
            disabled={historyLoading}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              cursor: historyLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {historyLoading ? '로딩 중...' : '새로고침'}
          </button>
        </div>
        <div className="problems-box">
          {historyLoading ? (
            <Loading />
          ) : historyError ? (
            <p className="error-message">결제 히스토리를 불러오는 중 오류가 발생했습니다.</p>
          ) : paymentHistory.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '500px'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>사용 마일리지</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>요청자</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>결제 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment.teamPaymentHistoryId} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 8px' }}>{payment.teamPaymentHistoryId}</td>
                      <td style={{ padding: '12px 8px' }}>
                        {payment.mileageUsed?.toLocaleString() ?? 0} pt
                      </td>
                      <td style={{ padding: '12px 8px' }}>{payment.requesterLoginId ?? '-'}</td>
                      <td style={{ padding: '12px 8px' }}>
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleString('ko-KR')
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="dim">결제 히스토리가 없습니다.</p>
          )}
        </div>
      </section>

      {/* 팀 히스토리 섹션 */}
      <section className="card">
        <div className="card-header">
          <h3>팀 문제 풀이 기록</h3>
          <button
            onClick={loadTeamHistory}
            disabled={teamHistoryLoading}
            style={{
              padding: '6px 12px',
              fontSize: '14px',
              cursor: teamHistoryLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {teamHistoryLoading ? '로딩 중...' : '새로고침'}
          </button>
        </div>
        <div className="problems-box">
          {teamHistoryLoading ? (
            <Loading />
          ) : teamHistoryError ? (
            <p className="error-message">팀 히스토리를 불러오는 중 오류가 발생했습니다.</p>
          ) : teamHistory.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '600px'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>문제 ID</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>문제 제목</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>풀이자</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>획득 점수</th>
                    <th style={{ padding: '12px 8px', textAlign: 'left' }}>풀이 시간</th>
                  </tr>
                </thead>
                <tbody>
                  {teamHistory.map((record, idx) => (
                    <tr key={`${record.challengeId}-${idx}`} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 8px' }}>{record.challengeId}</td>
                      <td style={{ padding: '12px 8px', fontWeight: '500' }}>
                        {record.title || '-'}
                      </td>
                      <td style={{ padding: '12px 8px' }}>{record.solvedBy || '-'}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          color: record.currentScore > 0 ? '#2ecc71' : '#95a5a6',
                          fontWeight: '600'
                        }}>
                          {record.currentScore?.toLocaleString() ?? 0} pt
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {record.solvedTime
                          ? new Date(record.solvedTime).toLocaleString('ko-KR')
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="dim">아직 풀이한 문제가 없습니다.</p>
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
