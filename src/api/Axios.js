// src/api/Axios.js
import axios from 'axios';
import Cookies from 'js-cookie';

const Axios = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: false,
  headers: {
    // 기본 Accept만 두고, Content-Type은 상황별로 자동 결정되게 둔다.
    Accept: 'application/json',
  },
});

// 도우미: FormData 판별
function isFormData(v) {
  return typeof FormData !== 'undefined' && v instanceof FormData;
}

// 요청 인터셉터
Axios.interceptors.request.use((config) => {
  // 1) 토큰 부착
  const token = Cookies.get('accessToken');
  if (token) {
    (config.headers ||= {});
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // 2) FormData면 Content-Type을 삭제해서 브라우저가 boundary를 넣게 한다
  if (isFormData(config.data)) {
    if (config.headers) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
    // axios가 JSON으로 변환하지 않도록
    config.transformRequest = [(d) => d];
  } else {
    // JSON 바디일 때만 Content-Type을 지정 (없으면 axios가 자동 지정하지만 안전하게)
    if (
      config.method &&
      ['post', 'put', 'patch'].includes(config.method.toLowerCase())
    ) {
      (config.headers ||= {});
      if (!config.headers['Content-Type'] && !config.headers['content-type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }
  }

  return config;
});

let tokenRefreshing = null;

// 응답 인터셉터
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 403 → 토큰 재발급 1회 시도 후 원 요청 재시도
    if (status === 403 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await handleTokenRefresh();
        if (newToken) {
          originalRequest.headers = originalRequest.headers || {};
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

// 토큰 재발급
async function handleTokenRefresh() {
  if (tokenRefreshing) return tokenRefreshing;

  tokenRefreshing = (async () => {
    try {
      // 재발급은 쿠키 필요할 수 있으니 이 호출만 withCredentials: true
      const resp = await Axios.post('/reissue', {}, { withCredentials: true });

      // 헤더 우선
      const authHeader = resp.headers?.['authorization'];
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice('Bearer '.length);
        Cookies.set('accessToken', token, { secure: true });
        Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return token;
      }

      // 바디에 토큰이 오는 경우
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
