import { Axios } from "./Axios";
export async function fetchTeamProfileRows() {
  try {
    const { data } = await Axios.get('/admin/team/all'); // <- 선행 슬래시 권장
    const list = Array.isArray(data?.data) ? data.data : [];

    // 서버가 멤버 이메일을 주지 않는 형태이면 memberEmail은 null로 채움
    return list.map((t) => ({
      teamName: t.teamName ?? '-',
      memberEmail: t.memberEmail ?? null,       // 없으면 null
      teamMileage: t.teamMileage ?? 0,
      teamTotalPoint: t.teamTotalPoint ?? 0,
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
