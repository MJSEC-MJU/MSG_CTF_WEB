import Cookies from 'js-cookie';

export const updateProblem = async (challengeId, formData) => {
  const token = Cookies.get("accessToken"); 

  if (!token) {
    throw new Error("토큰이 없습니다. 로그인이 필요합니다.");
  }

  try {
    const response = await fetch(`/api/admin/update/challenge/${challengeId}`, {
      method: "PUT",
      headers: {
        "Content-Type" : "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData, // form-data 전송 
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // console.error("문제 수정 실패:", error);
    throw error;
  }
};