import { Axios } from './Axios';

/**
 * 개인별 그래프 데이터를 가져옵니다.
 * 엔드포인트: GET /api/leaderboard/graph
 * @returns {Promise<any>} 서버에서 받은 데이터
 */
export const fetchLeaderboardData = async () => {
  try {
    const response = await Axios.get('/leaderboard/graph');
    return response.data;
  } catch (error) {
    console.error('리더보드 데이터 가져오기 실패:', error);
    throw error;
  }
};
