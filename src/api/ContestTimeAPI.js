import { Axios } from './Axios';

/** 대회 시간 조회 (공개) */
export async function fetchContestTime() {
  const { data } = await Axios.get('/contest-time'); // baseURL이 /api
  return data;
}

/** 대회 시간 설정 (관리자 전용) */
export async function updateContestTime(startTime, endTime) {
  // 헤더 인증 흐름을 쓰므로 별도 Authorization 설정 금지(인터셉터가 처리)
  // 날짜 포맷은 서버 기대값에 맞춰 주세요:
  // - ISO 권장: '2025-10-14T01:29:00'
  // - 공백 포맷을 계속 쓸 경우: 서버 DTO에 @JsonFormat("yyyy-MM-dd HH:mm:ss") 필요
  const payload = { startTime, endTime };
  const { data } = await Axios.put('/admin/contest-time', payload);
  return data;
}
