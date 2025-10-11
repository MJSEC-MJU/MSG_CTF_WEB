export async function fetchServerTime() {
  try {
    const token = Cookies.get("accessToken");  // 토큰 가져오기
    const response = await Axios.get(`api/server-time`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("푼 문제 API 응답:", response); // 응답 데이터 확인
    return response;
  } catch (e) {
    console.error('[ServerTimeAPI] fetchServerTime failed:', e);
    throw e; // 호출한 쪽에서 에러를 처리할 수 있도록 에러를 다시 던짐
  }
}