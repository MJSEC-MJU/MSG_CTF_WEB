import { Axios } from "./Axios";
export async function fetchTeamProfileRows() {
  try {
    const { data } = await Axios.get('/admin/team/all');
    const list = Array.isArray(data?.data) ? data.data : [];

    //팀 단위 유지
    return list.map((t) => ({
      teamId: t.teamId,
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
    // console.error('[TeamAPI] fetchTeamProfileRows failed:', e);
    return [];
  }
}
export async function fetchTeamProfile() {
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
    //  console.error('[TeamAPI] fetchTeamProfileRows failed:', e);
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

/**
 * 팀 히스토리 조회 API
 * GET /api/team/history
 * @returns {Promise<Array>} 팀의 문제 풀이 히스토리
 * [
 *   {
 *     teamId: number,
 *     teamName: string,
 *     challengeId: string,
 *     title: string,
 *     solvedTime: string,
 *     currentScore: number,
 *     solvedBy: string
 *   }
 * ]
 */
export async function fetchTeamHistory() {
  try {
    const { data } = await Axios.get('/team/history');

    // 배열을 직접 반환하는 경우
    if (Array.isArray(data)) {
      return data;
    }

    // { code: "SUCCESS", data: [...] } 형태로 반환하는 경우
    if (data?.code === "SUCCESS" && data?.data) {
      return data.data;
    }

    // data 필드가 있는 경우
    if (Array.isArray(data?.data)) {
      return data.data;
    }

    return [];
  } catch (e) {
    // console.error('[TeamAPI] fetchTeamHistory failed:', e);
    return [];
  }
}
