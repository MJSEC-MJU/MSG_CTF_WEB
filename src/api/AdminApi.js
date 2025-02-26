import { Axios } from './Axios';
import Cookies from 'js-cookie';

// 토큰 재발급 API (필요 시 호출)
export const reissueToken = async () => {
  try {
    const response = await Axios.post('reissue', null, {
      withCredentials: true,
    });
    const newAccessToken = response.headers['authorization'];
    if (newAccessToken) {
      Cookies.set('accessToken', newAccessToken, { secure: true });
      Axios.defaults.headers.common['Authorization'] =
        `Bearer ${newAccessToken}`;
      return newAccessToken;
    }
    throw new Error('토큰 재발급 실패: 새 토큰이 없습니다.');
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// 관리자 인증 검증 API
export const validateAdmin = async () => {
  try {
    const response = await Axios.get('/api/admin/validate', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('accessToken')}`,
      },
    });
    return response.data; // 성공 시 "admin" 문자열 반환
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// 모든 회원 조회 API
export const getMembers = async () => {
  try {
    const response = await Axios.get('/api/admin/member', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('accessToken')}`,
      },
    });
    return response.data; // 회원 배열 반환
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// 특정 회원 조회 API
export const getMember = async (userId) => {
  try {
    const response = await Axios.get(`/api/admin/member/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('accessToken')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// 회원 정보 수정 API
export const updateMember = async (userId, memberData) => {
  try {
    const response = await Axios.put(
      `/api/admin/change/member/${userId}`,
      memberData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('accessToken')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// 회원 삭제 API
export const deleteMember = async (userId) => {
  try {
    const response = await Axios.delete(`/api/admin/delete/member/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('accessToken')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// 신규 회원 추가 API
// memberData: { loginId, password, email, univ, roles }
export const addMember = async (memberData) => {
  try {
    const response = await Axios.post('/api/admin/add/member', memberData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('accessToken')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// 챌린지 요약 조회 API
export const getChallengeSummary = async () => {
  try {
    const response = await Axios.get('/api/admin/challenge/summary', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('accessToken')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// 챌린지 상세 조회 API
export const getChallenge = async (challengeId) => {
  try {
    const response = await Axios.get(`/api/admin/challenge/${challengeId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get('accessToken')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// 챌린지 생성 API (multipart/form-data)
// challengeId: 생성할 챌린지의 ID
// challengeData: { title, description, flag, points, minPoints, initialPoints, startTime, endTime, url }
// file: 업로드할 파일 (예: sample.zip)
export const createChallenge = async (challengeId, challengeData, file) => {
  try {
    const formData = new FormData();
    formData.append('challengeId', challengeId);
    formData.append('challenge', JSON.stringify(challengeData));
    formData.append('file', file);
    const response = await Axios.post('/api/admin/create/challenge', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${Cookies.get('accessToken')}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export default {
  reissueToken,
  validateAdmin,
  getMembers,
  getMember,
  updateMember,
  deleteMember,
  addMember,
  getChallengeSummary,
  getChallenge,
  createChallenge,
};
