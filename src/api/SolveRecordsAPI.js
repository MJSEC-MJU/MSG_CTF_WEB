import { Axios } from "./Axios";

/**
 * 전체 문제의 제출 기록 조회 API (관리자용)
 * GET /api/admin/challenge/solve-records
 * @returns {Promise<Array>} 전체 제출 기록 배열
 * [
 *   {
 *     historyId: number,
 *     challengeId: number,
 *     challengeTitle: string,
 *     loginId: string,
 *     teamName: string,
 *     teamId: number,
 *     univ: string,
 *     solvedTime: string (ISO 8601),
 *     pointsAwarded: number,
 *     mileageAwarded: number,
 *     mileageBonus: number,
 *     isFirstBlood: boolean
 *   }
 * ]
 */
export const fetchAllSolveRecords = async () => {
  try {
    const response = await Axios.get("/admin/challenge/solve-records");

    // 백엔드가 배열을 직접 반환하는 경우
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // 백엔드가 { code: "SUCCESS", data: [...] } 형태로 반환하는 경우
    if (response.data?.code === "SUCCESS" && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "제출 기록 조회 실패");
  } catch (error) {
    // console.error("Fetch All Solve Records API Error:", error);
    throw error;
  }
};

/**
 * 특정 문제의 제출 기록 조회 API (관리자용)
 * GET /api/admin/challenge/{challengeId}/solve-records
 * @param {number} challengeId - 문제 ID
 * @returns {Promise<Array>} 해당 문제의 제출 기록 배열
 */
export const fetchSolveRecordsByChallenge = async (challengeId) => {
  try {
    const response = await Axios.get(`/admin/challenge/${challengeId}/solve-records`);

    // 백엔드가 배열을 직접 반환하는 경우
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // 백엔드가 { code: "SUCCESS", data: [...] } 형태로 반환하는 경우
    if (response.data?.code === "SUCCESS" && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "문제 제출 기록 조회 실패");
  } catch (error) {
    // console.error("Fetch Solve Records By Challenge API Error:", error);
    throw error;
  }
};

/**
 * 특정 문제의 특정 사용자 제출 기록 철회 API (관리자용)
 * DELETE /api/admin/challenge/{challengeId}/solve-records/{loginId}
 * @param {number} challengeId - 문제 ID
 * @param {string} loginId - 사용자 로그인 ID
 * @returns {Promise<Object>} 철회 결과
 */
export const revokeSolveRecord = async (challengeId, loginId) => {
  try {
    const response = await Axios.delete(
      `/admin/challenge/${challengeId}/solve-records/${encodeURIComponent(loginId)}`
    );

    if (response.data?.code === "SUCCESS") {
      return response.data;
    }

    throw new Error(response.data?.message || "제출 기록 철회 실패");
  } catch (error) {
    // console.error("Revoke Solve Record API Error:", error);
    throw error;
  }
};

/**
 * 특정 사용자의 모든 제출 기록 삭제 API (관리자용)
 * DELETE /api/admin/challenge/solve-records/user/{loginId}
 * @param {string} loginId - 사용자 로그인 ID
 * @returns {Promise<Object>} 삭제 결과 및 삭제된 기록 수
 * {
 *   code: "SUCCESS",
 *   message: string,
 *   deletedCount: number
 * }
 */
export const deleteAllSolveRecordsByUser = async (loginId) => {
  try {
    const response = await Axios.delete(
      `/admin/challenge/solve-records/user/${encodeURIComponent(loginId)}`
    );

    if (response.data?.code === "SUCCESS") {
      return response.data;
    }

    throw new Error(response.data?.message || "사용자 제출 기록 삭제 실패");
  } catch (error) {
    // console.error("Delete All Solve Records By User API Error:", error);
    throw error;
  }
};
