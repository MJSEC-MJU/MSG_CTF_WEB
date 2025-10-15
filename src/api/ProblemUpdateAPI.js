// src/api/ProblemUpdateAPI.js
import { Axios } from './Axios';

// fd 는 반드시 FormData 여야 하고, 파트 이름은 백엔드 스펙대로 'challenge' (JSON), 'file' (옵션)
export const updateProblem = async (challengeId, fd) => {
  if (!(fd instanceof FormData)) {
    throw new Error('updateProblem: FormData를 전달해야 합니다.');
  }

  // (옵션) 백엔드가 file 파트를 항상 기대한다면 더미 파일 추가
  if (!fd.has('file')) {
    const dummy = new File([''], "You don't need to download.zip", { type: 'application/zip' });
    fd.append('file', dummy);
  }

  //  헤더에 Content-Type 지정 금지 (Axios 요청 인터셉터가 FormData면 자동으로 비워 boundary 붙음)
  const res = await Axios.put(`/admin/update/challenge/${challengeId}`, fd);
  return res.data;
};
