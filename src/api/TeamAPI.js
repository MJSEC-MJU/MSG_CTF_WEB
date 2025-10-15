import { Axios } from "./Axios";
export async function fetchTeamProfileRows() {
  try {
    const { data } = await Axios.get('/admin/team/all');
    const list = Array.isArray(data?.data) ? data.data : [];

    //팀 단위 유지 
    return list.map((t) => ({
      teamName: t.teamName ?? '-',
      teamMileage: t.teamMileage ?? 0,
      teamTotalPoint: t.teamTotalPoint ?? 0,
      // 서버가 memberEmails 배열로 주므로 그대로 보존
      memberEmails: Array.isArray(t.memberEmails)
        ? t.memberEmails
        // 과거 호환(혹시 단수/다른 키가 오는 경우)
        : Array.isArray(t.memberEmail) ? t.memberEmail
        : (t.memberEmail ? [t.memberEmail] : []),
    }));
  } catch (e) {
    console.error('[TeamAPI] fetchTeamProfileRows failed:', e);
    return [];
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
