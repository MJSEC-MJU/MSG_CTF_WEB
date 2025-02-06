import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProblemDetail.css";
// 문제 리스트 (예제 데이터)
const problems = [
  { id: "1", title: "첫 번째 문제", description: "이 문제는...", solvedCount: 0, link: "https://example.com", file: "/assets/sample1.zip" },
  { id: "2", title: "두 번째 문제", description: "이 문제는...", solvedCount: 0, link: "https://example.com", file: "/assets/sample2.zip" },
  { id: "3", title: "세 번째 문제", description: "이 문제는...", solvedCount: 0, link: "https://example.com", file: "/assets/sample3.zip" },
  // 추가 문제 데이터...
];

const ProblemDetail = () => {
  const { id } = useParams(); // URL에서 id 가져오기
  const navigate = useNavigate();

  // 문제 찾기
  const problem = problems.find((p) => p.id === id);

  // 없는 문제일 경우 예외 처리
  if (!problem) {
    return <h1>문제를 찾을 수 없습니다.</h1>;
  }

  return (
    <div className="problem-detail-container">
      {/* 배경이 되는 식빵 이미지 */}
      <div className="problem-content">
        <h1 className="problem-title">{problem.title}</h1>
        <p className="problem-description">{problem.description}</p>
        <p className="solved-count">{problem.solvedCount}명이 해결함</p>

        {/* 버튼 그룹 */}
        <div className="button-group">
          <div className="link-btn-wrapper">
            <a href={problem.link} target="_blank" rel="noopener noreferrer" className="link-btn">
              <img src="/assets/link-btn1.png" alt="LINK" />
              <span className="link-btn-text">LINK</span>
            </a>
          </div>
          <a href={problem.file} download>
            <button className="download-btn"><b>FILE</b></button>
          </a>
        </div>

        {/* Flag 제출 */}
        <div className="flag-submit">
          <input type="text" placeholder="FLAG 입력" />
          <button className="submit-btn"><b>제출</b></button>
        </div>

        {/* 뒤로 가기 버튼 */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <b>뒤로 가기</b>
        </button>
      </div>
    </div>
  );
};

export default ProblemDetail;