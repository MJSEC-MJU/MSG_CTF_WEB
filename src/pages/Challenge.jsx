import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchProblems } from "../api/ChallengeAllAPI";
import { fetchSolvedChallenges } from "../api/UserChallengeAPI";
import {
  fetchUnlockedList,
  fetchUnlockStatus,
  submitSignatureCode,
} from "../api/SignatureAPI";
import Loading from "../components/Loading";
import OptimizedImage from "../components/OptimizedImage";
import "./Challenge.css";

import forensicsImg from "/src/assets/Challenge/forensics.svg";
import cryptoImg from "/src/assets/Challenge/crypto.svg";
import pwnImg from "/src/assets/Challenge/pwn.svg";
import androidImg from "/src/assets/Challenge/android.svg";
import revImg from "/src/assets/Challenge/rev.svg";
import miscImg from "/src/assets/Challenge/misc.svg";
import webImg from "/src/assets/Challenge/web.svg";
import signatureImg from "/src/assets/Challenge/signature.svg";

import signatureChallengeImg from "/src/assets/Challenge/signature_challenge.svg";
import challengeSolvedImg from "/src/assets/Challenge/challenge_solved.svg";
import challengeImg from "/src/assets/Challenge/challenge.svg";
import backgroundImg from "/src/assets/background.svg";

