import { useState } from 'react';
import { Link } from "react-router-dom";
import "./Challenge.css"; 

const problems = [
  { id: 1, title: "문제 1", score: 100},
  { id: 2, title: "문제 2", score: 100 },
  { id: 3, title: "문제 3", score: 100 },
  { id: 4, title: "문제 4", score: 100 },
  { id: 5, title: "문제 5", score: 100 },
  { id: 6, title: "문제 6", score: 100 },
  { id: 7, title: "문제 7", score: 100 },
  { id: 8, title: "문제 8", score: 100 },
  { id: 9, title: "문제 9", score: 100 },
  { id: 10, title: "문제 10", score: 100 },
  { id: 11, title: "문제 11", score: 100 },
  { id: 12, title: "문제 12", score: 100 },
  { id: 13, title: "문제 13", score: 100 },
  { id: 14, title: "문제 14", score: 100 },
  { id: 15, title: "문제 15", score: 100 },
  { id: 16, title: "문제 16", score: 100 },
  { id: 17, title: "문제 17", score: 100 },
  { id: 18, title: "문제 18", score: 100 },
  { id: 19, title: "문제 19", score: 100 },
  { id: 20, title: "문제 20", score: 100 },
  { id: 21, title: "문제 21", score: 100 },
  { id: 22, title: "문제 22", score: 100 },
  { id: 23, title: "문제 23", score: 100 },
  { id: 24, title: "문제 24", score: 100 },
  { id: 25, title: "문제 25", score: 100 },
];

function Challenge() {
  return (
    <div className="challenge-container">
      <div className="problem-grid">
        {problems.map((problem) => (
          <Link key={problem.id} to={`/problem/${problem.id}`} className="problem-button">
            <div className="button-wrapper">
              <img src={`/assets/meat-raw.png`} alt={problem.title} />
              <div className="button-title">{problem.title}</div> 
              <div className="button-score">{problem.score}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Challenge;