// src/pages/Admin/components/IpManagement/IpBanTab.jsx
// IP 차단 관리 탭 컴포넌트

import { useState, useEffect } from 'react';
import {
  fetchIpBans,
  fetchIpBanByAddress,
  createIpBan,
  unbanIp,
  extendIpBan,
  rebuildIpBanCache,
} from '../../../../api/IpBanAPI';

// Utility functions
const isIPv4 = (ip) =>
  /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/.test(ip || '');
const fmtDate = (s) => (s ? new Date(s).toLocaleString('ko-KR') : '-');

const IpBanTab = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    ipAddress: '',
    reason: '',
    banType: 'TEMPORARY',
    durationMinutes: '120',
  });
  const [extendVal, setExtendVal] = useState({});
  const [qIp, setQIp] = useState('');
  const [qRes, setQRes] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetchIpBans();
      setRows(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      alert('차단목록 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleCreate = async () => {
    if (!isIPv4(form.ipAddress)) return alert('올바른 IPv4를 입력하세요.');
    if (!form.reason.trim()) return alert('차단 사유를 입력하세요.');
    if (form.banType === 'TEMPORARY' && (!form.durationMinutes || Number(form.durationMinutes) < 1)) {
      return alert('임시 차단은 1분 이상이어야 합니다.');
    }
    try {
      const res = await createIpBan({
        ipAddress: form.ipAddress.trim(),
        reason: form.reason.trim(),
        banType: form.banType,
        durationMinutes: form.banType === 'TEMPORARY' ? Number(form.durationMinutes) : undefined,
      });
      alert(res?.message || '차단 성공');
      setForm({ ipAddress: '', reason: '', banType: 'TEMPORARY', durationMinutes: '120' });
      refresh();
    } catch (e) {
      alert(e?.response?.data?.message || '차단 실패');
    }
  };

  const handleUnban = async (ip) => {
    if (!window.confirm(`${ip} 차단 해제할까요?`)) return;
    try {
      const res = await unbanIp(ip);
      alert(res?.message || '해제 완료');
      refresh();
    } catch (e) {
      alert(e?.response?.data?.message || '해제 실패');
    }
  };

  const handleExtend = async (ip) => {
    const minutes = Number(extendVal[ip] || 60);
    if (!minutes || minutes < 1) return alert('1 이상 분을 입력하세요.');
    try {
      const res = await extendIpBan(ip, minutes);
      alert(res?.message || `연장 성공 (+${minutes}분)`);
      refresh();
    } catch (e) {
      alert(e?.response?.data?.message || '연장 실패');
    }
  };

  const handleQuery = async () => {
    if (!isIPv4(qIp)) return alert('IPv4를 입력하세요.');
    try {
      const res = await fetchIpBanByAddress(qIp.trim());
      setQRes(res?.data || null);
      if (!res?.data) alert(res?.message || '활성 차단이 없습니다.');
    } catch (e) {
      alert(e?.response?.data?.message || '조회 실패');
    }
  };

  const handleRebuild = async () => {
    if (!window.confirm('Redis 캐시를 재구축할까요?')) return;
    try {
      const res = await rebuildIpBanCache();
      alert(res?.message || '재구축 완료');
    } catch (e) {
      alert(e?.response?.data?.message || '재구축 실패');
    }
  };

  return (
    <div>
      <div className="card">
        <h3 className="card__title">IP 수동 차단</h3>
        <div className="form form-grid">
          <div className="field">
            <label className="label">IP</label>
            <input className="input" placeholder="e.g. 192.168.1.100" value={form.ipAddress}
                   onChange={(e) => setForm((p) => ({ ...p, ipAddress: e.target.value }))} />
          </div>
          <div className="field">
            <label className="label">차단 타입</label>
            <select className="select" value={form.banType}
                    onChange={(e) => setForm((p) => ({ ...p, banType: e.target.value }))}>
              <option value="TEMPORARY">TEMPORARY</option>
              <option value="PERMANENT">PERMANENT</option>
            </select>
          </div>
          <div className="field">
            <label className="label">기간(분) – TEMPORARY만</label>
            <input className="input" type="number" min={1} disabled={form.banType !== 'TEMPORARY'}
                   value={form.durationMinutes}
                   onChange={(e) => setForm((p) => ({ ...p, durationMinutes: e.target.value }))} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label className="label">사유</label>
            <input className="input" placeholder="예: 악성 행위 반복 - 수동 차단" value={form.reason}
                   onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} />
          </div>
        </div>
        <div className="actions">
          <button className="btn btn--primary" onClick={handleCreate}>차단 추가</button>
          <button className="btn" onClick={handleRebuild}>Redis 캐시 재구축</button>
        </div>
      </div>

      <div className="card">
        <h3 className="card__title">활성 차단 목록</h3>
        <div className="actions" style={{ gap: 8 }}>
          <button className="btn" onClick={refresh} disabled={loading}>{loading ? '갱신 중…' : '새로고침'}</button>
          <div style={{ flex: 1 }} />
          <input className="input" style={{ width: 240 }} placeholder="특정 IP 조회" value={qIp} onChange={(e) => setQIp(e.target.value)} />
          <button className="btn" onClick={handleQuery}>조회</button>
        </div>

        {qRes && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="form">
              <div><b>IP</b> {qRes.ipAddress}</div>
              <div><b>사유</b> {qRes.reason}</div>
              <div><b>유형</b> {qRes.banType}</div>
              <div><b>차단시각</b> {fmtDate(qRes.bannedAt)}</div>
              <div><b>만료</b> {fmtDate(qRes.expiresAt)}</div>
              <div><b>관리자</b> {qRes.bannedByAdminLoginId || '-'}</div>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto', marginTop: 8 }}>
          <table className="table">
            <thead>
              <tr>
                <th>IP</th>
                <th>사유</th>
                <th>타입</th>
                <th>차단시각</th>
                <th>만료</th>
                <th>관리자</th>
                <th style={{ width: 260 }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {(rows || []).map((r) => (
                <tr key={r.id}>
                  <td>{r.ipAddress}</td>
                  <td title={r.reason}>{r.reason?.slice(0, 60) || '-'}</td>
                  <td>{r.banType}</td>
                  <td>{fmtDate(r.bannedAt)}</td>
                  <td>{fmtDate(r.expiresAt)}</td>
                  <td>{r.bannedByAdminLoginId || '-'}</td>
                  <td>
                    <div className="actions" style={{ justifyContent: 'flex-start', gap: 8 }}>
                      <button className="btn btn--danger" onClick={() => handleUnban(r.ipAddress)}>해제</button>
                      {r.banType === 'TEMPORARY' && (
                        <>
                          <input className="input" style={{ width: 80 }} type="number" min={1}
                                 placeholder="+분"
                                 value={extendVal[r.ipAddress] ?? ''}
                                 onChange={(e) =>
                                   setExtendVal((p) => ({ ...p, [r.ipAddress]: e.target.value }))
                                 } />
                          <button className="btn" onClick={() => handleExtend(r.ipAddress)}>연장</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!rows || rows.length === 0) && (
                <tr><td colSpan={7} style={{ textAlign: 'center' }}>활성 차단 없음</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IpBanTab;
