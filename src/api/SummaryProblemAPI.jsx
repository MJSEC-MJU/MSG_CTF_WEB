// src/api/SummaryProblemAPI.js
import { Axios } from './Axios';

// 전체조회
export async function fetchProblems() {
  // GET /api/admin/challenge/summary  ->  [ {challengeId,title,category,points}, ... ]
  const { data } = await Axios.get('/admin/challenge/summary');
  // 서버가 순수 배열을 주면 그대로, 혹시 {data:[...]}면 내부만 꺼냄
  return Array.isArray(data) ? data
       : Array.isArray(data?.data) ? data.data
       : [];
}

// 삭제
export async function deleteProblem(challengeId) {
  const resp = await Axios.delete(`/admin/delete/challenge/${challengeId}`);
  // 보통 { code, message } 형태일 테니 그대로 반환
  return resp.data ?? { code: 'SUCCESS' };
}