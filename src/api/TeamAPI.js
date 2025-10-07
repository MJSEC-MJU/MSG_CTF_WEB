export async function fetchTeamProfileRows() {
  const { data } = await Axios.get(`/team/profile`);
  const p = data?.data; // { teamId, teamName, userEmail, memberEmail:[...], teamMileage, teamTotalPoint, teamSolvedCount }
  if (!p) return [];
  const members = Array.isArray(p.memberEmail) ? p.memberEmail : (p.memberEmail ? [p.memberEmail] : []);
  return members.map((email) => ({
    teamId: p.teamId,
    teamName: p.teamName,
    userEmail: p.userEmail,
    memberEmail: email,
    teamMileage: p.teamMileage,
    teamTotalPoint: p.teamTotalPoint,
    teamSolvedCount: p.teamSolvedCount,
  }));
}

export async function createTeam(teamName) {
  const { data } = await Axios.post(`/admin/team/create`, null, { params: { teamName } });
  return data;
}

export async function addTeamMember(teamName, email) {
  const { data } = await Axios.post(`/admin/team/member/${encodeURIComponent(teamName)}`, null, { params: { email } });
  return data;
}
