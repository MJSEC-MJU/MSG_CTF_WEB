import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProblems } from "../api/ChallengeAllAPI";
import { fetchSolvedChallenges } from "../api/UserChallengeAPI";
import "./Challenge.css";

function Challenge() {
  const [problems, setProblems] = useState([]);
  const [solvedChallenges, setSolvedChallenges] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [signatureForm, setSignatureForm] = useState(false);
  const [signatureInput, setSignatureInput] = useState("");

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
      const { problems, totalPages } = await fetchProblems(currentPage);
      if (isMounted) {
        setProblems(problems);
        setTotalPages(totalPages);
      }
    })();

    (async () => {
      try {
        const solvedData = await fetchSolvedChallenges();
        if (isMounted) {
          setSolvedChallenges(
            new Set(solvedData.map((s) => String(s.challengeId)))
          );
        }
      } catch {
        if (isMounted) setSolvedChallenges(new Set());
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  return (
    <div className="challenge-container">
      <div className="problem-grid">
        {problems.length > 0 ? (
          problems.map((problem) => {
            const isSolved = solvedChallenges.has(String(problem.challengeId));

            const isSignature =
              problem.isSignature === true || problem.category === "SIGNATURE";

            return (
              <div key={problem.challengeId} className="problem-button-wrapper">
                <Link
                  to={isSignature ? "#" : `/problem/${problem.challengeId}`}
                  className="problem-button"
                  onClick={(e) => {
                    if (isSignature) {
                      e.preventDefault();
                      setSignatureForm(true);
                    }
                  }}
                >
                  <div className="button-wrapper">
                    <img
                      src={
                        isSolved
                          ? "/assets/meat-cook.svg"
                          : isSignature
                          ? "/assets/signature_challenge.svg"
                          : "/assets/challenge.svg"
                      }
                      alt={problem.title}
                    />
                    <img
                      src={
                        categoryImages[problem.category] ?? categoryFallback
                      }
                      alt={problem.category}
                      className="category-icon"
                    />
                    <div
                      className="button-title"
                      style={isSolved ? { color: "#00FF00" } : undefined}
                    >
                      {problem.title}
                    </div>
                    <div
                      className="button-score"
                      style={isSolved ? { color: "#00FF00" } : undefined}
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

      {signatureForm && (
        <div className="signature-modal">
          <div className="signature-form">
            <h3>Signature Code</h3>
            <input
              type="text"
              placeholder="Signature Code"
              value={signatureInput}
              onChange={(e) => setSignatureInput(e.target.value)}
            />
            <div className="signature-buttons">
              <button>제출</button>
              <button onClick={() => setSignatureForm(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Challenge;
