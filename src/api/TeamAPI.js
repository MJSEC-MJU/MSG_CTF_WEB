import { Axios } from "./Axios";
export async function fetchTeamProfileRows() {
   try {
     const { data } = await Axios.get(`/team/all`);
     const p = data?.data;
     if (!p) return [];
     const members = Array.isArray(p.memberEmail)
       ? p.memberEmail
       : (p.memberEmail ? [p.memberEmail] : []);
     return members.map((email) => ({
       teamName: p.teamName,
       memberEmail: email,
       teamMileage: p.teamMileage,
       teamTotalPoint: p.teamTotalPoint,
     }));
   } catch (e) {
     console.error('[TeamAPI] fetchTeamProfileRows failed:', e);
     return []; // 실패해도 빈 배열로 처리해 UI는 뜨게
   }
 }

export async function createTeam(teamName) {
  const { data } = await Axios.post(`/admin/team/create`, null, { params: { teamName } });
  return data;
}

export async function addTeamMember(teamName, email) {
  const { data } = await Axios.post(`/admin/team/member/${encodeURIComponent(teamName)}`, null, { params: { email } });
  return data;
}
