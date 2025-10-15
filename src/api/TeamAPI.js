import { Axios } from "./Axios";
export async function fetchTeamProfileRows() {
    const { data } = await Axios.get('/admin/team/all');

    const list = Array.isArray(data?.data) ? data.data : [];

    // 팀 1개에 memberEmails 배열 → 행 여러 개로 펼치기
    const rows = list.flatMap((t) => {
      // 호환성: memberEmails(복수) 우선, 그다음 memberEmail(단수/배열), 없으면 빈 배열
      const emails =
        Array.isArray(t.memberEmails) ? t.memberEmails
        : Array.isArray(t.memberEmail) ? t.memberEmail
        : (t.memberEmail ? [t.memberEmail] : []);

      // 멤버가 없으면 memberEmail=null로 1행 만들어서 표시(‘-’로 렌더)
      if (emails.length === 0) {
        return [{
          teamName: t.teamName ?? '-',
          memberEmail: null,
          teamMileage: t.teamMileage ?? 0,
          teamTotalPoint: t.teamTotalPoint ?? 0,
        }];
      }

      // 멤버가 있으면 멤버 수만큼 행 생성
      return emails.map((email) => ({
        teamName: t.teamName ?? '-',
        memberEmail: email,
        teamMileage: t.teamMileage ?? 0,
        teamTotalPoint: t.teamTotalPoint ?? 0,
      }));
    });

    return rows;
}

export async function createTeam(teamName) {
  const { data } = await Axios.post(`/admin/team/create`, null, { params: { teamName } });
  return data;
}

export async function addTeamMember(teamName, email) {
  const { data } = await Axios.post(`/admin/team/member/${encodeURIComponent(teamName)}`, null, { params: { email } });
  return data;
}
