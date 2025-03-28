import Cookies from "js-cookie";

export const fetchAdminMembers = async () => {
  try {
    const token = Cookies.get("accessToken"); 
    const response = await fetch("/api/admin/member", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Authorization 헤더에 JWT 토큰 추가
      },
    });

    if (response.status === 200) {
      return await response.json(); // 성공 시 JSON 반환
    } else if (response.status === 403) {
      //console.error("Access Denied: 관리자 권한이 필요합니다.");
      return null;
    } else {
      //console.error("Server Error");
      return null;
    }
  } catch (error) {
    //console.error("Network Error", error);
    return null;
  }
};