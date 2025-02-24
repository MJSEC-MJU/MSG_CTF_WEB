import Axios from './axios';
import Cookies from 'js-cookie';

// 토큰 재발급 API (필요 시 호출)
export const reissueToken = async () => {
  try {
    const response = await Axios.post('reissue', null, {
      withCredentials: true,
    });
    const newAccessToken = response.headers['authorization'];
    if (newAccessToken) {
      Cookies.set('accessToken', newAccessToken, { secure: true });
      Axios.defaults.headers.common['Authorization'] = newAccessToken;
      return newAccessToken;
    }
    throw new Error('토큰 재발급 실패: 새 토큰이 없습니다.');
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// 로그인 API (평면한 JSON 객체로 전송)
// credentials: { loginId, password }
export const signIn = async (credentials) => {
  try {
    // 평면한 JSON 객체로 요청 본문을 구성합니다.
    const payload = {
      loginId: credentials.loginId,
      password: credentials.password,
    };
    const response = await Axios.post('users/sign-in', payload);
    const { accessToken, refreshToken } = response.data;
    if (accessToken) {
      Axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      Cookies.set('accessToken', accessToken, { secure: true });
    }
    if (refreshToken) {
      Cookies.set('refreshToken', refreshToken, { secure: true });
    }
    // reissueToken 호출은 중복 문제를 피하기 위해 생략합니다.
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export default { signIn, reissueToken };
