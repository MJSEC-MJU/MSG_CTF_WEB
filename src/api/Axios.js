import axios from 'axios';
import Cookies from 'js-cookie';

const Axios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // 마지막 슬래시 제거
  withCredentials: false, // 기본은 자격증명 전송 안 함
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// 요청 인터셉터: 쿠키에 토큰이 있으면 Authorization 헤더 부착
Axios.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

let tokenRefreshing = null;

Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 403 발생 시 1회 한정 재발급 → 원요청 재시도
    if (status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await handleTokenRefresh();
        if (newToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return Axios(originalRequest);
        }
      } catch (e) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
      }
    }

    return Promise.reject(error);
  }
);

// 토큰 재발급 (Axios 인스턴스로 통일)
async function handleTokenRefresh() {
  if (tokenRefreshing) return tokenRefreshing;

  tokenRefreshing = (async () => {
    try {
      // 재발급은 쿠키 필요할 수 있으므로 여기서만 withCredentials: true
      const resp = await Axios.post('/reissue', {}, { withCredentials: true });

      // 1) Authorization 헤더 우선
      const authHeader = resp.headers?.['authorization'];
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice('Bearer '.length);
        Cookies.set('accessToken', token, { secure: true });
        Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return token;
      }

      // 2) 또는 본문에서 토큰 제공 시
      const bodyToken = resp.data?.accessToken;
      if (bodyToken) {
        Cookies.set('accessToken', bodyToken, { secure: true });
        Axios.defaults.headers.common['Authorization'] = `Bearer ${bodyToken}`;
        return bodyToken;
      }

      throw new Error('Access token not found in response');
    } finally {
      tokenRefreshing = null;
    }
  })();

  return tokenRefreshing;
}

export { Axios };



