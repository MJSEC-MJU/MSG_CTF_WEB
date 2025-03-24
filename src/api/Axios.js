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

Axios.interceptors.response.use(
  (response) => {
    if (response.data.accessToken) {
      console.log("새 액세스 토큰 반영:", response.data.accessToken);
      Cookies.set("accessToken", response.data.accessToken, { secure: true, sameSite: "Lax" });
      Axios.defaults.headers.common["Authorization"] = "Bearer " + response.data.accessToken;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios 응답 인터셉터: 401 에러 발생 시 토큰 재발급 시도
// Axios.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         console.log('리프레시 토큰으로 새 액세스 토큰 요청 중...');
//         const response = await axios.post(
//           'https://msg.mjsec.kr/api/reissue',
//           null,
//           { withCredentials: true }
//         );
//         const newAccessToken = response.headers['authorization'];
//         if (newAccessToken) {
//           console.log('액세스 토큰 갱신 성공:', newAccessToken);
//           Cookies.set('accessToken', newAccessToken, { secure: true });
//           Axios.defaults.headers.common['Authorization'] = newAccessToken;
//           originalRequest.headers['Authorization'] = newAccessToken;
//           return Axios(originalRequest);
//         }
//         throw new Error('새 액세스 토큰이 없습니다.');
//       } catch (refreshError) {
//         console.error('리프레시 토큰 만료 - 로그아웃 처리', refreshError);
//         Cookies.remove('accessToken');
//         Cookies.remove('refreshToken');
//         window.location.href = '/login'; // 강제 로그아웃 처리
//         return Promise.reject(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   }
// );

export default Axios;
