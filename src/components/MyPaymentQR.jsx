import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { fetchPaymentQRToken, buildPaymentQRString } from '../api/PaymentAPI';

/**
 * @param {{ myLoginId?: string }} props
 * myLoginId는 세션/전역 상태에서 받아서 넘겨줘도 되고,
 * 빈 값이면 서버가 준 loginId를 후순위로 사용.
 */
const MyPaymentQR = ({ myLoginId }) => {
  const [qrValue, setQrValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const issueQR = async () => {
    setErr('');
    setLoading(true);
    try {
      const tokenInfo = await fetchPaymentQRToken();
      const token   = tokenInfo?.token;
      const expiry  = tokenInfo?.expiry;
      const qrLogin = (myLoginId || tokenInfo?.loginId || '').trim();

      if (!token || !qrLogin) {
        throw new Error('토큰 또는 로그인 ID가 없습니다.');
      }

      const qr = buildPaymentQRString({ token, expiry, loginId: qrLogin });
      setQrValue(qr);
    } catch (e) {
      setErr(e?.message || 'QR 생성 중 오류');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    issueQR();
    // myLoginId가 바뀌면 새로 발급하고 싶다면 의존성에 넣어도 됨.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>내 결제 QR</h3>
      {loading && <p>발급 중…</p>}
      {err && <p style={{ color: 'red' }}>{err}</p>}

      {qrValue && (
        <>
          <div style={{ background: '#fff', padding: 12, display: 'inline-block' }}>
            <QRCode value={qrValue} size={192} includeMargin />
          </div>
          <p style={{ marginTop: 8, fontSize: 12, color: '#555', wordBreak: 'break-all' }}>
            {qrValue}
          </p>

          <button onClick={issueQR} style={{ marginTop: 8 }}>
            재발급
          </button>
        </>
      )}
    </div>
  );
};

export default MyPaymentQR;
