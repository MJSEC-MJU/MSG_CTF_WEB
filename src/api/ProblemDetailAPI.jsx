import { Axios } from './Axios';
import Cookies from "js-cookie";

// Simple in-memory dedupe + short-lived cache to prevent bursty duplicate requests
const inflight = new Map(); // key -> Promise
const cache = new Map();    // key -> { data, ts }
const CACHE_TTL_MS = 5000;  // 5 seconds

export const fetchProblemDetail = async (challengeId) => {
  const key = String(challengeId);

  // Short-lived cache hit
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
    return cached.data;
  }

  // Inflight dedupe
  if (inflight.has(key)) {
    return inflight.get(key);
  }

  const task = (async () => {
    try {
      const token = Cookies.get("accessToken");
      if (!token) throw new Error("로그인이 필요합니다.");

      const response = await Axios.get(`/challenges/${challengeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data ?? response.data;
      cache.set(key, { data, ts: Date.now() });
      return data;
    } catch (err) {
      throw new Error(err?.response?.data?.message || "문제 데이터를 불러오는 중 오류 발생");
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, task);
  return task;
};
