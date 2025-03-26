import { Axios } from './Axios';
import Cookies from "js-cookie";

const API_URL = '/admin/create/challenge'; 
const token = Cookies.get("accessToken");

export const createProblem = async (formData) => {
  try {
    const data = new FormData();

    if (formData.file) {
      data.append('file', formData.file); // 사용자가 업로드한 파일 추가
    } else {
      // 기본 파일
      const defaultFile = new File([""], "You don't need to download.zip", { type: "application/zip" });
      data.append('file', defaultFile);
    }

    const challengeData = {
      title: formData.title,
      description: formData.description,
      flag: formData.flag,
      points: formData.points,
      minPoints: formData.minPoints,
      initialPoints: formData.points,
      startTime: `${formData.date} ${formData.time}:00`,
      endTime: `${formData.date} ${formData.time}:00`,
      url: formData.url,
      category: formData.category,
    };

    const challengeBlob = new Blob([JSON.stringify(challengeData)], { type: 'application/json' });
    data.append('challenge', challengeBlob);

    const response = await Axios.post(API_URL, data, {
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
