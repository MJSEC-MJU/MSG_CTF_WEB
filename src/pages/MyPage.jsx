import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTeamProfileRows } from "../api/TeamAPI";
import { fetchPaymentQRToken, buildPaymentQRString } from "../api/PaymentAPI";
import Loading from "../components/Loading";
import "./MyPage.css";
import { QRCodeCanvas } from "qrcode.react";

const MOCK = new URLSearchParams(window.location.search).has("mock");

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

const resolveLoginIdFallback = () => {
  const qs = new URLSearchParams(window.location.search);
  const fromQuery = qs.get("loginId");
  const fromStorage = localStorage.getItem("loginId");
  return (fromQuery || fromStorage || "").trim();
};

const buildLocalQRPayload = (lifetimeSec = 300, loginId = "mockUser") => {
  const now = new Date();
  const expire = new Date(now.getTime() + lifetimeSec * 1000);
  const token = uuidLike();
  const qrData = buildPaymentQRString({
    token,
    expiry: expire.toISOString(),
    loginId,
  });
  return { qrData, expireAt: expire.toISOString() };
};

// 마이크로초(6자리) ISO를 밀리초(3자리)로 정규화
const normalizeIsoMillis = (s) =>
  typeof s === "string" ? s.replace(/(\.\d{3})\d+$/, "$1") : s;

// QR 렌더 최적화
const QRCanvas = memo(({ value }) => (
  <QRCodeCanvas value={value} size={192} includeMargin />
));

const MyPage = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);

  const mileage = profile?.mileage ?? 0;

  const [qrData, setQrData] = useState("");
  const [qrExpireAt, setQrExpireAt] = useState(null);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const refreshTimerRef = useRef(null);
  const tickRef = useRef(null);

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
        const rows = await fetchTeamProfileRows();
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
          rank: 1,
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

        const rankIndex = leaderboard.findIndex((item) => item.teamName === profile.teamName);
        if (rankIndex !== -1) {
          setProfile((prev) => ({ ...prev, rank: rankIndex + 1 }));
        }
      } catch {}
    };
    eventSource.onerror = () => {
      setLeaderboardError(true);
      eventSource.close();
    };
    return () => eventSource.close();
  }, [profile?.teamName]);

  const issueQR = useCallback(async () => {
    setQrLoading(true);
    setQrError(false);
    try {
      if (MOCK) {
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
        const data = await fetchPaymentQRToken();
        const box = data?.data ?? data;

        // 여기서 box를 쓰지 않고 data.*를 쓰면 undefined 접근 → 남은 시간 0 → 무한 재호출
        const loginIdCandidate = box?.loginId ?? resolveLoginIdFallback();
        const loginId = typeof loginIdCandidate === "string" ? loginIdCandidate.trim() : "";

        // 마이크로초 6자리 → 3자리로 정규화해서 Date 파싱 실패 방지
        const normalizedExpiry = normalizeIsoMillis(box.expiry);

        const qrPayload = buildPaymentQRString({
          token: box.token,
          expiry: normalizedExpiry,
          loginId: loginId || undefined,
        });

        setQrData(qrPayload);
        setQrExpireAt(normalizedExpiry);

        const now = new Date();
        const expire = new Date(normalizedExpiry);
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

  const qrNode = useMemo(
    () => (qrData ? <QRCanvas value={qrData} /> : null),
    [qrData]
  );

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

      <section className="profile card">
        <div className="profile-layout">
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
                </div>

                <div className="mileage">
                  마일리지&nbsp;
                  <strong>{Number(mileage || 0).toLocaleString()}</strong>
                  &nbsp;point
                </div>
              </div>
            </div>
          </div>

          <aside className="profile-qr">
            <div className="qr-body">
              <div className="qr-image">
                {qrLoading ? (
                  <Loading />
                ) : qrError ? (
                  <p className="error-message small">QR 발급에 실패했습니다.</p>
                ) : qrNode ? (
                  qrNode
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

      {leaderboardError && (
        <p className="error-message">리더보드 업데이트에 실패했습니다.</p>
      )}
    </div>
  );
};

export default MyPage;

