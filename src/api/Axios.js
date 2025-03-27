import axios from 'axios';
import Cookies from 'js-cookie';

const Axios = axios.create({
  baseURL: 'https://msg.mjsec.kr/api/',
  withCredentials: true, // 쿠키를 포함하여 요청 (세션 관리 가능)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 응답 인터셉터 추가
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      const errorMessage = error.response.data;

      // "Access token expired" 메시지 확인
      if (errorMessage === "Access token expired" && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          console.log('리프레시 토큰으로 새 액세스 토큰 요청 중...');
          const newAccessToken = await handleTokenRefresh();

          if (newAccessToken) {
            console.log('액세스 토큰 갱신 성공:', newAccessToken);
            Cookies.set('accessToken', newAccessToken, { secure: true });

            // 원래 요청의 Authorization 헤더 업데이트
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            return Axios(originalRequest);
          }
        } catch (refreshError) {
          console.error('리프레시 토큰 만료 - 로그아웃 처리', refreshError);
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          window.location.href = '/login'; // 강제 로그아웃 처리
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// 토큰 재발급 함수
async function handleTokenRefresh() {
  try {
    const response = await axios.post(
      'https://msg.mjsec.kr/api/reissue',
      {},
      { withCredentials: true } // 쿠키 포함 요청
    );

    const newAccessToken = response.headers['authorization']; // 예: "Bearer <newAccessToken>"

    if (newAccessToken) {
      const token = newAccessToken.replace('Bearer ', '');
      Cookies.set('accessToken', token, { secure: true });
      return token;
    } else {
      throw new Error("Access token not found in response headers");
    }
  } catch (error) {
    throw new Error("Failed to refresh token");
  }
}

export { Axios };

