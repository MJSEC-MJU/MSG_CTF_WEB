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

  // 새로 추가: 제출 피드백 상태 ('idle' | 'wrong')
  const [submitStatus, setSubmitStatus] = useState('idle');

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

    // localStorage에서 정답 여부 확인
    const storedCorrect = localStorage.getItem(`isCorrect-${id}`);
    if (storedCorrect === 'true') {
      setIsCorrect(true);
    }
  }, [id]);

  const handleSubmit = async () => {
    if (isSubmitting || isCorrect) return;

    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1000);

    // 제출 전에 이전 오류 라벨 초기화
    setSubmitStatus('idle');

    const result = await submitFlag(id, flag);

    if (result.data === 'Correct') {
      // 정답: 입력칸 대신 초록 라벨
      setIsCorrect(true);
      localStorage.setItem(`isCorrect-${id}`, 'true');
    } else if (result.data === 'Wrong') {
      // 오답: 입력칸 아래 빨간 라벨
      setSubmitStatus('wrong');
    } else if (result.data === 'Submitted') {
      // 이미 정답 제출: 입력칸 대신 초록 라벨
      setIsCorrect(true);
      localStorage.setItem(`isCorrect-${id}`, 'true');
    } else if (result.data === 'Wait') {
      alert('30초 동안 제출할 수 없습니다!');
    } else if (result.error) {
      alert(result.error);
    }
  };

  if (loading) return <h1>로딩 중...</h1>;
  if (error) return <h1>{error}</h1>;

  const heroImage = '/src/assets/Challenge/hamburger.svg'; 

  const diffNum = (() => {
    const n = Math.round(Number(problem?.difficulty));
    return Number.isFinite(n) ? Math.max(0, Math.min(5, n)) : null;
  })();

  return (
    <div className="pd-page">
      {/* 상단 히어로 (카테고리 배지) */}
      <div className="pd-hero">
        <img src={heroImage} alt="dish hero" className="pd-hero-img" />
        <div className="pd-hero-overlay" />
        <div className="pd-hero-content">
          {diffNum !== null && (
            <div className="pd-hero-stars" aria-label={`난이도 ${diffNum} / 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`pd-star ${i < diffNum ? 'filled' : 'empty'}`} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.5l3.09 6.26 6.91.99-5 4.86 1.18 6.89L12 18.77l-6.18 3.23 1.18-6.89-5-4.86 6.91-.99L12 2.5z" />
                </svg>
              ))}
              <span className="pd-hero-stars-text">{diffNum}/5</span>
            </div>
          )}

          <h1 className="pd-hero-title">{problem.title}</h1>

          <div className="pd-hero-meta">
            <span className="pd-hero-badge pd-badge-difficulty">
              {problem?.category || 'Problem'}
            </span>
          </div>
        </div>
      </div>

      {/* 본문: 좌측 메인 / 우측 사이드 */}
      <div className="pd-container">
        <div className="pd-grid">
          {/* 좌측: 설명 + 플래그 제출/라벨 + 뒤로가기 */}
          <section className="pd-card pd-main">
            <div className="pd-section pd-main-header">
              <div className="pd-solved">{problem.solvers}명이 해결함</div>
            </div>

            <div className="pd-section">
              <p className="pd-description">{problem.description}</p>
            </div>

            {/* 제출 영역 */}
            <div className="pd-section flag-submit">
              {isCorrect ? (
                <div className="pd-label success" role="status" aria-live="polite">
                  정답입니다!
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="FLAG 입력"
                    value={flag}
                    onChange={(e) => {
                      setFlag(e.target.value);
                      if (submitStatus !== 'idle') setSubmitStatus('idle'); // 타이핑 시작하면 오류 라벨 숨김
                    }}
                  />
                  <button
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                  >
                    <b>제출</b>
                  </button>
                  {submitStatus === 'wrong' && (
                    <div className="pd-label error" role="alert" aria-live="assertive">
                      오답입니다.
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="pd-section">
              <button className="back-btn" onClick={() => navigate(-1)}>
                <b>뒤로 가기</b>
              </button>
            </div>
          </section>

          {/* 우측: 제출 제한 + 파일 다운로드 + 링크 */}
          <aside className="pd-card pd-side">
            <div className="pd-section">
              <h3 className="pd-side-title">추가 정보</h3>
              <div className="pd-info">
                <div className="pd-info-label">제출 제한</div>
                <div className="pd-info-value">30초 쿨다운</div>
              </div>

              {problem?.url && (
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-btn-modern block"
                >
                  LINK
                </a>
              )}

              <button
                className="download-btn pd-download"
                onClick={() => downloadFile(id)}
                aria-label="파일 다운로드"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M3 14.5A1.5 1.5 0 0 0 4.5 16h11a1.5 1.5 0 0 0 1.5-1.5V12h-2v2h-10v-2H3v2.5zM10 3a1 1 0 0 1 1 1v6.586l1.293-1.293 1.414 1.414L10 14.414 6.293 10.707l1.414-1.414L9 10.586V4a 1 1 0 0 1 1-1z" />
                </svg>
                파일 다운로드
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;




