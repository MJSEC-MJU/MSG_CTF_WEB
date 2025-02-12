import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyPage.css"

const MyPage = () => {
  const navigate = useNavigate();

  // API 연동을 고려한 임시 데이터 (useState 활용)
  const [profile, setProfile] = useState({
    name: "NAME",
    rank: 1,
    points: 1000,
    avatarUrl: "/assets/profileSample.webp"
  });

  const [solved, setSolved] = useState([
    { id: "1", title: "Easy" },
    { id: "2", title: "Base" },
    { id: "3", title: "Simple" },
  ]);

  const [challenged, setChallenged] = useState([
    { id: "1", title: "Easy" },
    { id: "2", title: "Base" },
    { id: "3", title: "Simple" },
    { id: "4", title: "Hard" },
    { id: "5", title: "Very hard" },
  ]);

  return (
    <div className="mypage-container">
      {/* 프로필 영역 */}
      <div className="profile">
        <div className="avatar">
          <img src={profile.avatarUrl} alt="User Avatar" className="avatar-image" />
        </div>
        <h2>{profile.name}</h2>
        <p>Rank: #{profile.rank}</p>
        <p>{profile.points} Points</p>
      </div>

      {/* 문제 리스트 */}
      <div className="problems-section">
        <h3>Solved</h3>
        <div className="problems-box">
          {solved.map((problem) => (
            <span
              key={problem.id}
              className="problem-link"
              onClick={() => navigate(`/problem/${problem.id}`)}
            >
              {problem.title}
            </span>
          ))}
        </div>

        <h3>Challenged</h3>
        <div className="problems-box">
          {challenged.map((problem) => (
            <span
              key={problem.id}
              className="problem-link"
              onClick={() => navigate(`/problem/${problem.id}`)}
            >
              {problem.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPage;