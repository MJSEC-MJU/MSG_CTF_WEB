import axios from 'axios';
import Cookies from 'js-cookie';

export const downloadProblemFile = async (challengeId, challengeTitle) => {
  const token = Cookies.get('accessToken');
  if (!token) {
    alert('로그인이 필요합니다.');
    return { error: '로그인이 필요합니다.' };
  }

  try {
    const response = await axios.get(
      `/api/challenges/${challengeId}/download-file`,
      {
        responseType: 'blob',
        withCredentials: true,
      }
    );

    // 파일 다운로드 처리
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${challengeTitle}.zip`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);

    console.log('파일 다운로드 성공');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      alert('파일이 존재하지 않습니다.');
    } else {
      alert('파일 다운로드에 실패했습니다.');
    }
    console.error('파일 다운로드 오류:', error);
  }
};
