import React, { useEffect, useState } from 'react';
import QrScanner from 'react-qr-scanner';
import { checkoutWithMileage } from '../api/PaymentAPI';

/** 다양한 라이브러리/환경에서 오는 스캔 payload에서 텍스트만 뽑아내기 */
const extractQRText = (payload) => {
  if (!payload) return null;

  // 문자열로 오는 경우
  if (typeof payload === 'string') {
    // 일부 환경에서 카메라 프레임 blob: URL이 들어오므로 무시
    if (payload.startsWith('blob:')) return null;
    return payload;
  }

  // 객체로 오는 경우 흔한 필드들
  if (payload.text && typeof payload.text === 'string') return payload.text;
  if (payload.data && typeof payload.data === 'string') return payload.data;
  if (payload.rawValue && typeof payload.rawValue === 'string') return payload.rawValue;
  if (payload.result?.text && typeof payload.result.text === 'string') return payload.result.text;

  return null;
};

const PaymentProcessor = () => {
  const [qrInput, setQrInput] = useState('');
  const [mileageAmount, setMileageAmount] = useState('');
  const [loginId, setLoginId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showScanner, setShowScanner] = useState(false);

  // 🔧 디버그 패널 상태(스캔 raw/텍스트/파싱 미리보기)
  const [debug, setDebug] = useState(false);
  const [lastRaw, setLastRaw] = useState('');
  const [lastText, setLastText] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);

  // 📷 카메라 선택/전환 (후면 기본)
  const [useRear, setUseRear] = useState(true);      // true면 후면, false면 전면
  const [deviceId, setDeviceId] = useState(null);    // 특정 카메라를 정확히 지정
  const [devices, setDevices] = useState([]);        // 비디오 입력 목록

  // ✅ QR 데이터 파싱: pay+ctf://checkout?token=...&exp=...&loginId=...
  const parseQRData = (qrString) => {
    try {
      const url = new URL(qrString.replace('pay+ctf://', 'https://'));
      const token   = url.searchParams.get('token');
      const exp     = url.searchParams.get('exp');
      const qrLogin = url.searchParams.get('loginId')
        || url.searchParams.get('loginid')
        || url.searchParams.get('uid')
        || '';

      if (!token) {
        throw new Error('유효하지 않은 QR 코드입니다.');
      }

      if (exp) {
        const expireTime = new Date(exp);
        const now = new Date();
        if (now > expireTime) {
          throw new Error('만료된 QR 코드입니다.');
        }
      }

      return { token, expiry: exp || null, loginId: (qrLogin || '').trim() || null };
    } catch (error) {
      throw new Error('QR 코드 형식이 올바르지 않습니다: ' + error.message);
    }
  };

  // ▶ 스캐너 열렸을 때 카메라 목록 조회 & 후면 추정 선택
  useEffect(() => {
    if (!showScanner || !navigator.mediaDevices?.enumerateDevices) return;

    navigator.mediaDevices.enumerateDevices()
      .then((list) => {
        const cams = list.filter(d => d.kind === 'videoinput');
        setDevices(cams);

        // 권한이 있어야 라벨이 보일 수 있음. 보이면 후면 추정
        const rear = cams.find(d => /back|rear|environment/i.test(d.label));
        if (rear) setDeviceId(rear.deviceId);
      })
      .catch(() => {
        // ignore
      });
  }, [showScanner]);

  // QR 스캔 성공 핸들러 (연속 호출됨)
  const handleScan = (incoming) => {
    // raw payload를 디버그용으로 저장
    try {
      setLastRaw(typeof incoming === 'string' ? incoming : JSON.stringify(incoming));
    } catch {
      setLastRaw(String(incoming));
    }

    const text = extractQRText(incoming);
    if (!text) return; // blob 프레임 등은 무시, 실제 텍스트가 들어왔을 때만 진행
    setLastText(text);

    try {
      const parsed = parseQRData(text);
      setParsedPreview(parsed);

      setQrInput(text);
      if (parsed.loginId) setLoginId(parsed.loginId); // ✅ QR에 있으면 자동 채움
      setShowScanner(false);
      setMessage({ type: 'success', text: 'QR 코드 스캔 완료!' });
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
      setShowScanner(false);
    }
  };

  // QR 스캔 에러 핸들러
  const handleError = (err) => {
    console.error('QR Scanner Error:', err);
    setMessage({ type: 'error', text: '카메라 접근 오류가 발생했습니다.' });
  };

  const handlePayment = async () => {
    setMessage({ type: '', text: '' });

    if (!qrInput.trim()) {
      setMessage({ type: 'error', text: 'QR 데이터를 입력하세요.' });
      return;
    }
    if (!mileageAmount || Number(mileageAmount) <= 0) {
      setMessage({ type: 'error', text: '유효한 마일리지 금액을 입력하세요.' });
      return;
    }

    setProcessing(true);

    try {
      // ✅ QR 데이터에서 토큰/로그인ID 추출
      const parsed = parseQRData(qrInput);
      const paymentToken = parsed.token;
      const finalLoginId = (parsed.loginId || loginId || '').trim();

      if (!finalLoginId) {
        throw new Error('로그인 ID가 없습니다. QR에 loginId를 포함하거나 직접 입력하세요.');
      }

      // 결제 처리
      const result = await checkoutWithMileage(
        paymentToken,
        Number(mileageAmount),
        finalLoginId
      );

      setMessage({
        type: 'success',
        text: result.message || '결제가 완료되었습니다.'
      });

      // 입력 필드 초기화
      setQrInput('');
      setMileageAmount('');
      setLoginId('');
      setLastText('');
      setParsedPreview(null);

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || '결제 처리 중 오류가 발생했습니다.'
      });
    } finally {
      setProcessing(false);
    }
  };

  // QrScanner에 줄 제약조건(후면 우선 → deviceId 있으면 정확 지정)
  const videoConstraints = {
    audio: false,
    video: deviceId
      ? { deviceId: { exact: deviceId } }
      : { facingMode: useRear ? { ideal: 'environment' } : { ideal: 'user' } }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>마일리지 결제 처리</h2>

      <div style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>QR 데이터</label>

          {showScanner ? (
            <div style={styles.scannerContainer}>
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: '100%' }}
                constraints={videoConstraints}
              />

              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <button
                  style={{ ...styles.button, backgroundColor: '#6c757d' }}
                  onClick={() => setUseRear(v => !v)}
                >
                  카메라 전환 ({useRear ? '후면' : '전면'})
                </button>

                {devices.length > 1 && (
                  <select
                    style={styles.select}
                    value={deviceId ?? ''}
                    onChange={(e) => setDeviceId(e.target.value || null)}
                  >
                    <option value="">자동 선택</option>
                    {devices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Camera ${d.deviceId.slice(0,4)}…`}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  style={{ ...styles.button, marginLeft: 'auto' }}
                  onClick={() => setShowScanner(false)}
                >
                  스캔 취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <textarea
                style={styles.textarea}
                value={qrInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setQrInput(v);
                  try {
                    const p = parseQRData(v);
                    if (p.loginId) setLoginId(p.loginId); // ✅ 붙여넣기 자동 파싱
                    setParsedPreview(p);
                    setLastText(v);
                  } catch (_) {
                    setParsedPreview(null);
                    setLastText('');
                  }
                }}
                placeholder="pay+ctf://checkout?token=xxx&exp=xxx&loginId=yourId"
                rows={3}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  style={{ ...styles.button, backgroundColor: '#28a745' }}
                  onClick={() => setShowScanner(true)}
                >
                  📷 카메라로 QR 스캔
                </button>
                <button
                  style={{ ...styles.button, backgroundColor: '#6c757d' }}
                  onClick={() => setDebug((v) => !v)}
                >
                  디버그 {debug ? 'ON' : 'OFF'}
                </button>
                <button
                  style={{ ...styles.button, backgroundColor: '#17a2b8' }}
                  onClick={() => {
                    const text = lastText || qrInput;
                    if (text) navigator.clipboard.writeText(text);
                  }}
                  disabled={!lastText && !qrInput}
                >
                  복사(Decoded Text)
                </button>
              </div>
              <small style={styles.hint}>
                사용자의 QR 코드를 스캔하거나 데이터를 직접 입력하세요
              </small>

              {debug && (
                <div style={styles.debugPanel}>
                  <div><strong>raw</strong>: {lastRaw || '(none)'}</div>
                  <div style={{ marginTop: 6 }}>
                    <strong>decoded text</strong>: {lastText || qrInput || '(none)'}
                  </div>
                  {parsedPreview && (
                    <pre style={styles.pre}>
{JSON.stringify(parsedPreview, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>로그인 ID</label>
          <input
            style={styles.input}
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="예: MJSEC"
          />
          <small style={styles.hint}>
            QR에 <code>loginId</code>가 포함되어 있으면 자동으로 채워집니다.
          </small>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>사용할 마일리지</label>
          <input
            style={styles.input}
            type="number"
            value={mileageAmount}
            onChange={(e) => setMileageAmount(e.target.value)}
            placeholder="예: 50"
            min="1"
          />
        </div>

        {message.text && (
          <div style={{
            ...styles.message,
            ...(message.type === 'error' ? styles.errorMessage : styles.successMessage)
          }}>
            {message.text}
          </div>
        )}

        <button
          style={{
            ...styles.button,
            ...(processing ? styles.buttonDisabled : {})
          }}
          onClick={handlePayment}
          disabled={processing}
        >
          {processing ? '처리 중...' : '결제 처리'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#555',
  },
  input: {
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
  },
  textarea: {
    padding: '10px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    fontFamily: 'monospace',
    resize: 'vertical',
  },
  scannerContainer: {
    border: '2px solid #007bff',
    borderRadius: '8px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
  },
  select: {
    padding: 8,
    border: '1px solid #ddd',
    borderRadius: 4,
    background: '#fff',
  },
  hint: {
    fontSize: '12px',
    color: '#888',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  message: {
    padding: '12px',
    borderRadius: '4px',
    fontSize: '14px',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
  },
  debugPanel: {
    marginTop: 12,
    padding: 12,
    border: '1px dashed #999',
    borderRadius: 6,
    background: '#f7f7f7',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: 12,
    color: '#333',
    wordBreak: 'break-all',
  },
  pre: {
    marginTop: 6,
    padding: 8,
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: 6,
    overflowX: 'auto',
  },
};

export default PaymentProcessor;
