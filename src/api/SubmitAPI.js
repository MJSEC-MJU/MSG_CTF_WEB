import Cookies from "js-cookie";
import { Axios } from "./Axios"; // baseURL: `${VITE_API_URL}/api` or "/api" (proxy)

export const submitFlag = async (challengeId, flag) => {
  // 토큰 없으면 바로 안내 (네 UI 정책 유지)
  const token = Cookies.get("accessToken");
  if (!token) return { error: "로그인이 필요합니다." };

  try {
    //  '/api' 붙이지 말 것: baseURL에 이미 '/api' 포함
    const { data } = await Axios.post(
      `/challenges/${challengeId}/submit`,
      { submitFlag: flag }
    );
    return data; // { code, message, data: "Correct" | "Submitted" | ... }
  } catch (error) {
    // Axios 인스턴스 에러 형식에 맞춰 반환
    if (error?.response?.data) return error.response.data;
    return { error: "서버 연결 오류" };
  }
};
