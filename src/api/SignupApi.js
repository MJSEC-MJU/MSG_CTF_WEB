import { Axios } from './Axios';

export const signUp = async (userData) => {
  try {
    // 👇 "header", "body" 없이, 최상위에 필드들을 넣음
    const payload = {
      loginId: userData.loginId,
      univ: userData.univ,
      email: userData.email,
      password: userData.password,
    };
    const response = await Axios.post('users/sign-up', payload);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// 아이디 중복 확인 API
export const checkId = async (loginId) => {
  try {
    const response = await Axios.get('users/check-id', {
      // 쿼리 파라미터는 loginId 그대로 사용
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

export default { signUp, checkId, checkEmail };
