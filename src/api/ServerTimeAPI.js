import { Axios } from './Axios';

export async function fetchServerTime() {
  try {
    const response = await Axios.get("/server-time");
    console.log(response);
    return response;
  } catch (e) {
    console.error('[ServerTimeAPI] fetchServerTime failed:', e);
    throw e; // 호출한 쪽에서 에러를 처리할 수 있도록 에러를 다시 던짐
  }
}