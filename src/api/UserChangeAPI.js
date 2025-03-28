import Cookies from 'js-cookie';

export const updateUser = async (userId, updatedData) => {
  try {
    const token = Cookies.get("accessToken"); 
    const response = await fetch(`/api/admin/change/member/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json(); // 업데이트된 유저 정보 반환
  } catch (error) {
    // console.error("사용자 정보 업데이트 실패:", error);
    throw error;
  }
};