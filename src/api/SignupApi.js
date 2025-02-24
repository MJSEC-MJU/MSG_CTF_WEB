import Axios from '../api/axios.js';

export const signUp = async (userData) => {
  try {
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
