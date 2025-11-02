import { Axios } from "./Axios";

// GET /api/admin/member
export async function fetchAdminMembers() {
  const { data } = await Axios.get(`/admin/member`);
  return data; // array or { code,message,data }
}

// DELETE /api/admin/delete/member/{userId}
export async function deleteUser(userId) {
  const resp = await Axios.delete(`/admin/delete/member/${userId}`);
  if (resp.status === 200) {
    return { code: 'SUCCESS', ...(resp.data || {}) };
  }
  return resp.data;
}

// PUT /api/admin/change/member/{userId}
export async function updateUser(userId, payload) {
  const { data } = await Axios.put(`/admin/change/member/${userId}`, payload);
  return data; // updated user object or { code,message,data }
}
// POST /api/admin/add/member
export async function addUser(payload) {
  const resp = await Axios.post(`/admin/add/member`, payload);
  // 서버 응답 형태에 따라 정규화
  if (resp.status === 200 || resp.status === 201) {
    return { code: 'SUCCESS', ...(resp.data || {}) };
  }
  return resp.data;
}

// PUT /api/admin/member/{userId}/early-exit
export async function toggleEarlyExit(userId) {
  const resp = await Axios.put(`/admin/member/${userId}/early-exit`);
  if (resp.status === 200) {
    return { code: 'SUCCESS', ...(resp.data || {}) };
  }
  return resp.data;
}