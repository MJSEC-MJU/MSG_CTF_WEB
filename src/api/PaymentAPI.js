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
