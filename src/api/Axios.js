import axios from 'axios';
import Cookies from 'js-cookie';

const Axios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/`,
  withCredentials: true, // 쿠키를 포함하여 요청 (세션 관리 가능)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

let tokenRefreshing = null;

// 응답 인터셉터 추가
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    console.log("❌ Axios Error Response:", error.response); // 전체 에러 응답 로그

    if (error.response) {
      const status = error.response.status;
      const errorMessage = error.response.data;
      
      //console.log(`📌 에러 상태 코드: ${status}`);
      //console.log(`📌 에러 메시지:`, errorMessage);

      // 403 에러 발생 시 (토큰 만료)
      if (status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          //console.log('🔄 리프레시 토큰으로 새 액세스 토큰 요청 중...');
          const newAccessToken = await handleTokenRefresh();

          if (newAccessToken) {
            //console.log('✅ 액세스 토큰 갱신 성공:', newAccessToken);
            Cookies.set('accessToken', newAccessToken, { secure: true });

            // 원래 요청의 Authorization 헤더 업데이트
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            // 새로운 토큰으로 API 요청 다시 실행 후, 그 결과를 받은 다음 새로고침
            const retryResponse = await Axios(originalRequest);
            //console.log('✅ 원래 요청 재시도 성공:', retryResponse);
            
            window.location.reload();
            return retryResponse;
          }
        } catch (refreshError) {
          //console.error('⛔ 리프레시 토큰 만료 - 로그아웃 처리', refreshError);
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          // window.location.href = '/login'; // 강제 로그아웃 처리
          return Promise.reject(refreshError);
        }
      }
    } else {
      //console.error("⚠️ 서버 응답이 없음. 네트워크 문제");
    }

    return Promise.reject(error);
  }
);

// 토큰 재발급 함수
async function handleTokenRefresh() {
  if (tokenRefreshing) {
    //console.log("🔄 기존의 토큰 재발급 요청이 이미 실행 중... 기다리는 중");
    return tokenRefreshing;
  }

  tokenRefreshing = (async () => {
    try {
      //console.log("🔄 토큰 재발급 요청...");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/reissue`,
        {},
        { withCredentials: true } // 쿠키 포함 요청
      );

      //console.log("🔄 재발급 응답:", response);
      const newAccessToken = response.headers['authorization']; // 예: "Bearer <newAccessToken>"

      if (newAccessToken) {
        const token = newAccessToken.replace('Bearer ', '');
        Cookies.set('accessToken', token, { secure: true });
        //console.log("✅ 새로운 액세스 토큰 저장 완료.");
        return token;
      } else {
        throw new Error("⚠️ Access token not found in response headers");
      }
    } catch (error) {
      //console.error("⛔ 토큰 재발급 실패:", error);
      throw new Error("Failed to refresh token");
    } finally {
      tokenRefreshing = null; // 요청 완료 후 변수 초기화
    }
  })();

  return tokenRefreshing;
}

export { Axios };


