import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProblems } from "../api/ChallengeAllAPI";
import { fetchSolvedChallenges } from "../api/UserChallengeAPI";
// import { SignatureModal } from "../components/SignatureModal";
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

  useEffect(() => {
    const loadProblems = async () => {
      try {
        const { problems, totalPages } = await fetchProblems(currentPage);
        setProblems(problems);
        setTotalPages(totalPages);
      } catch (error) {
        // console.error("문제 데이터를 불러오는 중 오류 발생:", error);
      }
    };

    const loadSolvedChallenges = async () => {
      try {
        const solvedData = await fetchSolvedChallenges();
        setSolvedChallenges(
          new Set(solvedData.map((solved) => String(solved.challengeId)))
        );
      } catch (error) {
        // console.error("푼 문제 데이터를 불러오는 중 오류 발생:", error);
      }
    };

    loadProblems();
    loadSolvedChallenges();
  }, [currentPage]);

  return (
    <div className="challenge-container">
      {/* 문제 그리드 */}
      <div className="problem-grid">
        {problems.length > 0 ? (
          problems.map((problem) => {
            const isSolved = solvedChallenges.has(
              String(problem.challengeId)
            );
            const isSignature = problem.isSignature === true;

            return (
              <div
                key={problem.challengeId}
                className="problem-button-wrapper"
              >
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
                      src={categoryImages[problem.category] || categoryImages.default}
                      alt={problem.category}
                      className="category-icon"
                    />
                    <div
                      className="button-title"
                      style={isSolved ? { color: "#00FF00" } : {}}
                    >
                      {problem.title}
                    </div>
                    <div
                      className="button-score"
                      style={isSolved ? { color: "#00FF00" } : {}}
                    >
                      {problem.points}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })
        ) : (
          <p
            style={{
              color: "white",
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            문제 목록을 불러오는 중...
          </p>
        )}
      </div>

      {/* 페이지네이션 */}
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

      {/* Signature Form Modal */}
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
            {/* {signatureError && <p style={{ color: 'red', fontSize: '12px' }}>{signatureError}</p>} */}
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
