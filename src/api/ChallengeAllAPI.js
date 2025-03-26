import { Axios } from './Axios';
import Cookies from "js-cookie";
const API_BASE_URL = "/challenges/all";

export const fetchProblems = async (page = 0, size = 12) => {
  try {
     const token = Cookies.get("accessToken"); 
    if (!token) {
      throw new Error("토큰이 없습니다. 로그인 후 시도하세요.");
    }

    const response = await Axios.get(API_BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        size,
      },
    });
    console.log("API 응답:", response.data);

    if (response.data.code !== "SUCCESS") {
      throw new Error("문제 데이터를 가져오는 데 실패했습니다.");
    }

    return {
      problems:response.data.data.content,// 문제 리스트 반환
      totalPages: response.data.data.totalPages, // 총 페이지 수 추가
      }
  } catch (error) {
    console.error("문제 조회 API 호출 중 오류 발생:", error);
    return{ problems: [], totalPages: 1 };
  }
};