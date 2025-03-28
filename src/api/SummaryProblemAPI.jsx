const API_BASE_URL = "/api/admin"; 
import Cookies from "js-cookie";

//전체조회api
export const fetchProblems = async () => {
  const token = Cookies.get("accessToken"); // 내부에서 토큰 가져오기

  if (!token) {
    //console.error("토큰이 없습니다. 로그인이 필요합니다.");
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/challenge/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      throw new Error("인증 정보가 올바르지 않습니다.");
    }
    if (response.status === 403) {
      throw new Error("관리자 권한이 필요합니다.");
    }
    if (response.status === 500) {
      throw new Error("서버 내부 오류가 발생했습니다.");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    //console.error("Problem Fetch Error:", error);
    return [];
  }
};
//삭제api
export const deleteProblem = async (challengeId) => {
  const token = Cookies.get("accessToken");
  try {
    const responseD = await fetch(`${API_BASE_URL}/delete/challenge/${challengeId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    return await responseD.json();
  } catch (error) {
    //console.error("문제 삭제 오류:", error);
    return { code: "ERROR", message: "문제 삭제 실패" };
  }
};