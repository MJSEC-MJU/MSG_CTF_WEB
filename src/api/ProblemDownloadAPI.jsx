import axios from 'axios';

export const downloadProblemFile = async (challengeId) => {
  try {
    const response = await axios.get(
      `/api/challenges/${challengeId}/download-file`,
      {
        responseType: 'blob',
        withCredentials: true,
      }
    );

    let filename = `challenge-${challengeId}.zip`;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.includes('filename=')) {
      const matches = disposition.match(/filename="?(.*?)"?$/);
      if (matches && matches[1]) {
        filename = matches[1];
      }
    }

    // response.data는 이미 Blob 객체입니다.
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
    if (error.response && error.response.status === 400) {
      alert('파일이 존재하지 않습니다.');
    } else {
      alert('파일 다운로드에 실패했습니다.');
    }
    console.error('파일 다운로드 오류:', error);
  }
};
