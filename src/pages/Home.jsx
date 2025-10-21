import { useState, useEffect, useRef } from 'react';
import './Home.css';

function Home() {
  const images = ['/src/assets/HomePage/BOF.svg','/src/assets/HomePage/shellad.svg', '/src/assets/HomePage/hashBrown.svg'];
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  const go = (i) => setIdx(i);
  const cards = [
    {
      img: '/src/assets/HomePage/card1.svg',
      title: 'MSG CTF의 시작',
      desc: '명지대학교의 Mjsec, 건국대학교의 seKurity, 세종대학교의 SSG 세 학교가 연합하여 "음식점" 이라는 컨셉의 CTF를 \n 2024년에 개최하였습니다.'
    },
    {
      img: '/src/assets/HomePage/card2.svg',
      title: '시그니처 문제를 풀어보세요',
      desc: '각 대학교 부스에서 시그니처 문제를 해금하고 \n 추가점수를 획득해보세요!'
    },
    {
      img: '/src/assets/HomePage/card3.svg',
      title: '마일리지를 쌓아보세요',
      desc: '문제를 풀고 오프라인샵에서 쓸 수 있는 \n 마일리지를 획득해보세요!'
    }
  ];

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
            아래 규칙을 준수하여 플레이해주세요. 공정하고 즐거운 환경 유지를 위한 약속입니다.
          </p>
          <ul className="RuleList">
            <li> 플래그 형식은<strong>MSG&#123; &#125;</strong>입니다.</li>
            <li>제출이 틀렸을 경우 패널티가 부여됩니다. (3회 이상 틀릴 경우 추가 시간패널티)</li>
            <li>Dos 공격은 절대 금지입니다.</li>
            <li>다른 팀과 문제 힌트/풀이 공유 금지(대회 종료 전)</li>
          </ul>
        </div>
      </section>

      {/* 행 단위 스크롤 타이포그래피 */}
      <TypeRowsSection rows={30} phrase="MSG CTF " repeatX={14} stepVH={70} cards={cards}/>
    </div>
  );
}

/** 행 단위 스크롤 타이포그래피 */
function TypeRowsSection({
  rows = 30,
  phrase = 'MSG CTF ',
  repeatX = 14,
  stepVH = 70,
  cards = []                // ← 추가
}) {
  const sectionRef = useRef(null);
  const rowRefs = useRef([]);
  const cardRefs = useRef([]); // ← 추가

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

  // 스크롤 진행도 → 행 등장 제어 (기존 로직)
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let ticking = false;

    const update = () => {
      const rectTop = el.getBoundingClientRect().top + window.scrollY;
      const vh = window.innerHeight;
      const height = el.offsetHeight;
      const y = window.scrollY || window.pageYOffset;

      const denom = Math.max(height - vh, 1);
      const p = Math.min(Math.max((y - rectTop) / denom, 0), 1);

      for (let r = 0; r < rowRefs.current.length; r++) {
        const t = p * rows - r;
        const o = Math.max(0, Math.min(1, t * 1.4));
        const f = Math.max(0, Math.min(1, (t - 0.35) * 1.3));
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

  // 카드 등장: IntersectionObserver로 순차 노출
  useEffect(() => {
    if (!cardRefs.current.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -30% 0px', // 하단 여유
        threshold: 0.5
      }
    );

    cardRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [cards]);

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
        {/* 카드 레일: 세로 스크롤하며 하나씩 등장 */}
        <div className="CardRail" aria-label="정보 카드 목록">
          {cards.map((c, i) => (
            <article
              key={i}
              ref={(el) => (cardRefs.current[i] = el)}
              className="InfoCard"
              style={{ '--delay': `${i * 80}ms` }} // 약한 계단식 지연
            >
              <div className="CardImageWrap">
                <img src={c.img} alt={c.title} />
              </div>
              <div className="CardBody">
                <h3 className="CardTitle">{c.title}</h3>
                <p className="CardDesc">{c.desc}</p>
              </div>
            </article>
          ))}
        </div>

        {/* 기존 타이포(행) */}
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
                  <div className="RowLine RowOutline">
                    {wordRow.map((__, i) => (
                      <span className="Word" key={`o-${r}-${i}`}>{phrase}</span>
                    ))}
                  </div>
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


