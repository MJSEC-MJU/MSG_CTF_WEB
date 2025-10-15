// src/api/CreateProblemAPI.js
// - 문제 생성 API 호출 모듈
// - SIGNATURE 카테고리일 경우 club(팀명) 필수 포함

import { Axios } from './Axios';

const API_URL = '/admin/create/challenge';

export const createProblem = async (formData) => {
  try {
    const data = new FormData();

    // 1) 첨부파일: 없으면 더미 파일로 대체 (백엔드 멀티파트 요구 충족)
    if (formData.file) {
      data.append('file', formData.file);
    } else {
      const defaultFile = new File(
        [''],
        "You don't need to download.zip",
        { type: 'application/zip' }
      );
      data.append('file', defaultFile);
    }

    // 2) 기본 챌린지 데이터
    const challengeData = {
      title: formData.title,
      description: formData.description,
      flag: formData.flag,
      points: formData.points,
      minPoints: formData.minPoints,
      initialPoints: formData.initialPoints || formData.points, // 없으면 points 사용
      startTime: `${formData.date} ${formData.time}:00`,
      endTime: `${formData.date} ${formData.time}:00`,
      url: formData.url,
      category: formData.category,
    };

    // 3) SIGNATURE 전용: club 필수
    if (formData.category === 'SIGNATURE') {
      const club = (formData.club || formData.clubName || '').trim();
      if (!club) {
        throw new Error('SIGNATURE 카테고리는 club(팀명)이 필수입니다.');
      }
      challengeData.club = club; // ← DTO 필드명에 맞춤
    }

    // 4) JSON 파트 추가
    const challengeBlob = new Blob([JSON.stringify(challengeData)], {
      type: 'application/json',
    });
    data.append('challenge', challengeBlob);

    // 5) 요청 (Axios 인터셉터가 FormData면 Content-Type 자동 처리)
    const response = await Axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
