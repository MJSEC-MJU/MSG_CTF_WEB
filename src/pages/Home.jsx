import { useState, useEffect, useRef } from 'react';
import './Home.css';

function Home() {
  const images = ['/assets/BOF.svg','/assets/shellad.svg', '/assets/hashBrown.svg'];
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  const go = (i) => setIdx(i);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (!paused) {
      intervalRef.current = setInterval(() => {
        setIdx((i) => (i + 1) % images.length);
      }, 3000);
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [paused, images.length]);

  return (
    <div className="HomeWrapper">
      {/* 히어로 */}
      <section className="Hero" aria-label="hero">
        {/* 배경 트래페조이드 */}
        <div className="RightTrapezoid2Wrapper">
          <div className="RightTrapezoid2" />
        </div>

        {/* 캐러셀 */}
        <div
          className="CarouselWrapper"
          aria-roledescription="carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            className="CarouselTrack"
            style={{ transform: `translateX(-${idx * 100}%)` }}
          >
            {images.map((src, i) => (
              <div className="CarouselSlide" key={src} aria-hidden={i !== idx}>
                <img className="CarouselImage" src={src} alt={`slide-${i + 1}`} />
              </div>
            ))}
          </div>

          {/* 인디케이터 */}
          <div className="CarouselDots" role="tablist" aria-label="슬라이드 선택">
            {images.map((_, i) => (
              <button
                key={i}
                className={`Dot ${i === idx ? 'active' : ''}`}
                onClick={() => { setPaused(true); go(i); }}
                role="tab"
                aria-selected={i === idx}
                aria-label={`${i + 1}번 슬라이드`}
              />
            ))}
          </div>
        </div>

        {/* 타이틀 */}
        <h1 className="Tag2">
          SUPER
          <br />
          TASTY
        </h1>
      </section>

      {/* RULE 섹션 */}
      <section className="RuleSection" aria-labelledby="rule-title">
        <div className="RuleInner">
          <h1 id="rule-title">RULE</h1>
          <p className="RuleLead">
            아래 규칙을 준수하여 플레이해 주십시오. 공정하고 즐거운 환경 유지를 위한 약속입니다.
          </p>
          <ul className="RuleList">
            <li>비인가 자동화/봇 사용 금지</li>
            <li>취약점은 공개 전 운영팀에 사전 공유</li>
            <li>타 참가자 진행 방해 및 데이터 삭제/변조 금지</li>
            <li>문제 힌트/풀이 공유 금지(대회 종료 전)</li>
          </ul>
        </div>
      </section>

      {/* 행 단위 스크롤 타이포그래피 */}
      <TypeRowsSection rows={20} phrase="MSG CTF " repeatX={14} stepVH={70} />
    </div>
  );
}

/** 행 단위 스크롤 타이포그래피 */
function TypeRowsSection({ rows = 20, phrase = 'MSG CTF ', repeatX = 14, stepVH = 70 }) {
  const sectionRef = useRef(null);
  const rowRefs = useRef([]);

  // 실제 뷰포트 보정(--vh)
  useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let ticking = false;

    const update = () => {
      const rectTop = el.getBoundingClientRect().top + window.scrollY;
      const vh = window.innerHeight;
      const height = el.offsetHeight;
      const y = window.scrollY || window.pageYOffset;

      // 0~1 진행도
      const denom = Math.max(height - vh, 1);
      const p = Math.min(Math.max((y - rectTop) / denom, 0), 1);

      // 각 행 순차 등장: 아웃라인(o) 먼저, 채움(f)은 약간 지연
      for (let r = 0; r < rowRefs.current.length; r++) {
        const t = p * rows - r;               // r행의 진행도 기반
        const o = Math.max(0, Math.min(1, t * 1.4));            // outline opacity
        const f = Math.max(0, Math.min(1, (t - 0.35) * 1.3));   // fill opacity(지연 시작)

        const rowEl = rowRefs.current[r];
        if (rowEl) {
          rowEl.style.setProperty('--o', o.toFixed(4));
          rowEl.style.setProperty('--f', f.toFixed(4));
        }
      }
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, [rows]);

  const rowArray = Array.from({ length: rows });
  const wordRow = Array.from({ length: repeatX });

  return (
    <section
      className="TypeRowsSection"
      ref={sectionRef}
      style={{ '--rows': rows, '--step': `${stepVH}vh` }}
      aria-label="typography-rows-scroll"
    >
      <div className="TypeRowsSticky">
        <div className="Rows">
          {rowArray.map((_, r) => (
            <div
              className="Row"
              key={r}
              ref={(el) => (rowRefs.current[r] = el)}
              style={{ '--o': 0, '--f': 0 }}
            >
              <div className="RowViewport">
                <div className="RowStack">
                  {/* 아웃라인: 처음엔 보이지 않음(opacity: --o) */}
                  <div className="RowLine RowOutline">
                    {wordRow.map((__, i) => (
                      <span className="Word" key={`o-${r}-${i}`}>{phrase}</span>
                    ))}
                  </div>
                  {/* 채움: 아웃라인 후 지연 등장(opacity: --f) */}
                  <div className="RowLine RowFill" aria-hidden="true">
                    {wordRow.map((__, i) => (
                      <span className="Word" key={`f-${r}-${i}`}>{phrase}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;


