import { useState, useEffect, useRef } from 'react';
import './Home.css';

function Home() {
  const images = ['/assets/BOF.svg','/assets/shellad.svg', '/assets/hashBrown.svg'];
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  const go = (i) => setIdx(i);

  // 자동 슬라이드: 3초, 탭 비활성/호버/포커스 시 일시정지
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
            <div
              className="CarouselSlide"
              key={src}
              aria-hidden={i !== idx}
            >
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
              onClick={() => {
                setPaused(true);
                go(i);
              }}
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
    </div>
  );
}

export default Home;
