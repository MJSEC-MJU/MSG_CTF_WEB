import { Axios } from "./Axios";
export async function fetchTeamProfileRows() {
  try {
    const { data } = await Axios.get('/admin/team/all');

    // case A: data.data가 배열(여러 팀)
    if (Array.isArray(data?.data)) {
      return data.data.map((t) => ({
        teamName: t.teamName ?? '-',
        memberEmail: t.memberEmail ?? null,
        teamMileage: t.teamMileage ?? 0,
        teamTotalPoint: t.teamTotalPoint ?? 0,
        teamSolvedCount: t.teamSolvedCount ?? 0,
      }));
    }

    // case B: data.data가 단일 팀 객체 + memberEmail(배열/단일/없음)
    const p = data?.data ?? {};
    const members = Array.isArray(p.memberEmail)
      ? p.memberEmail
      : (p.memberEmail ? [p.memberEmail] : [null]);

    return members.map((email) => ({
      teamName: p.teamName ?? '-',
      memberEmail: email,
      teamMileage: p.teamMileage ?? 0,
      teamTotalPoint: p.teamTotalPoint ?? 0,
      teamSolvedCount: p.teamSolvedCount ?? 0,
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
