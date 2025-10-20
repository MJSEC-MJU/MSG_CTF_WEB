import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchProblems } from "../api/ChallengeAllAPI";
import { fetchSolvedChallenges } from "../api/UserChallengeAPI";
import {
  fetchUnlockedList,
  fetchUnlockStatus,
  submitSignatureCode,
} from "../api/SignatureAPI";
import Loading from "../components/Loading";
import "./Challenge.css";

function Challenge() {
  // 문제/페이지네이션
  const [problems, setProblems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // API 캐싱 (페이지 변경 시 불필요한 재호출 방지)
  const cachedSolvedRef = useRef(null);
  const cachedUnlockedRef = useRef(null);

  // 해결/언락 상태
  const [solvedChallenges, setSolvedChallenges] = useState(new Set());
  const [unlockedSet, setUnlockedSet] = useState(new Set());

  // 시그니처 모달 관련
  const [signatureForm, setSignatureForm] = useState(false);
  const [signatureInput, setSignatureInput] = useState("");
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const navigate = useNavigate();

  // useMemo로 categoryImages 메모이제이션 (재생성 방지)
  const categoryImages = useMemo(() => ({
    FORENSICS: "/assets/Challenge/forensics.svg",
    CRYPTO: "/assets/Challenge/crypto.svg",
    PWN: "/assets/Challenge/pwn.svg",
    ANDROID: "/assets/Challenge/android.svg",
    REV: "/assets/Challenge/rev.svg",
    MISC: "/assets/Challenge/misc.svg",
    WEB: "/assets/Challenge/web.svg",
    SIGNATURE: "/assets/Challenge/signature.svg",
  }), []);

  const categoryFallback = "/assets/Challenge/misc.svg";

  useEffect(() => {
    let isMounted = true;

    // 3개의 API를 병렬로 호출하여 로딩 속도 개선 + 캐싱
    (async () => {
      setLoading(true);
      try {
        // 캐시된 데이터가 있으면 재사용, 없으면 새로 호출
        const solvedPromise = cachedSolvedRef.current
          ? Promise.resolve(cachedSolvedRef.current)
          : fetchSolvedChallenges();

        const unlockedPromise = cachedUnlockedRef.current
          ? Promise.resolve(cachedUnlockedRef.current)
          : fetchUnlockedList();

        const [problemsResult, solvedResult, unlockedResult] = await Promise.allSettled([
          fetchProblems(currentPage),
          solvedPromise,
          unlockedPromise,
        ]);

        if (!isMounted) return;

        // 문제 목록
        if (problemsResult.status === 'fulfilled') {
          const { problems, totalPages } = problemsResult.value;
          setProblems(problems);
          setTotalPages(totalPages);
        } else {
          console.error('fetchProblems failed:', problemsResult.reason);
        }

        // 해결한 문제 (캐싱)
        if (solvedResult.status === 'fulfilled') {
          const solvedData = solvedResult.value;
          cachedSolvedRef.current = solvedData; // 캐시 저장
          setSolvedChallenges(new Set(solvedData.map((s) => String(s.challengeId))));
        } else {
          setSolvedChallenges(new Set());
        }

        // 언락된 시그니처 문제 (캐싱)
        if (unlockedResult.status === 'fulfilled') {
          const unlocked = unlockedResult.value;
          cachedUnlockedRef.current = unlocked; // 캐시 저장
          setUnlockedSet(new Set((unlocked?.challengeIds || []).map(String)));
        } else {
          setUnlockedSet(new Set());
        }
      } catch (e) {
        console.error('Challenge data fetch error:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => { isMounted = false; };
  }, [currentPage]);

  const isSignatureProblem = (problem) =>
    problem?.isSignature === true || problem?.category === "SIGNATURE";

  const handleSignatureClick = async (e, problem) => {
    e.preventDefault();
    const cid = String(problem.challengeId);

    if (unlockedSet.has(cid)) {
      navigate(`/problem/${problem.challengeId}`);
      return;
    }

    try {
      const st = await fetchUnlockStatus(problem.challengeId);
      if (st?.unlocked) {
        setUnlockedSet((prev) => new Set([...prev, cid]));
        navigate(`/problem/${problem.challengeId}`);
        return;
      }
    } catch {}

    setSelectedProblem(problem);
    setSignatureInput("");
    setSubmitMsg("");
    setSignatureForm(true);
  };

  const onChangeSignature = (e) => {
    const onlyDigits = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setSignatureInput(onlyDigits);
  };

  const closeSignature = () => {
    setSignatureForm(false);
    setSelectedProblem(null);
    setSignatureInput("");
    setSubmitting(false);
    setSubmitMsg("");
  };

  const submitSignature = async () => {
    if (!selectedProblem) return;
    if (signatureInput.length !== 6) {
      setSubmitMsg("6자리 숫자를 입력하세요.");
      return;
    }
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const resp = await submitSignatureCode(selectedProblem.challengeId, signatureInput);
      setUnlockedSet((prev) => new Set([...prev, String(selectedProblem.challengeId)]));
      setSubmitMsg(resp?.message || "언락 성공! 이동합니다…");
      setTimeout(() => {
        closeSignature();
        navigate(`/problem/${selectedProblem.challengeId}`);
      }, 200);
    } catch (e) {
      const serverMsg = e?.response?.data?.message || e?.message || "제출 실패";
      setSubmitMsg(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="challenge-container">
        <Loading />
      </div>
    );
  }

  return (
    <div className="challenge-container">
      <div className="problem-grid">
        {problems.length > 0 ? (
          problems.map((problem) => {
            const solved = solvedChallenges.has(String(problem.challengeId));
            const isSignature = isSignatureProblem(problem);
            const unlocked = unlockedSet.has(String(problem.challengeId));

            return (
              <div key={problem.challengeId} className="problem-button-wrapper">
                <Link
                  to={isSignature ? (unlocked ? `/problem/${problem.challengeId}` : "#") : `/problem/${problem.challengeId}`}
                  className="problem-button"
                  onClick={(e) => {
                    if (isSignature && !unlocked) {
                      handleSignatureClick(e, problem);
                    }
                  }}
                >
                  <div className="button-wrapper">
                    <img
                      src={
                        solved
                          ? "/assets/Challenge/challenge_solved.svg"
                          : isSignature
                          ? "/assets/Challenge/signature_challenge.svg"
                          : "/assets/Challenge/challenge.svg"
                      }
                      alt={problem.title}
                    />
                    <img
                      src={categoryImages[problem.category] ?? categoryFallback}
                      alt={problem.category}
                      className="category-icon"
                    />
                    <div
                      className="button-title"
                      style={solved ? { color: "#00FF00" } : undefined}
                    >
                      {problem.title}
                    </div>
                    <div
                      className="button-score"
                      style={solved ? { color: "#00FF00" } : undefined}
                    >
                      {problem.points}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })
        ) : (
          <p style={{ color: "white", textAlign: "center", marginTop: "20px" }}>
            문제 목록을 불러오는 중...
          </p>
        )}
      </div>

      <div className="pagination">
        <button
          style={{ height: "5vh", margin: "10px" }}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          이전
        </button>
        <span>
          {currentPage + 1} / {totalPages}
        </span>
        <button
          style={{ height: "5vh", margin: "10px" }}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage + 1 >= totalPages}
        >
          다음
        </button>
      </div>

      {/* 시그니처 입력 모달 */}
      {signatureForm && (
        <div
          className="signature-modal"
          onClick={(e) => {
            if (e.target.classList.contains("signature-modal")) closeSignature();
          }}
        >
          <div className="signature-form">
            <h3>Signature Code</h3>
            <p className="signature-help">해당 문제 접근을 위한 6자리 코드를 입력하세요.</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="6자리 숫자"
              value={signatureInput}
              onChange={onChangeSignature}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitSignature();
                if (e.key === "Escape") closeSignature();
              }}
              autoFocus
            />
            <div className="signature-buttons">
              {/* 왼쪽: 취소 / 오른쪽: 제출 */}
              {/* ← 빨간색 스타일 적용 */}
              <button onClick={closeSignature} disabled={submitting}>취소</button>
              <button
                className="submit-btn"        
                onClick={submitSignature}
                disabled={submitting || signatureInput.length !== 6}
              >
                {submitting ? "제출 중…" : "제출"}
              </button>
            </div>
            {!!submitMsg && (
              <div className="signature-msg" style={{ marginTop: 8, color: "#ffb8b8" }}>
                {submitMsg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Challenge;
