import { Axios } from "./Axios"; // 경로는 프로젝트 구조에 맞게 조정


/** 언락된 챌린지 목록 조회
* GET /api/signature/unlocked
* -> { teamId: number, challengeIds: number[] }
*/
export async function fetchUnlockedList() {
const { data } = await Axios.get("/signature/unlocked");
return data;
}


/** 특정 챌린지 언락 상태 단건 조회
* GET /api/signature/{challengeId}/status
* -> { unlocked: boolean, teamId: number, challengeId: number }
*/
export async function fetchUnlockStatus(challengeId) {
const { data } = await Axios.get(`/signature/${challengeId}/status`);
return data;
}


/** 시그니처 코드 제출 (6자리)
* POST /api/signature/{challengeId}/check
* body: { signature: string }
* 성공 예: { code: "SUCCESS", message: "성공" }
*/
export async function submitSignatureCode(challengeId, signature) {
const { data } = await Axios.post(`/signature/${challengeId}/check`, { signature });
// 응답 정규화: 관리자 API와 유사하게 code 필드가 있으면 SUCCESS 확인
if (data?.code && data.code !== "SUCCESS") {
const err = new Error(data?.message || "제출 실패");
err.response = { data };
throw err;
}
return data;
}