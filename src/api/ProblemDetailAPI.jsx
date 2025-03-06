import Cookies from "js-cookie";

export const fetchProblemDetail = async (challengeId) => {
  try {
    const token = Cookies.get("accessToken"); // 토큰 가져오기
    if (!token) throw new Error("로그인이 필요합니다.");

    const response = await fetch(`/api/challenges/${challengeId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 400) throw new Error("문제를 찾을 수 없습니다.");
      else throw new Error("문제 데이터를 불러오는 중 오류 발생");
    }

    const data = await response.json();
    return data.data;
  } catch (err) {
    throw new Error(err.message);
  }
};