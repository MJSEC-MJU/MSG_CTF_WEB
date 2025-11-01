// src/pages/Admin/components/IpManagement/IpActivityTab.jsx
// IP 활동 로그 조회 탭 컴포넌트

import { useState, useEffect } from 'react';
import { fetchIpActivity } from '../../../../api/IpActivityAPI';

// Utility function
const fmtDate = (s) => (s ? new Date(s).toLocaleString('ko-KR') : '-');

const IpActivityTab = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    ipAddress: '',
    activityType: '',
    isSuspicious: '',
    hoursBack: '24',
    limit: '100',
  });
  const ACTIVITY_TYPES = [
    'API_REQUEST',
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'FLAG_SUBMIT_WRONG',
    'RATE_LIMIT_EXCEEDED',
    'SUSPICIOUS_PAYLOAD',
    'NOT_FOUND_ACCESS',
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.ipAddress) params.ipAddress = filters.ipAddress.trim();
      if (filters.activityType) params.activityType = filters.activityType;
      if (filters.isSuspicious !== '') params.isSuspicious = filters.isSuspicious === 'true';
      if (filters.hoursBack) params.hoursBack = Number(filters.hoursBack);
      if (filters.limit) params.limit = Number(filters.limit);
      const res = await fetchIpActivity(params);
      setLogs(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      alert(e?.response?.data?.message || '활동 로그 조회 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []); // 기본 로드

  return (
    <div>
      <div className="card">
        <h3 className="card__title">필터</h3>
        <div className="form form-grid">
          <div className="field">
            <label className="label">IP</label>
            <input className="input" placeholder="필터링할 IP (선택)"
                   value={filters.ipAddress}
                   onChange={(e) => setFilters((p) => ({ ...p, ipAddress: e.target.value }))} />
          </div>
          <div className="field">
            <label className="label">활동 타입</label>
            <select className="select" value={filters.activityType}
                    onChange={(e) => setFilters((p) => ({ ...p, activityType: e.target.value }))}>
              <option value="">(전체)</option>
              {ACTIVITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">의심 여부</label>
            <select className="select" value={filters.isSuspicious}
                    onChange={(e) => setFilters((p) => ({ ...p, isSuspicious: e.target.value }))}>
              <option value="">(전체)</option>
              <option value="true">의심만</option>
              <option value="false">정상만</option>
            </select>
          </div>
          <div className="field">
            <label className="label">시간범위(시간)</label>
            <input className="input" type="number" min={1}
                   value={filters.hoursBack}
                   onChange={(e) => setFilters((p) => ({ ...p, hoursBack: e.target.value }))} />
          </div>
          <div className="field">
            <label className="label">최대 결과 수</label>
            <input className="input" type="number" min={1} max={1000}
                   value={filters.limit}
                   onChange={(e) => setFilters((p) => ({ ...p, limit: e.target.value }))} />
          </div>
        </div>
        <div className="actions">
          <button className="btn btn--primary" onClick={fetchLogs} disabled={loading}>{loading ? '조회 중…' : '조회'}</button>
        </div>
      </div>

      <div className="card">
        <h3 className="card__title">활동 로그</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>IP</th>
                <th>타입</th>
                <th>시간</th>
                <th>URI</th>
                <th>상세</th>
                <th>의심</th>
                <th>사용자</th>
              </tr>
            </thead>
            <tbody>
              {(logs || []).map((l) => (
                <tr key={l.id}>
                  <td>{l.id}</td>
                  <td>{l.ipAddress || '-'}</td>
                  <td>{l.activityType}</td>
                  <td>{fmtDate(l.activityTime)}</td>
                  <td title={l.requestUri}>{(l.requestUri || '-').slice(0, 40)}</td>
                  <td title={l.details}>{(l.details || '-').slice(0, 40)}</td>
                  <td>{String(l.isSuspicious)}</td>
                  <td>{l.loginId || (l.userId ? `#${l.userId}` : '-')}</td>
                </tr>
              ))}
              {(!logs || logs.length === 0) && (
                <tr><td colSpan={8} style={{ textAlign: 'center' }}>로그 없음</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IpActivityTab;
