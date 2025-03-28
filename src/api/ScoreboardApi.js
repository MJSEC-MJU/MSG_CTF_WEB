import { Axios } from './Axios';

export const fetchLeaderboardData = async () => {
  try {
    const response = await Axios.get('/leaderboard/graph');
    return response.data;
  } catch (error) {
    // console.error('리더보드 데이터 가져오기 실패:', error);
    throw error;
  }
};
