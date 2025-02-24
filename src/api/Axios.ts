// api.js
import axios from 'axios';
import Cookies from 'js-cookie';

// Axios 인스턴스 생성
const Axios = axios.create({
  baseURL: 'https://msg.mjsec.kr/api/',
  withCredentials: true, // 쿠키를 포함하여 요청 (세션 관리 가능)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Axios 응답 인터셉터: 401 에러 발생 시 토큰 재발급 시도
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log('리프레시 토큰으로 새 액세스 토큰 요청 중...');
        // /reissue 엔드포인트 호출 (쿠키에 저장된 refreshToken 자동 전송)
        const response = await axios.post(
          'https://msg.mjsec.kr/api/reissue',
          null,
          { withCredentials: true }
        );
        // 새 액세스 토큰은 응답 헤더의 Authorization 필드에 포함됨
        const newAccessToken = response.headers['authorization'];
        if (newAccessToken) {
          console.log('액세스 토큰 갱신 성공:', newAccessToken);
          Cookies.set('accessToken', newAccessToken, { secure: true });
          Axios.defaults.headers.common['Authorization'] = newAccessToken;
          originalRequest.headers['Authorization'] = newAccessToken;
          return Axios(originalRequest);
        }
        throw new Error('새 액세스 토큰이 없습니다.');
      } catch (refreshError) {
        console.error('리프레시 토큰 만료 - 로그아웃 처리', refreshError);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login'; // 강제 로그아웃 처리
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// 회원가입 API (명세에 따라 "header"와 "body"로 감싸서 전송)
export const signUp = async (userData) => {
  // userData: { login_id, univ, email, password }
  try {
    const payload = {
      header: { 'Content-Type': 'application/json' },
      body: userData,
    };
    const response = await Axios.post('users/sign-up', payload);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// 토큰 재발급 API
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

// 로그인 API (명세에 따라 "headers"와 "body"로 전송)
// 로그인 성공 시 accessToken, refreshToken을 저장한 후, reissueToken을 호출하여 토큰을 재발급 받음
export const signIn = async (credentials) => {
  // credentials: { login_id, password }
  try {
    const payload = {
      headers: { 'Content-Type': 'application/json' },
      body: credentials,
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
    // 로그인 성공 후, 즉시 토큰 재발급 (데모용)
    const newToken = await reissueToken();
    console.log('Reissued token:', newToken);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// 아이디 중복 확인 API
export const checkId = async (loginId) => {
  try {
    const response = await Axios.get('users/check-id', {
      params: { loginId },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// 이메일 중복 확인 API
export const checkEmail = async (email) => {
  try {
    const response = await Axios.get('users/check-email', {
      params: { email },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export default Axios;
