import axios from 'axios';

export const downloadProblemFile = async (challengeId) => {
  try {
    const response = await axios.get(
      `/api/challenges/${challengeId}/download-file`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`, // 헤더에 토큰 추가
        },
      });

    const disposition = response.headers['content-disposition'];
    let filename = `challenge-${challengeId}.zip`;

    if (disposition && disposition.includes('filename=')) {
      const matches = disposition.match(/filename="?(.*?)"?$/);
      if (matches && matches[1]) {
        filename = matches[1];
      }
    }

    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);

    window.URL.revokeObjectURL(url);

    console.log('파일 다운로드 성공');
  } catch (error) {
    console.error('파일 다운로드 오류:', error);
    alert('파일 다운로드 중 오류가 발생했습니다.');
  }
};
