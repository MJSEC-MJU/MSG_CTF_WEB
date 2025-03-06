// ProblemDownloadAPI.jsx
import axios from 'axios';

const BASE_URL = 'https://msg.mjsec.kr';

export const downloadProblemFile = async (challengeId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/challenges/${challengeId}/download-file`,
      {
        responseType: 'blob',
      }
    );

    // 파일 다운로드 처리
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `challenge_${challengeId}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    alert('파일 다운로드에 실패했습니다.');
  }
};
