import { Axios } from "./Axios";
export async function fetchTeamProfileRows() {
   try {
     const { data } = await Axios.get(`/team/profile`);
     const p = data?.data;
     if (!p) return [];
     const members = Array.isArray(p.memberEmail)
       ? p.memberEmail
       : (p.memberEmail ? [p.memberEmail] : []);
     return members.map((email) => ({
       teamId: p.teamId,
       teamName: p.teamName,
       userEmail: p.userEmail,
       memberEmail: email,
       teamMileage: p.teamMileage,
       teamTotalPoint: p.teamTotalPoint,
       teamSolvedCount: p.teamSolvedCount,
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
