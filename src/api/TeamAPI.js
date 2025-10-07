import Axios from "./Axios";

export async function fetchTeamProfiles() {
const { data } = await Axios.get("/team/profile");
return data;
}


export async function createTeam(teamName) {
// POST /api/admin/team/create?teamName=
const { data } = await Axios.post(`/admin/team/create`, null, {
params: { teamName },
});
return data; // {code,message,...}
}


export async function addTeamMember(teamName, email) {
// POST /api/admin/team/member/{teamName}?email=
const { data } = await Axios.post(`/admin/team/member/${encodeURIComponent(teamName)}`, null, {
params: { email },
});
return data; // {code,message,...}
}