import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProblemDetail } from '../api/ProblemDetailAPI';
import { submitFlag } from '../api/SubmitAPI';
import { downloadFile } from '../api/ProblemDownloadAPI';
import './ProblemDetail.css';
import heroImg from '/src/assets/Challenge/hamburger.webp';

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
  const [copiedBasicConn, setCopiedBasicConn] = useState(false);
  const [copiedConnKey, setCopiedConnKey] = useState('');
  const [copiedBasicUrl, setCopiedBasicUrl] = useState(false);
  const [copiedUrlKey, setCopiedUrlKey] = useState('');
  const descRef = React.useRef(null);
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);
  const [descCanScroll, setDescCanScroll] = useState(false);
  const [hintOpacity, setHintOpacity] = useState(0);

  const copyText = async (text, onSuccess) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(text));
      } else {
        const ta = document.createElement('textarea');
        ta.value = String(text);
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      onSuccess && onSuccess();
    } catch (_) {
      onSuccess && onSuccess();
    }
  };

  // ===== Utilities for separator + link cards =====
  const extractHttpLinks = (text) => {
    if (!text) return [];
    const regex = /(https?:\/\/[^\s)]+)(?=[)\s]|$)/g;
    const matches = String(text).match(regex) || [];
    const cleaned = matches.map((m) => m.replace(/[\]\)\}>.,;]+$/g, ''));
    const seen = new Set();
    const unique = [];
    for (const url of cleaned) {
      const key = url.replace(/\/$/, '').toLowerCase();
      if (!seen.has(key)) { seen.add(key); unique.push(url); }
    }
    return unique;
  };

  const isDownloadService = (url) => {
    try {
      const { hostname } = new URL(url);
      return [
        'drive.google.com', 'docs.google.com', 'dropbox.com',
        'dropboxusercontent.com', 'mega.nz', 'mediafire.com', 'gofile.io',
      ].some((h) => hostname.endsWith(h));
    } catch { return false; }
  };

  const parseLinkCards = (text) => {
    if (!text) return [];
    const lines = String(text).split(/\r?\n/);
    const results = [];
    const clean = (u) => (u || '').replace(/[\]\)\}>.,;]+$/g, '');
    for (const raw of lines) {
      const line = String(raw).trim();
      if (!line) continue;
      let m;
      // 접속 정보: nc/telnet (라벨 유무 허용)
      m = line.match(/^\s*(?:접속|connection|conn)?\s*[:：]?\s*((?:nc|telnet)\s+[^\s]+\s+\d+.*)\s*$/i);
      if (m) { results.push({ label: '접속', cmd: m[1].trim(), type: 'connect' }); continue; }
      m = line.match(/^\s*(다운로드|download)\s*[:：]\s*(https?:\/\/\S+)/i);
      if (m) { results.push({ label: m[1].trim(), url: clean(m[2]), type: 'download' }); continue; }
      m = line.match(/^\s*(링크|link|url)\s*[:：]\s*(https?:\/\/\S+)/i);
      if (m) { results.push({ label: m[1].trim(), url: clean(m[2]), type: 'link' }); continue; }
      m = line.match(/^\s*([^:：\n]{1,50})\s*[:：]\s*(.+)$/);
      if (m) {
        const urlMatch = m[2].match(/https?:\/\/\S+/);
        if (urlMatch) {
          const url = clean(urlMatch[0]);
          const label = m[1].trim();
          let type = /(다운로드|download)/i.test(m[1]) || /(다운로드|download)/i.test(m[2]) ? 'download' : 'link';
          if (type === 'link' && isDownloadService(url)) type = 'download';
          results.push({ label, url, type });
        }
      }
    }
    // de-dup: handle both URL and connect commands, keep last occurrence
    const seen = new Set();
    const deduped = [];
    for (let i = results.length - 1; i >= 0; i--) {
      const r = results[i];
      let key = '';
      if (r?.type === 'connect' && r?.cmd) {
        key = `conn:${String(r.cmd).trim().toLowerCase()}`;
      } else if (r?.url) {
        try {
          // Normalize by lowercasing and trimming trailing slash
          key = String(r.url).replace(/\/$/, '').toLowerCase();
        } catch {
          key = String(r.url || '').toLowerCase();
        }
      } else {
        // Fallback to JSON signature to avoid crashing
        key = `other:${JSON.stringify(r)}`;
      }
      if (!seen.has(key)) { seen.add(key); deduped.unshift(r); }
    }
    return deduped;
  };

  const splitBySeparator = (text) => {
    const src = String(text || '');
    const parts = src.split(/\r?\n\s*-{6,}\s*\r?\n/);
    if (parts.length >= 2) return { top: parts[0], bottom: parts.slice(1).join('\n'), hasSeparator: true };
    return { top: src, bottom: '', hasSeparator: false };
  };

  const detectCardLine = (raw) => {
    const line = String(raw || '').trim();
    if (!line) return null;
    let m;
    m = line.match(/^\s*(?:접속|connection|conn)?\s*[:：]?\s*((?:nc|telnet)\s+[^\s]+\s+\d+.*)\s*$/i);
    if (m) return { label: '접속', cmd: m[1], type: 'connect' };
    m = line.match(/^\s*(다운로드|download)\s*[:：]\s*(https?:\/\/\S+)/i);
    if (m) return { label: m[1].trim(), url: m[2], type: 'download' };
    m = line.match(/^\s*(링크|link|url)\s*[:：]\s*(https?:\/\/\S+)/i);
    if (m) return { label: m[1].trim(), url: m[2], type: 'link' };
    m = line.match(/^\s*([^:：\n]{1,50})\s*[:：]\s*(.+)$/);
    if (m) {
      const urlMatch = m[2].match(/https?:\/\/\S+/);
      if (urlMatch) {
        const url = urlMatch[0];
        let type = /(다운로드|download)/i.test(m[1]) || /(다운로드|download)/i.test(m[2]) ? 'download' : 'link';
        return { label: m[1].trim(), url, type };
      }
    }
    return null;
  };

  const stripCardLines = (text) => {
    const src = String(text || '');
    const lines = src.split(/\r?\n/);
    const kept = lines.filter((ln) => !detectCardLine(ln));
    return kept.join('\n');
  };

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

  // Update fade indicators for description scroll area
  const updateFades = React.useCallback(() => {
    const el = descRef.current;
    if (!el) return;
    const canScroll = (el.scrollHeight - el.clientHeight) > 1;
    const atTop = el.scrollTop <= 1;
    const atBottom = (el.scrollTop + el.clientHeight) >= (el.scrollHeight - 1);
    setFadeTop(!atTop && canScroll);
    setFadeBottom(!atBottom && canScroll);
    setDescCanScroll(canScroll);
    if (canScroll) {
      const denom = Math.max(1, el.scrollHeight - el.clientHeight);
      const progress = Math.min(1, Math.max(0, el.scrollTop / denom));
      setHintOpacity(Math.max(0, 1 - progress * 1.2));
    } else {
      // 설명이 스크롤 불가할 때는 안내를 선명하게 보여주고, 페이지 스크롤에 따라 서서히 감쇠
      setHintOpacity(1);
    }
  }, []);

  useEffect(() => {
    // Recompute fades when content or window size changes
    updateFades();
    const onResize = () => updateFades();
    window.addEventListener('resize', onResize);
    const onWindowScroll = () => {
      if (descCanScroll) return; // handled by description scroll
      const doc = document.documentElement;
      const denom = Math.max(1, doc.scrollHeight - doc.clientHeight);
      const progress = Math.min(1, Math.max(0, doc.scrollTop / denom));
      setHintOpacity(Math.max(0, 1 - progress * 1.2));
    };
    window.addEventListener('scroll', onWindowScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onWindowScroll);
    };
  }, [problem, updateFades, descCanScroll]);

  const handleSubmit = async () => {
    if (isSubmitting || isCorrect) return;

    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1000);

    // 제출 전에 이전 오류 라벨 초기화
    setSubmitStatus('idle');

    const result = await submitFlag(id, flag);

    if (result.code === 'EARLY_EXIT_USER') {
      alert('조기 퇴소자는 문제를 제출할 수 없습니다.');
      return;
    }

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

  const heroImage = heroImg; 

  const diffNum = (() => {
    const n = Math.round(Number(problem?.difficulty));
    return Number.isFinite(n) ? Math.max(0, Math.min(5, n)) : null;
  })();

  return (
    <div className="pd-page">
      {/* 상단 히어로 (카테고리 배지) */}
      <div className="pd-hero">
        <img src={heroImg} alt="dish hero" className="pd-hero-img" />
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

      {/* 본문: 단일 컬럼 레이아웃 (추가정보 사이드 제거) */}
      <div className="pd-container">
        <div className="pd-grid">
        <section className="pd-card pd-main">
          <div className="pd-section pd-main-header">
            <div className="pd-solved-badge" role="status" aria-label={`해결 팀 ${Number(problem.solvers) || 0}팀`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17 3H7v4H4v3c0 2.485 1.79 4.56 4.14 4.93A6.003 6.003 0 0 0 11 18.92V21H8v2h8v-2h-3v-2.08a6.003 6.003 0 0 0 2.86-3.99C18.21 14.56 20 12.485 20 10V7h-3V3zm-8 2h6v2H9V5zm11 4c0 1.654-1.346 3-3 3h-1V8h4v1zM8 12c-1.654 0-3-1.346-3-3V8h4v4H8z"/>
              </svg>
              <span><b>{Number(problem.solvers) || 0}팀</b> 해결</span>
            </div>
          </div>

          <div className="pd-section">
            {(() => {
              const fullDesc = String(problem?.description || '');
              const { top, bottom, hasSeparator } = splitBySeparator(fullDesc);
              // Parse links/cards across the entire description so extras above/below separator are captured
              const linkCardsAll = parseLinkCards(fullDesc);
              const descLinksAll = extractHttpLinks(fullDesc);
              const norm = (u) => (u || '').replace(/\/$/, '').toLowerCase();

              // 기본정보 카드에 포함할 항목 계산
              const hasFileAttachment = problem?.hasFile === true;
              const officialUrl = problem?.url;
              let movedDownloadUrl = null;
              let movedConnCmd = null;
              if (!hasFileAttachment) {
                const dlFromCards = linkCardsAll.find((c) => c.type === 'download');
                if (dlFromCards) movedDownloadUrl = dlFromCards.url;
                else {
                  const dlFromLinks = descLinksAll.find((u) => isDownloadService(u));
                  if (dlFromLinks) movedDownloadUrl = dlFromLinks;
                }
              }
              // 접속 정보는 항상 상단 카드로 승격 (있다면)
              const connFromCards = linkCardsAll.find((c) => c.type === 'connect');
              if (connFromCards) movedConnCmd = connFromCards.cmd;

              // 공식 URL/이동된 다운로드를 하단 카드/요약에서 제거
              const linkCards = linkCardsAll.filter((c) => {
                if (c.type === 'connect') return !movedConnCmd || c.cmd !== movedConnCmd;
                return (!officialUrl || norm(c.url) !== norm(officialUrl)) && (!movedDownloadUrl || norm(c.url) !== norm(movedDownloadUrl));
              });
              const descLinks = descLinksAll.filter(
                (u) => !linkCardsAll.some((c) => norm(c.url) === norm(u)) && (!officialUrl || norm(u) !== norm(officialUrl)) && (!movedDownloadUrl || norm(u) !== norm(movedDownloadUrl))
              );
              const showBasicInfoCard = Boolean((officialUrl && String(officialUrl).trim() !== '') || hasFileAttachment || movedDownloadUrl || movedConnCmd);
              // Hide link-like lines from the visible description
              const displayText = hasSeparator ? stripCardLines(top) : stripCardLines(fullDesc);

              const extrasExist = (linkCards.length > 0 || descLinks.length > 0);

              return (
                <>
                  <div className="pd-description-wrap">
                    <p
                      ref={descRef}
                      className="pd-description"
                      onScroll={updateFades}
                    >
                      {displayText}
                    </p>
                    <span className={`pd-fade-top ${fadeTop ? 'visible' : ''}`} aria-hidden="true" />
                    <span className={`pd-fade-bottom ${fadeBottom ? 'visible' : ''}`} aria-hidden="true" />
                  </div>

                  {/* Global scroll hint anchored to card bottom */}
                  {extrasExist && (
                    <div
                      className={`pd-scroll-hint ${(fadeBottom || !descCanScroll) ? 'visible' : ''}`}
                      aria-hidden="true"
                      style={{ opacity: (fadeBottom || !descCanScroll) ? hintOpacity : 0 }}
                    >
                      <div className="pd-hint-text">아래로 스크롤하면 추가로 증설한 링크/서버 정보가 있어요</div>
                    </div>
                  )}

                  {/* 기본 정보 카드 (부각) */}
                  {showBasicInfoCard && (
                    <div className="pd-info primary" role="region" aria-label="문제 기본 정보" style={{ marginTop: 16 }}>
                      <div className="pd-primary-header">
                        <div className="pd-primary-title">기본 정보</div>
                        <div className="pd-primary-badge">제출 제한 · 30초</div>
                      </div>

                      {officialUrl && (
                        (() => {
                          const isHttp = /^https?:\/\//i.test(String(officialUrl));
                          return isHttp ? (
                            <div className="pd-inline-link" style={{ marginTop: 6, alignItems: 'center' }}>
                              <span className="pd-inline-link-label">🔗</span>
                              <a href={officialUrl} target="_blank" rel="noopener noreferrer">{officialUrl}</a>
                              <button
                                className="copy-btn"
                                onClick={() => copyText(officialUrl, () => { setCopiedBasicUrl(true); setTimeout(() => setCopiedBasicUrl(false), 1200); })}
                                style={{ marginLeft: 'auto' }}
                                aria-label="URL 복사"
                              >
                                {copiedBasicUrl ? '복사됨' : '복사'}
                              </button>
                            </div>
                          ) : (
                            <div className="pd-inline-link" style={{ marginTop: 6, alignItems: 'center' }}>
                              <span className="pd-inline-link-label">🔗</span>
                              <code>{officialUrl}</code>
                              <button
                                className="copy-btn"
                                onClick={() => copyText(officialUrl, () => { setCopiedBasicUrl(true); setTimeout(() => setCopiedBasicUrl(false), 1200); })}
                                style={{ marginLeft: 'auto' }}
                                aria-label="URL 복사"
                              >
                                {copiedBasicUrl ? '복사됨' : '복사'}
                              </button>
                            </div>
                          );
                        })()
                      )}

                      {/* 접속 정보 (있다면) */}
                      {movedConnCmd && (
                        <div className="pd-inline-link" style={{ marginTop: 6, alignItems: 'center' }}>
                          <span className="pd-inline-link-label">🔗</span>
                          <code>{movedConnCmd}</code>
                          <button
                            className="copy-btn"
                            onClick={() => copyText(movedConnCmd, () => { setCopiedBasicConn(true); setTimeout(() => setCopiedBasicConn(false), 1200); })}
                            style={{ marginLeft: 'auto' }}
                            aria-label="접속 정보 복사"
                          >
                            {copiedBasicConn ? '복사됨' : '복사'}
                          </button>
                        </div>
                      )}

                      <div className="pd-primary-actions">
                        {hasFileAttachment ? (
                          <button
                            className="download-btn pd-download"
                            onClick={() => downloadFile(id)}
                            aria-label="첨부 다운로드"
                          >
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path d="M3 14.5A1.5 1.5 0 0 0 4.5 16h11a1.5 1.5 0 0 0 1.5-1.5V12h-2v2h-10v-2H3v2.5zM10 3a1 1 0 0 1 1 1v6.586l1.293-1.293 1.414 1.414L10 14.414 6.293 10.707l1.414-1.414L9 10.586V4a 1 1 0 0 1 1-1z" />
                            </svg>
                            첨부 다운로드
                          </button>
                        ) : (
                          movedDownloadUrl && (
                            <a
                              className="pd-download"
                              href={movedDownloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="외부 다운로드 링크"
                            >
                              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M3 14.5A1.5 1.5 0 0 0 4.5 16h11a1.5 1.5 0 0 0 1.5-1.5V12h-2v2h-10v-2H3v2.5zM10 3a1 1 0 0 1 1 1v6.586l1.293-1.293 1.414 1.414L10 14.414 6.293 10.707l1.414-1.414L9 10.586V4a 1 1 0 0 1 1-1z" />
                              </svg>
                              다운로드
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* 구분선 아래: 카드 + 잔여 링크 요약 */}
                  {(linkCards.length > 0 || descLinks.length > 0) && (
                    <>
                      <div className="pd-separator" aria-hidden="true" />
                      <div className="pd-section-subtitle">추가 링크/다운로드</div>
                      <div className="pd-inline-info">
                        {linkCards.map((c, i) => (
                          c.type === 'download' ? (
                            <div className="pd-info" key={`card-d-${i}-${c.url}`}>
                              <div className="pd-info-label">{c.label}</div>
                              <a
                                className="pd-download"
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="외부 다운로드 링크"
                              >
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                  <path d="M3 14.5A1.5 1.5 0 0 0 4.5 16h11a1.5 1.5 0 0 0 1.5-1.5V12h-2v2h-10v-2H3v2.5zM10 3a1 1 0 0 1 1 1v6.586l1.293-1.293 1.414 1.414L10 14.414 6.293 10.707l1.414-1.414L9 10.586V4a 1 1 0 0 1 1-1z" />
                                </svg>
                                다운로드
                              </a>
                            </div>
                          ) : c.type === 'connect' ? (
                            <div className="pd-info" key={`card-c-${i}-${c.cmd}`}>
                              <div className="pd-info-label">{c.label}</div>
                              <div className="pd-inline-link" style={{ alignItems: 'center' }}>
                                <span className="pd-inline-link-label">🔗</span>
                                <code>{c.cmd}</code>
                                <button
                                  className="copy-btn"
                                  onClick={() => copyText(c.cmd, () => { setCopiedConnKey(`c-${i}`); setTimeout(() => setCopiedConnKey(''), 1200); })}
                                  style={{ marginLeft: 'auto' }}
                                  aria-label="접속 정보 복사"
                                >
                                  {copiedConnKey === `c-${i}` ? '복사됨' : '복사'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="pd-info" key={`card-l-${i}-${c.url}`}>
                              <div className="pd-info-label">{c.label}</div>
                              <div className="pd-inline-link" style={{ alignItems: 'center' }}>
                                <span className="pd-inline-link-label">🔗</span>
                                <a href={c.url} target="_blank" rel="noopener noreferrer">{c.url}</a>
                                <button
                                  className="copy-btn"
                                  onClick={() => copyText(c.url, () => { setCopiedUrlKey(`card-l-${i}`); setTimeout(() => setCopiedUrlKey(''), 1200); })}
                                  style={{ marginLeft: 'auto' }}
                                  aria-label="URL 복사"
                                >
                                  {copiedUrlKey === `card-l-${i}` ? '복사됨' : '복사'}
                                </button>
                              </div>
                            </div>
                          )
                        ))}

                        {descLinks.map((u, i) => (
                          isDownloadService(u) ? (
                            <a
                              key={`d-${i}-${u}`}
                              className="pd-download"
                              href={u}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="외부 다운로드 링크"
                            >
                              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M3 14.5A1.5 1.5 0 0 0 4.5 16h11a1.5 1.5 0 0 0 1.5-1.5V12h-2v2h-10v-2H3v2.5zM10 3a1 1 0 0 1 1 1v6.586l1.293-1.293 1.414 1.414L10 14.414 6.293 10.707l1.414-1.414L9 10.586V4a 1 1 0 0 1 1-1z" />
                              </svg>
                              다운로드
                            </a>
                          ) : (
                            <div key={`l-${i}-${u}`} className="pd-inline-link" style={{ alignItems: 'center' }}>
                              <span className="pd-inline-link-label">🔗</span>
                              <a href={u} target="_blank" rel="noopener noreferrer">{u}</a>
                              <button
                                className="copy-btn"
                                onClick={() => copyText(u, () => { setCopiedUrlKey(`desc-${i}`); setTimeout(() => setCopiedUrlKey(''), 1200); })}
                                style={{ marginLeft: 'auto' }}
                                aria-label="URL 복사"
                              >
                                {copiedUrlKey === `desc-${i}` ? '복사됨' : '복사'}
                              </button>
                            </div>
                          )
                        ))}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </div>

          {/* 제거됨: 중복 기본 정보 섹션 */}

          {/* 뒤로가기 */}
          <div className="pd-section">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <b>뒤로 가기</b>
            </button>
          </div>
        </section>

        {/* 우측: 제출 카드 */}
        <aside className="pd-card pd-submit-card">
          <div className="pd-section">
            <div className="pd-side-title">플래그 제출</div>
            <div className="flag-submit">
              {isCorrect ? (
                <div className="pd-label success" role="status" aria-live="polite">정답입니다!</div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="FLAG 입력"
                    value={flag}
                    onChange={(e) => {
                      setFlag(e.target.value);
                      if (submitStatus !== 'idle') setSubmitStatus('idle');
                    }}
                  />
                  <button
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer', width: '100%' }}
                  >
                    <b>제출</b>
                  </button>
                  {submitStatus === 'wrong' && (
                    <div className="pd-label error" role="alert" aria-live="assertive">오답입니다.</div>
                  )}
                </>
              )}
            </div>
          </div>
        </aside>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
