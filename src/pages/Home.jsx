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
      {/* 히어로: 화면 한 뷰포트 높이, 스크롤 시 함께 이동 */}
      <section className="Hero" aria-label="hero">
        {/* 배경 트래페조이드 */}
        <div className="RightTrapezoidWrapper">
          <div className="RightTrapezoid" />
        </div>

        {/* 트래페조이드 중앙 위 캐러셀 */}
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
        <h1 className="Tag">
          SUPER
          <br />
          TASTY
        </h1>
      </section>

      {/* RULE 섹션: 전체 화면 꽉 채움 + 동일 크기의 반투명 오버레이 */}
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
    </div>
  );
}

export default Home;

