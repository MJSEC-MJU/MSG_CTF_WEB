import { Axios } from "./Axios";

/**
 * QR 발급용 토큰 생성 API 호출
 * POST /api/payment/qr-token
 * @returns {Promise<Object>} 결제 토큰 정보
 * {
 *   paymentTokenId: number,
 *   token: string,
 *   loginId: string,
 *   expiry: string (ISO 8601),
 *   createdAt: string (ISO 8601)
 * }
 */
export const fetchPaymentQRToken = async () => {
  try {
    const response = await Axios.post("/payment/qr-token");

    if (response.data?.code === "SUCCESS" && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "QR 토큰 발급 실패");
  } catch (error) {
    console.error("Payment QR Token API Error:", error);
    throw error;
  }
};

/**
 * 마일리지 기반 결제 API 호출
 * POST /api/payment/checkout
 * @param {string} paymentToken - QR 토큰
 * @param {number} mileageUsed - 사용할 마일리지
 * @param {string} loginId - 사용자 로그인 ID
 * @returns {Promise<Object>} 결제 결과
 */
export const checkoutWithMileage = async (paymentToken, mileageUsed, loginId) => {
  try {
    const response = await Axios.post("/payment/checkout", null, {
      params: {
        paymentToken,
        mileageUsed,
        loginId,
      },
    });

    if (response.data?.code === "SUCCESS") {
      return response.data;
    }

    throw new Error(response.data?.message || "결제 실패");
  } catch (error) {
    console.error("Payment Checkout API Error:", error);
    throw error;
  }
};

/**
 * ✅ QR 스킴 문자열 생성기
 * pay+ctf://checkout?token={token}&exp={expiry}&loginId={loginId}
 */
export const buildPaymentQRString = ({ token, expiry, loginId }) => {
  const u = new URL("https://placeholder/checkout");
  if (token) u.searchParams.set("token", token);
  if (expiry) u.searchParams.set("exp", expiry);
  if (loginId) u.searchParams.set("loginId", loginId);

  return u.toString().replace("https://placeholder", "pay+ctf://");
};

/**
 * 현재 팀의 결제 히스토리 조회 API (사용자용)
 * GET /api/payment/history
 * @returns {Promise<Array>} 결제 히스토리 배열
 */
export const fetchPaymentHistory = async () => {
  try {
    const response = await Axios.get("/payment/history");

    if (response.data?.code === "SUCCESS" && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "결제 히스토리 조회 실패");
  } catch (error) {
    console.error("Payment History API Error:", error);
    throw error;
  }
};

/**
 * 모든 팀의 결제 히스토리 조회 API (관리자용)
 * GET /api/admin/payment/history
 * @returns {Promise<Array>} 전체 결제 히스토리 배열
 */
export const fetchAllPaymentHistory = async () => {
  try {
    const response = await Axios.get("/admin/payment/history");

    if (response.data?.code === "SUCCESS" && response.data?.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || "전체 결제 히스토리 조회 실패");
  } catch (error) {
    console.error("Admin Payment History API Error:", error);
    throw error;
  }
};

/**
 * 결제 철회(환불) API (관리자용)
 * DELETE /api/admin/payment/refund/{paymentHistoryId}
 * @param {number} paymentHistoryId - 결제 히스토리 ID
 * @returns {Promise<Object>} 환불 결과
 */
export const refundPayment = async (paymentHistoryId) => {
  try {
    const response = await Axios.delete(`/admin/payment/refund/${paymentHistoryId}`);

    if (response.data?.code === "SUCCESS") {
      return response.data;
    }

    throw new Error(response.data?.message || "결제 환불 실패");
  } catch (error) {
    console.error("Payment Refund API Error:", error);
    throw error;
  }
};

/**
 * 팀에 마일리지 부여 API (관리자용)
 * POST /api/admin/team/mileage/{teamName}
 * @param {string} teamName - 팀 이름
 * @param {number} mileage - 부여할 마일리지
 * @returns {Promise<Object>} 마일리지 부여 결과
 */
export const grantMileageToTeam = async (teamName, mileage) => {
  try {
    const response = await Axios.post(`/admin/team/mileage/${encodeURIComponent(teamName)}`, {
      mileage,
    });

    if (response.data?.code === "SUCCESS") {
      return response.data;
    }

    throw new Error(response.data?.message || "마일리지 부여 실패");
  } catch (error) {
    console.error("Grant Mileage API Error:", error);
    throw error;
  }
};
