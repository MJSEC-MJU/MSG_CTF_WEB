import { useState } from 'react';
import { Link } from "react-router-dom";
import "./Challenge.css"; 

const problems = [
  { id: 1, title: "문제 1" },
  { id: 2, title: "문제 2" },
  { id: 3, title: "문제 3" },
  { id: 4, title: "문제 4" },
  { id: 5, title: "문제 5" },
  { id: 6, title: "문제 6" },
  { id: 7, title: "문제 7" },
  { id: 8, title: "문제 8" },
  { id: 9, title: "문제 9" },
  { id: 10, title: "문제 10" },
  { id: 11, title: "문제 11" },
  { id: 12, title: "문제 12" },
];

function Challenge() {
  return (
    <div className="challenge-container">
      <div className="problem-grid">
        {problems.map((problem) => (
          <Link key={problem.id} to={`/problem/${problem.id}`} className="problem-button">
            <div className="button-wrapper">
              <img src={`/assets/meat-raw.png`} alt={problem.title} />
              <span className="button-text">{problem.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Challenge;