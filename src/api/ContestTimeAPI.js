// src/api/ContestTimeAPI.js
import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/**
 * 대회 시간 조회 (공개 API)
 * GET /api/contest-time
 * @returns {Promise<{startTime: string, endTime: string, currentTime: string}>}
 */
export async function fetchContestTime() {
  try {
    const res = await axios.get(`${BASE}/api/contest-time`, {
      withCredentials: false,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 8000,
    });
    return res.data;
  } catch (e) {
    console.error('[ContestTimeAPI] fetchContestTime failed:', e);
    throw e;
  }
}

/**
 * 대회 시간 설정 (관리자 전용)
 * PUT /api/admin/contest-time
 * @param {string} startTime - 대회 시작 시간 (yyyy-MM-dd HH:mm:ss)
 * @param {string} endTime - 대회 종료 시간 (yyyy-MM-dd HH:mm:ss)
 * @returns {Promise<{message: string, data: object}>}
 */
export async function updateContestTime(startTime, endTime) {
  try {
    const token = localStorage.getItem('accessToken');

    const res = await axios.put(
      `${BASE}/api/admin/contest-time`,
      {
        startTime,
        endTime,
      },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        timeout: 8000,
      }
    );
    return res.data;
  } catch (e) {
    console.error('[ContestTimeAPI] updateContestTime failed:', e);
    throw e;
  }
}
