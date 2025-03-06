import axios from 'axios';
import Cookies from 'js-cookie';

export const submitFlag = async (challengeId, flag) => {
  const token = Cookies.get("accessToken"); 
  if (!token) {
    return { error: '로그인이 필요합니다.' };
  }

  try {
    const response = await axios.post(
      `/api/challenges/${challengeId}/submit`,
      { submitFlag: flag },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    } else {
      return { error: '서버 연결 오류' };
    }
  }
};