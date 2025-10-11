// src/api/servertimeAPI.js
import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, ''); // 끝 슬래시 제거

export async function fetchServerTime() {
  try {
    const res = await axios.get(`${BASE}/api/server-time`, {
      // 공개 엔드포인트라 쿠키/자격증명 불필요
      withCredentials: false,
      headers: {
        Accept: 'application/json',
      },
      timeout: 8000,
    });
    // 컨트롤러 구조: { serverTime: "2025-10-12T02:34:56.789" }
    return res.data; // 필요하면 res.data.serverTime만 반환해도 됨
  } catch (e) {
    console.error('[ServerTimeAPI] fetchServerTime failed:', e);
    throw e;
  }
}