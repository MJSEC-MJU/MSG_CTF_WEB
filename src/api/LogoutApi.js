import { Axios } from './Axios';
import Cookies from 'js-cookie';

export const logout = async () => {
  try {
    let token = Cookies.get('accessToken');

    if (!token) {
      console.warn('로그아웃 실패: 액세스 토큰이 없습니다.');
      return;
    }

    // 로그아웃 요청 보내기
    await Axios.post('users/logout', null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });

    console.log('로그아웃 성공');
  } catch (error) {
    // 오류 메시지나 alert 없이 로그아웃 실패만 처리
    console.error('로그아웃 요청 실패:', error);
  } finally {
    // 무조건 토큰 삭제 및 로그아웃 처리
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    window.location.href = '/login'; // 로그인 페이지로 리다이렉트
  }
};

export default logout;
