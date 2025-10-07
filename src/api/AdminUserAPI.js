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