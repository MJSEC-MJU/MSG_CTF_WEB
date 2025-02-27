import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchProblems } from "../api/ChallengeAllAPI"; // API 함수 import
import "./Challenge.css";

function Challenge() {
  const [problems, setProblems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadProblems = async () => {
      try {
        const problemData = await fetchProblems(currentPage);
        setProblems(problemData);
      } catch (error) {
        console.error("문제 데이터를 불러오는 중 오류 발생:", error);
      }
    };

    loadProblems();
  }, [currentPage]);

  return (
    <div className="challenge-container">
      <div className="problem-grid">
        {problems.length > 0 ? (
          problems.map((problem) => (
            <Link key={problem.challengeId} to={`/problem/${problem.challengeId}`} className="problem-button">
              <div className="button-wrapper">
                <img src={`/assets/meat-raw.png`} alt={problem.title} />
                <div className="button-title">{problem.title}</div>
                <div className="button-score">{problem.points}</div>
              </div>
            </Link>
          ))
        ) : (
          <p style={{ color: "white", textAlign: "center", marginTop: "20px" }}>문제 목록을 불러오는 중...</p>
        )}
      </div>

      {/* 페이지네이션 버튼 */}
      <div className="pagination">
        <button style={{height:"5vh",margin:"10px"}} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))} disabled={currentPage === 0}>
          이전
        </button>
        <span>{currentPage + 1} / {totalPages}</span>
        <button style={{height:"5vh",margin:"10px"}} onClick={() => setCurrentPage((prev) => prev + 1)} disabled={currentPage + 1 >= totalPages}>
          다음
        </button>
      </div>
    </div>
  );
}

export default Challenge;