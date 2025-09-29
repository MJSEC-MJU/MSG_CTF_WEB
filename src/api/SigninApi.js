import { Axios } from './Axios';
import Cookies from 'js-cookie';

// 토큰 재발급 API
export const reissueToken = async () => {
  const resp = await Axios.post('/reissue', null, { withCredentials: true });

  // 1) Authorization 헤더 우선
  const authHeader = resp.headers?.['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length);
    Cookies.set('accessToken', token, { secure: true });
    Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return token;
  }

  // 2) 또는 본문에서 제공
  const bodyToken = resp.data?.accessToken;
  if (bodyToken) {
    Cookies.set('accessToken', bodyToken, { secure: true });
    Axios.defaults.headers.common['Authorization'] = `Bearer ${bodyToken}`;
    return bodyToken;
  }

  throw new Error('토큰 재발급 실패: 새 토큰이 없습니다.');
};

// 로그인 API (credentials: { loginId, password })
export const signIn = async ({ loginId, password }) => {
  const payload = { loginId, password };

  // 로그인은 자격증명 불필요. 명시적으로 끄기
  const resp = await Axios.post('/users/sign-in', payload, { withCredentials: false });

  const { accessToken, refreshToken } = resp.data || {};

  if (accessToken) {
    // 순수 토큰만 저장
    Cookies.set('accessToken', accessToken, { secure: true });
    Axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  if (refreshToken) {
    Cookies.set('refreshToken', refreshToken, { secure: true });
  }

  return resp.data;
};

export default { signIn, reissueToken };
