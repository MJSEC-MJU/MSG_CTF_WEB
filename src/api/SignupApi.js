// import { Axios } from './Axios';

// export const signUp = async (userData) => {
//   try {
//     const payload = {
//       loginId: userData.loginId,
//       univ: userData.univ,
//       email: userData.email,
//       password: userData.password,
//     };
//     const response = await Axios.post('users/sign-up', payload);
//     return response.data;
//   } catch (error) {
//     throw error.response ? error.response.data : error;
//   }
// };

// // 아이디 중복 확인 API
// export const checkId = async (loginId) => {
//   try {
//     const response = await Axios.get('users/check-id', {
//       // 쿼리 파라미터는 loginId 그대로 사용
//       params: { loginId },
//     });
//     return response.data;
//   } catch (error) {
//     throw error.response ? error.response.data : error;
//   }
// };

// // 이메일 중복 확인 API
// export const checkEmail = async (email) => {
//   try {
//     const response = await Axios.get('users/check-email', {
//       params: { email },
//     });
//     return response.data;
//   } catch (error) {
//     throw error.response ? error.response.data : error;
//   }
// };

// // 이메일 인증 코드 발송 API
// export const sendEmailCode = async (email) => {
//   try {
//     const response = await Axios.post('users/send-code', null, {
//       params: { email },
//     });
//     return response.data;
//   } catch (error) {
//     throw error.response ? error.response.data : error;
//   }
// };

// // 이메일 인증 코드 확인 API
// export const verifyEmailCode = async (email, code) => {
//   try {
//     const response = await Axios.post('users/verify-code', null, {
//       params: { email, code },
//     });
//     return response.data;
//   } catch (error) {
//     throw error.response ? error.response.data : error;
//   }
// };

// export default { signUp, checkId, checkEmail, sendEmailCode, verifyEmailCode };
