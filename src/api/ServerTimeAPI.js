import { Axios } from './Axios'; // 앞서 만든 공통 인스턴스 (baseURL = <VITE_API_URL>/api)

export async function fetchServerTime() {
  const { data } = await Axios.get('/server-time', { timeout: 8000 });
  return data; // { serverTime: "..." }
}