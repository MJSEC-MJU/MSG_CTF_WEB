import { Axios } from './Axios';
import Cookies from "js-cookie";

export const fetchProblemDetail = async (challengeId) => {
  try {
    const token = Cookies.get("accessToken"); // 토큰 가져오기
    if (!token) throw new Error("로그인이 필요합니다.");

    const response = await Axios.get(`/challenges/${challengeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "문제 데이터를 불러오는 중 오류 발생");
  }
};
