import axios from 'axios';
import Cookies from "js-cookie";

const API_URL = '/api/admin/create/challenge'; 
const token = Cookies.get("accessToken");

export const createProblem = async (formData) => {
  try {
    const data = new FormData();
    data.append('file', formData.file); // 파일 추가

    const challengeData = {
      title: formData.title,
      description: formData.description,
      flag: formData.flag,
      points: formData.points,
      minPoints: formData.minPoints,
      initialPoints: formData.points, // API 예시에서 기본값으로 설정됨
      startTime: `${formData.date} ${formData.time}:00`,
      endTime: `${formData.date} ${formData.time}:00`,
      url: formData.url,
    };
    
    const challengeBlob = new Blob([JSON.stringify(challengeData)], { type: 'application/json' });
    data.append('challenge', challengeBlob);

    const response = await axios.post(API_URL, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating problem:', error);
    throw error;
  }
};