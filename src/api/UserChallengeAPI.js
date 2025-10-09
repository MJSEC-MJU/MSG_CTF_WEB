import { Axios } from './Axios';
import Cookies from 'js-cookie';
import { dummySolved } from '/src/mock/problems'; // 더미데이터

const API_URL = "/users/challenges";

export const fetchSolvedChallenges = async () => {
  const USE_MOCK = false; // 개발 중 true, 실제 서버 모드 false

  if (USE_MOCK) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummySolved);
      }, 200);
    });
  }


  // 실제 API 호출 부분.
  try {
    const token = Cookies.get("accessToken");  // 토큰 가져오기
    const response = await Axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("푼 문제 API 응답:", response.data); // 응답 데이터 확인
    
    if (response.data.code === "SUCCESS") {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "데이터를 불러오는 데 실패했습니다.");
    }
  } catch (error) {
    //console.error("푼 문제 목록을 불러오는 중 오류 발생:", error);
    return [];
  }
};