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
