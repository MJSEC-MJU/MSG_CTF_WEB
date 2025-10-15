import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // 이동을 위해 추가
import { fetchProblems } from "../api/ChallengeAllAPI";
import { fetchSolvedChallenges } from "../api/UserChallengeAPI";
import {
  fetchUnlockedList,       // GET /api/signature/unlocked
  fetchUnlockStatus,       // GET /api/signature/:id/status
  submitSignatureCode,     // POST /api/signature/:id/check
} from "../api/SignatureAPI";
import "./Challenge.css";

function Challenge() {
  // 문제/페이지네이션
  const [problems, setProblems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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

  const categoryImages = {
    FORENSICS: "/assets/forensics.svg",
    CRYPTO: "/assets/crypto.svg",
    PWN: "/assets/pwn.svg",
    ANDROID: "/assets/android.svg",
    REV: "/assets/rev.svg",
    MISC: "/assets/misc.svg",
    WEB: "/assets/web.svg",
    SIGNATURE: "/assets/signature.svg",
  };
  const categoryFallback = "/assets/misc.svg";

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { problems, totalPages } = await fetchProblems(currentPage);
        if (!isMounted) return;
        setProblems(problems);
        setTotalPages(totalPages);
      } catch (e) {
        console.error(e);
      }
    })();

    (async () => {
      try {
        const solvedData = await fetchSolvedChallenges();
        if (!isMounted) return;
        setSolvedChallenges(new Set(solvedData.map((s) => String(s.challengeId))));
      } catch {
        if (!isMounted) return;
        setSolvedChallenges(new Set());
      }
    })();

    (async () => {
      try {
        const unlocked = await fetchUnlockedList(); // { teamId, challengeIds }
        if (!isMounted) return;
        setUnlockedSet(new Set((unlocked?.challengeIds || []).map(String)));
      } catch {
        if (!isMounted) return;
        setUnlockedSet(new Set());
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
                          ? "/assets/meat-cook.svg"
                          : isSignature
                          ? "/assets/signature_challenge.svg"
                          : "/assets/challenge.svg"
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
