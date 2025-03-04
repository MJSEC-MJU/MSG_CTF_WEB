import Cookies from "js-cookie";

const DeleteUser = async (userId) => {
  const token = Cookies.get("accessToken"); 

  if (!token) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    const response = await fetch(`/api/admin/delete/member/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.status === 200) {
      alert("회원 삭제 성공");
      return true; // 성공 시 true 반환
    } else {
      alert(data.message || "회원 삭제 실패");
      return false;
    }
  } catch (error) {
    alert("서버 오류 발생");
    return false;
  }
};

export default DeleteUser;