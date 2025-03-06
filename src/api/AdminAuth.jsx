import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const AdminAuth = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateAdmin = async () => {
      try {
        const token = Cookies.get("accessToken"); // 쿠키에서 JWT 토큰 가져오기

        if (!token) {
          console.log("토큰없음");
          setError("No token found");
          navigate("/login"); // 토큰이 없으면 로그인 페이지로 이동
          return;
        }

        const response = await fetch("/api/admin/validate", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Authorization 헤더에 JWT 토큰 추가
          },
        });
        const text = await response.text();
        if (text.trim() === "admin") {
          console.log("인증성공")
          // 인증 성공 시, 페이지 이동
          setLoading(false); // 정상적으로 로딩을 끝내고, 자식 컴포넌트 렌더링
        } else {
          // 접근권한없음
          alert("접근권한 없음!!");
          setError("Server Error");
          navigate("/login");
        }
      } catch (err) {
        console.log("네트워크 오류");
        setError("Network Error");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    validateAdmin();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return children; // 인증이 완료되면 자식 요소(Admin Page)를 렌더링
};

export default AdminAuth;
