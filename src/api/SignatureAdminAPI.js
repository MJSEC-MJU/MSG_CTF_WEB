// src/api/SignatureAdminAPI.js
// 관리자 전용 시그니처 코드 풀 관리 API (Axios 인스턴스 사용)
// baseURL은 Axios.js에서 `${VITE_API_URL}/api` 또는 프록시 "/api"로 설정되어 있어야 함.

import { Axios } from "./Axios";

// 1) 코드 일괄 업서트 (JSON 배열)
export async function adminBulkUpsert(items /* Array<UpsertRequest> */) {
  const { data } = await Axios.post("/admin/signature/codes/bulk", items);
  return data; // { code, message, data: { upserted } }
}

// 2) CSV 임포트
export async function adminImportCSV(file /* File */) {
  const form = new FormData();
  form.append("file", file, file.name);
  const { data } = await Axios.post("/admin/signature/codes/import", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { code, message, data: { imported } }
}

// 3) CSV 익스포트 (다운로드)
export async function adminExportCSV() {
  const resp = await Axios.get("/admin/signature/codes/export", {
    responseType: "blob",
    headers: { Accept: "text/csv" },
  });

  // 파일명 추출 (있으면 사용)
  let filename = "signature_codes.csv";
  const dispo = resp.headers?.["content-disposition"];
  if (dispo) {
    const m = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(dispo);
    if (m?.[1]) filename = decodeURIComponent(m[1].replace(/"/g, ""));
  }
  return { blob: resp.data, filename };
}

// 4) 코드 풀 조회 (챌린지별 현황)
export async function adminGetPool(challengeId) {
  const { data } = await Axios.get(`/admin/signature/codes/challenge/${challengeId}`);
  return data; // { challengeId, items: PoolItem[] }
}

// 5) 랜덤 코드 생성
export async function adminGenerate({ challengeId, count, teamName }) {
  const { data } = await Axios.post("/admin/signature/codes/generate", {
    challengeId,
    count,
    teamName,
  });
  return data; // { challengeId, assignedTeamId, created, codes: string[] }
}

// 6) 코드 재배정 / 소비상태 초기화
export async function adminReassign({ challengeId, codeDigest, teamName, resetConsumed }) {
  const { data } = await Axios.post("/admin/signature/codes/reassign", {
    challengeId,
    codeDigest,
    teamName,
    resetConsumed,
  });
  return data; // { code, message }
}

// 7) 단건 삭제
export async function adminDeleteOne(challengeId, codeDigest) {
  const { data } = await Axios.delete(
    `/admin/signature/codes/${challengeId}/${codeDigest}`
  );
  return data; // { code, message }
}

// 8) 챌린지 전체 코드 제거
export async function adminPurgeChallenge(challengeId) {
  const { data } = await Axios.delete(`/admin/signature/codes/challenge/${challengeId}`);
  return data; // { code, message, data: { deleted } }
}

// 9) 강제 언락
export async function adminForceUnlock({ teamName, challengeId }) {
  const { data } = await Axios.post("/admin/signature/unlock/force", {
    teamName,
    challengeId,
  });
  return data; // { code, message }
}
