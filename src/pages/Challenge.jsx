import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProblems } from "../api/ChallengeAllAPI"; // API 함수 import
import { fetchSolvedChallenges } from "../api/UserChallengeAPI";
import "./Challenge.css";

function Challenge() {
  const [problems, setProblems] = useState([]);
  const [solvedChallenges, setSolvedChallenges] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const categoryImages = {
    FORENSICS: "/assets/forensics.svg",
    CRYPTO: "/assets/crypto.svg",
    PWN: "/assets/pwn.svg",
    ANDROID: "/assets/android.svg",
    REV: "/assets/rev.svg",
    MISC: "/assets/misc.svg",
    WEB: "/assets/web.svg",
  };

  useEffect(() => {
    const loadProblems = async () => {
      try {
        const {problems,totalPages} = await fetchProblems(currentPage);
        setProblems(problems);
        setTotalPages(totalPages)
      } catch (error) {
        // console.error("문제 데이터를 불러오는 중 오류 발생:", error);
      }
    };
    const loadSolvedChallenges = async () => {
      try {
        const solvedData = await fetchSolvedChallenges();
        setSolvedChallenges(new Set(solvedData.map((solved) => String(solved.challengeId))));
      } catch (error) {
        // console.error("푼 문제 데이터를 불러오는 중 오류 발생:", error);
      }
    };

    loadProblems();
    loadSolvedChallenges();
  }, [currentPage]);

  return (
    <div className="challenge-container">
      <div className="problem-grid">
        {problems.length > 0 ? (
          problems.map((problem) => {
            const isSolved = solvedChallenges.has(String(problem.challengeId));
            return (
              <Link 
                key={problem.challengeId} 
                to={`/problem/${problem.challengeId}`} 
                className="problem-button"
              >
                <div className="button-wrapper">
                  <img 
                    src={isSolved ? "/assets/meat-cook.svg" : "/assets/meat-raw.svg"} 
                    alt={problem.title} 
                  />
                  <img 
                    src={categoryImages[problem.category] || categoryImages.default} 
                    alt={problem.category} 
                    className="category-icon"
                  />
                  <div className="button-title" style={isSolved ? { color: "#00FF00" } : {}}>
                    {problem.title}
                  </div>
                  <div className="button-score" style={isSolved ? { color: "#00FF00" } : {}}>
                    {problem.points}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <p style={{ color: "white", textAlign: "center", marginTop: "20px" }}>문제 목록을 불러오는 중...</p>
        )}
      </div>

      {/* 페이지네이션 버튼 */}
      <div className="pagination">
        <button 
          style={{ height: "5vh", margin: "10px" }}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))} 
          disabled={currentPage === 0}
        >
          이전
        </button>
        <span>{currentPage + 1} / {totalPages}</span>
        <button 
          style={{ height: "5vh", margin: "10px" }}
          onClick={() => setCurrentPage((prev) => prev + 1)} 
          disabled={currentPage + 1 >= totalPages}
        >
          다음
        </button>
      </div>
    </div>
  );
}

export default Challenge;