function Challenge() {
  // 문제/페이지네이션
  const [problems, setProblems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // API 캐싱 (페이지 변경 시 불필요한 재호출 방지)
  const cachedSolvedRef = useRef(null);
  const cachedUnlockedRef = useRef(null);

  // 해결/언락 상태
  const [solvedChallenges, setSolvedChallenges] = useState(new Set());
  const [unlockedSet, setUnlockedSet] = useState(new Set());

  // 시그니처 모달 관련
  const [signatureForm, setSignatureForm] = useState(false);
  const [signatureInput, setSignatureInput] = useState("");
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const navigate = useNavigate();

  // 카테고리 매핑
  const categoryImages = useMemo(
    () => ({
      FORENSICS: forensicsImg,
      CRYPTO: cryptoImg,
      PWN: pwnImg,
      ANDROID: androidImg,
      REV: revImg,
      MISC: miscImg,
      WEB: webImg,
      SIGNATURE: signatureImg,
    }),
    []
  );
  const categoryFallback = miscImg;

  // 필터 대상 카테고리 목록
  const CATEGORY_LIST = useMemo(
    () => [
      { key: "FORENSICS", label: "Forensics" },
      { key: "CRYPTO", label: "Crypto" },
      { key: "PWN", label: "Pwn" },
      { key: "ANDROID", label: "Android" },
      { key: "REV", label: "Reversing" },
      { key: "MISC", label: "Misc" },
      { key: "WEB", label: "Web" },
      { key: "SIGNATURE", label: "Signature" },
    ],
    []
  );

  // 선택된 카테고리 (기본: 전체 선택)
  const [selectedCategories, setSelectedCategories] = useState(
    () => new Set(CATEGORY_LIST.map((c) => c.key))
  );

  const toggleCategory = (key) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedCategories(new Set(CATEGORY_LIST.map((c) => c.key)));
  };

  const clearAll = () => {
    setSelectedCategories(new Set());
  };

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setLoading(true);
      try {
        const solvedPromise = cachedSolvedRef.current
          ? Promise.resolve(cachedSolvedRef.current)
          : fetchSolvedChallenges();

        const unlockedPromise = cachedUnlockedRef.current
          ? Promise.resolve(cachedUnlockedRef.current)
          : fetchUnlockedList();

        const [problemsResult, solvedResult, unlockedResult] = await Promise.allSettled([
          fetchProblems(currentPage),
          solvedPromise,
          unlockedPromise,
        ]);

        if (!isMounted) return;

        if (problemsResult.status === "fulfilled") {
          const { problems, totalPages } = problemsResult.value;
          setProblems(problems);
          setTotalPages(totalPages);
        } else {
          console.error("fetchProblems failed:", problemsResult.reason);
        }

        if (solvedResult.status === "fulfilled") {
          const solvedData = solvedResult.value;
          cachedSolvedRef.current = solvedData;
          setSolvedChallenges(new Set(solvedData.map((s) => String(s.challengeId))));
        } else {
          setSolvedChallenges(new Set());
        }

        if (unlockedResult.status === "fulfilled") {
          const unlocked = unlockedResult.value;
          cachedUnlockedRef.current = unlocked;
          setUnlockedSet(new Set((unlocked?.challengeIds || []).map(String)));
        } else {
          setUnlockedSet(new Set());
        }
      } catch (e) {
        console.error("Challenge data fetch error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const isSignatureProblem = (problem) =>
    problem?.isSignature === true || problem?.category === "SIGNATURE";

  const effectiveCategoryOf = (problem) =>
    isSignatureProblem(problem) ? "SIGNATURE" : problem?.category;

  // 선택된 카테고리만 필터링
  const filteredProblems = useMemo(() => {
    if (!problems || selectedCategories.size === 0) return [];
    return problems.filter((p) => selectedCategories.has(effectiveCategoryOf(p)));
  }, [problems, selectedCategories]);

  const handleSignatureClick = async (e, problem) => {
    e.preventDefault();
    const cid = String(problem.challengeId);

    if (unlockedSet.has(cid)) {
      navigate(`/problem/${problem.challengeId}`);
      return;
    }

    try {
      const st = await fetchUnlockStatus(problem.challengeId);
      if (st?.unlocked) {
        setUnlockedSet((prev) => new Set([...prev, cid]));
        navigate(`/problem/${problem.challengeId}`);
        return;
      }
    } catch {
      // ignore unlock check errors
    }

    setSelectedProblem(problem);
    setSignatureInput("");
    setSubmitMsg("");
    setSignatureForm(true);
  };

  const onChangeSignature = (e) => {
    const onlyDigits = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setSignatureInput(onlyDigits);
  };

  const closeSignature = () => {
    setSignatureForm(false);
    setSelectedProblem(null);
    setSignatureInput("");
    setSubmitting(false);
    setSubmitMsg("");
  };

  const submitSignature = async () => {
    if (!selectedProblem) return;
    if (signatureInput.length !== 6) {
      setSubmitMsg("6자리 숫자를 입력하세요.");
      return;
    }
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const resp = await submitSignatureCode(selectedProblem.challengeId, signatureInput);
      setUnlockedSet((prev) => new Set([...prev, String(selectedProblem.challengeId)]));
      setSubmitMsg(resp?.message || "언락 성공! 이동합니다…");
      setTimeout(() => {
        closeSignature();
        navigate(`/problem/${selectedProblem.challengeId}`);
      }, 200);
    } catch (e) {
      const serverMsg = e?.response?.data?.message || e?.message || "제출 실패";
      setSubmitMsg(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // 시그니처 클럽별 솔브 이미지
  const getSignatureSolvedImg = (club) => {
    const slug = String(club || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
    return `/assets/signature/${slug}.svg`;
  };

  if (loading) {
    return (
      <div className="challenge-container">
        <Loading />
      </div>
    );
  }

  return (
    <div className="challenge-container">
      {/* ====== 상단 중앙 카테고리 필터 ====== */}
      <div className="category-filter">
        <div className="category-filter__row">
          {CATEGORY_LIST.map((cat) => {
            const checked = selectedCategories.has(cat.key);
            return (
              <label
                key={cat.key}
                className={`category-chip ${checked ? "is-checked" : ""}`}
                title={cat.label}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(cat.key)}
                />
                <span className="category-chip__label">{cat.label}</span>
              </label>
            );
          })}
        </div>
        <div className="category-filter__actions">
          <button className="cf-btn ghost" onClick={clearAll}>
            Clear
          </button>
          <button className="cf-btn primary" onClick={selectAll}>
            Select All
          </button>
        </div>
      </div>

      {/* ====== 문제 그리드 ====== */}
      <div className="problem-grid">
        {filteredProblems.length > 0 ? (
          filteredProblems.map((problem) => {
            const solved = solvedChallenges.has(String(problem.challengeId));
            const isSignature = isSignatureProblem(problem);
            const unlocked = unlockedSet.has(String(problem.challengeId));

            const mainImgSrc = isSignature
              ? (solved
                  ? getSignatureSolvedImg(problem.club)
                  : signatureChallengeImg)
              : solved
              ? challengeSolvedImg
              : challengeImg;

            const displayTitle = isSignature ? (problem.club ?? problem.title) : problem.title;
            const categoryKey = effectiveCategoryOf(problem);

            // 시그니처 문제를 풀었으면 텍스트 숨김
            const hideTextForSolvedSignature = isSignature && solved;

            return (
              <div key={problem.challengeId} className="problem-button-wrapper">
                <Link
                  to={
                    isSignature
                      ? unlocked
                        ? `/problem/${problem.challengeId}`
                        : "#"
                      : `/problem/${problem.challengeId}`
                  }
                  className="problem-button"
                  onClick={(e) => {
                    if (isSignature && !unlocked) {
                      handleSignatureClick(e, problem);
                    }
                  }}
                >
                  <div className="button-wrapper">
                    <OptimizedImage
                      src={mainImgSrc}
                      alt={displayTitle}
                      width="100%"
                      height="auto"
                    />
                    <OptimizedImage
                      src={categoryImages[categoryKey] ?? categoryFallback}
                      alt={categoryKey}
                      className="category-icon"
                      width="32"
                      height="32"
                    />

                    {!hideTextForSolvedSignature && (
                      <div
                        className="button-title"
                        style={solved ? { color: "#00FF00" } : undefined}
                      >
                        {displayTitle}
                      </div>
                    )}

                    {!hideTextForSolvedSignature && (
                      <div
                        className="button-score"
                        style={solved ? { color: "#00FF00" } : undefined}
                      >
                        {problem.points}
                      </div>
                    )}

                    {!hideTextForSolvedSignature && (
                      <div
                        className="button-mileage"
                        style={solved ? { color: "#00FF00" } : undefined}
                      >
                        M{problem.mileage}
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })
        ) : (
          <p style={{ color: "white", textAlign: "center", marginTop: "20px" }}>
            {selectedCategories.size === 0
              ? "선택한 카테고리가 없습니다."
              : "해당 카테고리에 문제가 없습니다."}
          </p>
        )}
      </div>

      <div className="pagination">
        <button
          style={{ height: "5vh", margin: "10px" }}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          이전
        </button>
        <span>
          {currentPage + 1} / {totalPages}
        </span>
        <button
          style={{ height: "5vh", margin: "10px" }}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage + 1 >= totalPages}
        >
          다음
        </button>
      </div>

      {/* 시그니처 입력 모달 */}
      {signatureForm && (
        <div
          className="signature-modal"
          onClick={(e) => {
            if (e.target.classList.contains("signature-modal")) {
              closeSignature();
            }
          }}
        >
          <div className="signature-form">
            <h3>Signature Code</h3>
            <p className="signature-help">해당 문제 접근을 위한 6자리 코드를 입력하세요.</p>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="6자리 숫자"
              value={signatureInput}
              onChange={onChangeSignature}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitSignature();
                if (e.key === "Escape") closeSignature();
              }}
              autoFocus
            />
            <div className="signature-buttons">
              <button onClick={closeSignature} disabled={submitting}>
                취소
              </button>
              <button
                className="submit-btn"
                onClick={submitSignature}
                disabled={submitting || signatureInput.length !== 6}
              >
                {submitting ? "제출 중…" : "제출"}
              </button>
            </div>
            {!!submitMsg && (
              <div className="signature-msg" style={{ marginTop: 8, color: "#ffb8b8" }}>
                {submitMsg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Challenge;
