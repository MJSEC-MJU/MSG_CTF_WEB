import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProblemDetail } from '../api/ProblemDetailAPI';
import { submitFlag } from '../api/SubmitAPI';
import { downloadFile } from '../api/ProblemDownloadAPI';
import './ProblemDetail.css';

const ProblemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flag, setFlag] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadProblem = async () => {
      try {
        const problemData = await fetchProblemDetail(id);
        setProblem(problemData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProblem();
  }, [id]);

  const handleSubmit = async () => {
    if (isSubmitting || isCorrect) return;

    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1000);

    const result = await submitFlag(id, flag);
    console.log('API 응답:', result);

    if (result.data === 'Correct') {
      alert('정답입니다!');
      setIsCorrect(true);
    } else if (result.data === 'Wrong') {
      alert('오답입니다. 다시 시도해보세요!');
    } else if (result.data === 'Submitted') {
      alert('이미 정답을 제출했습니다!');
      setIsCorrect(true);
    } else if (result.data === 'Wait') {
      alert('30초 동안 제출할 수 없습니다!');
    } else if (result.error) {
      alert(result.error);
    }
  };

  if (loading) return <h1>로딩 중...</h1>;
  if (error) return <h1>{error}</h1>;

  return (
    <div className="problem-detail-container">
      <div className="problem-content">
        <h1 className="problem-title">{problem.title}</h1>
        <p className="problem-description">{problem.description}</p>
        <p className="solved-count">{problem.solvers}명이 해결함</p>

        <div className="button-group">
          <div className="link-btn-wrapper">
            <a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-btn"
            >
              <img src="/assets/link-btn1.png" alt="LINK" />
              <span className="link-btn-text">LINK</span>
            </a>
          </div>
          <button className="download-btn" onClick={() => downloadFile(id)}>
            <b>FILE</b>
          </button>
        </div>

        {/* Flag 제출 (정답 제출 시 숨김) */}
        {!isCorrect && (
          <div className="flag-submit">
            <input
              type="text"
              placeholder="FLAG 입력"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
            />
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              <b>제출</b>
            </button>
          </div>
        )}

        <button className="back-btn" onClick={() => navigate(-1)}>
          <b>뒤로 가기</b>
        </button>
      </div>
    </div>
  );
};

export default ProblemDetail;
