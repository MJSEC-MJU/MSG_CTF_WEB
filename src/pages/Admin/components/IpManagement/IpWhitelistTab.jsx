// src/pages/Admin/components/IpManagement/IpWhitelistTab.jsx
// IP 화이트리스트 관리 탭 컴포넌트

import { useState, useEffect } from 'react';
import {
  fetchWhitelist,
  addWhitelistIp,
  removeWhitelistIp,
  checkWhitelistIp,
} from '../../../../api/IpWhitelistAPI';

// Utility functions
const isIPv4 = (ip) =>
  /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$/.test(ip || '');
const fmtDate = (s) => (s ? new Date(s).toLocaleString('ko-KR') : '-');

const IpWhitelistTab = () => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ ipAddress: '', reason: '' });
  const [qIp, setQIp] = useState('');
  const [qRes, setQRes] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetchWhitelist();
      setRows(Array.isArray(res?.data) ? res.data : []);
    } catch {
      alert('화이트리스트 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleAdd = async () => {
    if (!isIPv4(form.ipAddress)) return alert('올바른 IPv4를 입력하세요.');
    if (!form.reason.trim()) return alert('사유를 입력하세요.');
    try {
      const res = await addWhitelistIp({ ipAddress: form.ipAddress.trim(), reason: form.reason.trim() });
      alert(res?.message || '추가 완료');
      setForm({ ipAddress: '', reason: '' });
      refresh();
    } catch (e) {
      alert(e?.response?.data?.message || '추가 실패');
    }
  };

  const handleRemove = async (ip) => {
    if (!window.confirm(`${ip} 화이트리스트에서 제거할까요?`)) return;
    try {
      const res = await removeWhitelistIp(ip);
      alert(res?.message || '제거 완료');
      refresh();
    } catch (e) {
      alert(e?.response?.data?.message || '제거 실패');
    }
  };

  const handleQuery = async () => {
    if (!isIPv4(qIp)) return alert('IPv4를 입력하세요.');
    try {
      const res = await checkWhitelistIp(qIp.trim());
      setQRes(res?.data || null);
      if (!res?.data?.isWhitelisted) alert(res?.message || '화이트리스트에 없음');
    } catch (e) {
      alert(e?.response?.data?.message || '조회 실패');
    }
  };

  return (
    <div>
      <div className="card">
        <h3 className="card__title">화이트리스트 추가</h3>
        <div className="form form-grid">
          <div className="field">
            <label className="label">IP</label>
            <input className="input" placeholder="e.g. 203.0.113.10"
                   value={form.ipAddress}
                   onChange={(e) => setForm((p) => ({ ...p, ipAddress: e.target.value }))} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label className="label">사유</label>
            <input className="input" placeholder="예: 모니터링 시스템 IP"
                   value={form.reason}
                   onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} />
          </div>
        </div>
        <div className="actions">
          <button className="btn btn--primary" onClick={handleAdd}>추가</button>
          <div style={{ flex: 1 }} />
          <input className="input" style={{ width: 240 }} placeholder="특정 IP 확인"
                 value={qIp} onChange={(e) => setQIp(e.target.value)} />
          <button className="btn" onClick={handleQuery}>조회</button>
        </div>

        {qRes && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="form">
              <div><b>IP</b> {qRes.ipAddress || qIp}</div>
              <div><b>등록됨?</b> {String(qRes.isWhitelisted ?? qRes.isActive ?? false)}</div>
              {qRes.reason && <div><b>사유</b> {qRes.reason}</div>}
              {qRes.addedAt && <div><b>등록시각</b> {fmtDate(qRes.addedAt)}</div>}
              {qRes.addedByAdminLoginId && <div><b>관리자</b> {qRes.addedByAdminLoginId}</div>}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="card__title">화이트리스트 목록</h3>
        <div className="actions">
          <button className="btn" onClick={refresh} disabled={loading}>{loading ? '갱신 중…' : '새로고침'}</button>
        </div>
        <div style={{ overflowX: 'auto', marginTop: 8 }}>
          <table className="table">
            <thead>
              <tr>
                <th>IP</th>
                <th>사유</th>
                <th>등록시각</th>
                <th>관리자</th>
                <th style={{ width: 140 }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {(rows || []).map((r) => (
                <tr key={r.id}>
                  <td>{r.ipAddress}</td>
                  <td title={r.reason}>{r.reason?.slice(0, 60) || '-'}</td>
                  <td>{fmtDate(r.addedAt)}</td>
                  <td>{r.addedByAdminLoginId || '-'}</td>
                  <td>
                    <button className="btn btn--danger" onClick={() => handleRemove(r.ipAddress)}>제거</button>
                  </td>
                </tr>
              ))}
              {(!rows || rows.length === 0) && (
                <tr><td colSpan={5} style={{ textAlign: 'center' }}>등록된 IP 없음</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IpWhitelistTab;
