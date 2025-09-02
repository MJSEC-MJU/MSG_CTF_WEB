import React from 'react';
import './ProblemDetail.css';


const ProblemDetailMock = () => {
  const problem = {
    title: '[Ristorante] SQL al dente',
    description:
      '레스토랑 예약 백엔드의 주문 파라미터를 변조해 특정 메뉴의 가격을 0으로 만드는지 확인하세요.\n\n제한 사항\n- 관리자 페이지 접근 금지\n- Blind 방식 권장',
    solvers: 42,
    url: 'https://example.com/challenge',
    imageUrl: '/assets/hamburger.png',
    category: 'Web',
    difficulty: 3, // 0~5
  };

  const diffNum = (() => {
    const n = Math.round(Number(problem?.difficulty));
    return Number.isFinite(n) ? Math.max(0, Math.min(5, n)) : null;
  })();

  // mock용 제출 핸들러(실제 제출은 ProblemDetail에서)
  const handleMockSubmit = () => {
    alert('mock: 제출 동작 (실 서비스에서는 정답 검증 API 호출)');
  };

  return (
    <div className="pd-page">
      <div className="pd-hero">
        <img src={problem.imageUrl} alt="dish hero" className="pd-hero-img" />
        <div className="pd-hero-overlay" />
        <div className="pd-hero-content">
          {/* 별점 */}
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

          {/* 카테고리 배지(제목 아래) */}
          <div className="pd-hero-meta">
            <span className="pd-hero-badge pd-badge-difficulty">
              {problem?.category || 'Problem'}
            </span>
          </div>
        </div>
      </div>

      <div className="pd-container">
        <div className="pd-grid">
          {/* 좌측: 설명 + (Link 자리 → 플래그 제출) */}
          <section className="pd-card pd-main">
            <div className="pd-section pd-main-header">
              <div className="pd-solved">{problem.solvers}명이 해결함</div>
            </div>

            <div className="pd-section">
              <p className="pd-description">{problem.description}</p>
            </div>

            {/* ✅ Link 자리 → 플래그 제출 */}
            <div className="pd-section flag-submit">
              <input type="text" placeholder="FLAG 입력" />
              <button className="submit-btn" onClick={handleMockSubmit}>
                <b>제출</b>
              </button>
            </div>

            <div className="pd-section">
              <button className="back-btn" onClick={() => alert('mock: 뒤로 가기')}>
                <b>뒤로 가기</b>
              </button>
            </div>
          </section>

          {/* 우측: 제출 제한 + 파일 다운로드 + ✅ Link 버튼 */}
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
                className="pd-download"
                onClick={() => alert('mock: 파일 다운로드')}
                aria-label="파일 다운로드"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M3 14.5A1.5 1.5 0 0 0 4.5 16h11a1.5 1.5 0 0 0 1.5-1.5V12h-2v2h-10v-2H3v2.5zM10 3a1 1 0 0 1 1 1v6.586l1.293-1.293 1.414 1.414L10 14.414 6.293 10.707l1.414-1.414L9 10.586V4a1 1 0 0 1 1-1z" />
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

export default ProblemDetailMock;

