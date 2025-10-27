// src/pages/Admin.jsx
// - Admin 페이지 전체 (Admin.css 스타일 전면 적용)
// - Signature Codes(관리자) 탭 포함
// - SIGNATURE 문제 추가/수정 시 club(팀명) 필수 입력 처리
// - 문제 생성/수정에 mileage 필드 추가 (목록 컬럼 포함)
// - 편집 시 문제 상세 하이드레이트해 기존 값 주입

import './Admin.css';
import React, { useEffect, useMemo, useState } from 'react';
import { Axios } from '../api/Axios';
import { createProblem } from '../api/CreateProblemAPI';
import { fetchProblems, deleteProblem } from '../api/SummaryProblemAPI';
import { fetchAdminMembers, deleteUser as removeUser, updateUser, addUser } from '../api/AdminUserAPI';
import { fetchTeamProfileRows, createTeam, addTeamMember } from '../api/TeamAPI';
import { updateProblem } from '../api/ProblemUpdateAPI';
import PaymentProcessor from '../components/PaymentProcessor';
import { useContestTime } from "../components/Timer";
import { fetchContestTime, updateContestTime } from '../api/ContestTimeAPI';
import { fetchAllPaymentHistory, refundPayment, grantMileageToTeam } from '../api/PaymentAPI';
import {
  fetchAllSolveRecords,
  fetchSolveRecordsByChallenge,
  revokeSolveRecord,
  deleteAllSolveRecordsByUser
} from '../api/SolveRecordsAPI';

// ── Signature Admin API ─────────────────────────────────────────────
import {
  adminBulkUpsert,
  adminImportCSV,
  adminExportCSV,
  adminGetPool,
  adminGenerate,
  adminReassign,
  adminDeleteOne,
  adminPurgeChallenge,
  adminForceUnlock,
} from '../api/SignatureAdminAPI';

const Admin = () => {
  // ===== UI state =====
  const [tab, setTab] = useState('users');

  // ===== Users & Teams =====
  const [users, setUsers] = useState([]);
  const [teamRows, setTeamRows] = useState([]);

  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    loginId: '',
    password: '',
    email: '',
    univ: '',
    roles: 'user',
  });

  // Team tools inputs
  const [teamNameForCreate, setTeamNameForCreate] = useState('');
  const [teamNameForAdd, setTeamNameForAdd] = useState('');
  const [memberEmailToAdd, setMemberEmailToAdd] = useState('');

  // ===== Timer =====
  const { refreshContestTime } = useContestTime();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [currentServerTime, setCurrentServerTime] = useState('');

  // ===== Problems =====
  const [problems, setProblems] = useState([]);
  const [editingProblem, setEditingProblem] = useState(null);
  const [showEditProblemForm, setShowEditProblemForm] = useState(false);
  const [showAddProblemForm, setShowAddProblemForm] = useState(false);

  // 문제 생성/수정 폼 상태
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    flag: '',
    points: '',
    minPoints: '',
    initialPoints: '',
    mileage: '',
    startTime: '',
    endTime: '',
    file: null,
    url: '',
    fileUrl: '',
    category: '',
    club: '',
  });

  // ===== Signature Admin (state) =====
  const [sigBulkText, setSigBulkText] = useState('[\n  {"teamName":"alpha","challengeId":5,"code":"123456"}\n]');
  const [sigImportFile, setSigImportFile] = useState(null);

  const [sigPoolChallengeId, setSigPoolChallengeId] = useState('');
  const [sigPool, setSigPool] = useState({ challengeId: null, items: [] });

  const [genChallengeId, setGenChallengeId] = useState('');
  const [genCount, setGenCount] = useState('');
  const [genTeamName, setGenTeamName] = useState('');
  const [genResult, setGenResult] = useState(null);

  const [rsChallengeId, setRsChallengeId] = useState('');
  const [rsCodeDigest, setRsCodeDigest] = useState('');
  const [rsTeamName, setRsTeamName] = useState('');
  const [rsResetConsumed, setRsResetConsumed] = useState(true);

  const [delChallengeId, setDelChallengeId] = useState('');
  const [delCodeDigest, setDelCodeDigest] = useState('');

  const [purgeChallengeId, setPurgeChallengeId] = useState('');

  const [fuTeamName, setFuTeamName] = useState('');
  const [fuChallengeId, setFuChallengeId] = useState('');

  const [sigLoading, setSigLoading] = useState(false);

  // ===== Payment History =====
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedTeamNameForMileage, setSelectedTeamNameForMileage] = useState('');
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [paymentHistorySearchQuery, setPaymentHistorySearchQuery] = useState('');
  const [mileageAmount, setMileageAmount] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ===== Solve Records =====
  const [solveRecords, setSolveRecords] = useState([]);
  const [solveRecordsSearchQuery, setSolveRecordsSearchQuery] = useState('');
  const [selectedChallengeFilter, setSelectedChallengeFilter] = useState('');
  const [selectedUserForBulkDelete, setSelectedUserForBulkDelete] = useState('');
  const [solveRecordsLoading, setSolveRecordsLoading] = useState(false);

  // ===== Derived =====
  const teamByMemberEmail = useMemo(() => {
    const map = new Map();
    const rows = Array.isArray(teamRows) ? teamRows : [];
    for (const row of rows) {
      const key = row.memberEmail || row.userEmail;
      if (!key) continue;
      const prev = map.get(key);
      if (!prev || (row.teamTotalPoint ?? 0) > (prev.teamTotalPoint ?? 0)) {
        map.set(key, row);
      }
    }
    return map;
  }, [teamRows]);

  // ===== Effects =====
  useEffect(() => {
    (async () => {
      const [m, p, t, ct] = await Promise.allSettled([
        fetchAdminMembers(),
        fetchProblems(),
        fetchTeamProfileRows(),
        fetchContestTime(),
      ]);

      if (m.status === 'fulfilled') {
        const memberResp = m.value;
        const usersList = Array.isArray(memberResp)
          ? memberResp
          : (Array.isArray(memberResp?.data) ? memberResp.data : []);
        setUsers(usersList);
      } else {
        console.error('[Admin] fetchAdminMembers failed:', m.reason);
      }

      if (p.status === 'fulfilled') {
        const problemResp = p.value;
        setProblems(Array.isArray(problemResp) ? problemResp : []);
      } else {
        console.error('[Admin] fetchProblems failed:', p.reason);
      }

      if (t.status === 'fulfilled') {
        const teamRowsResp = t.value;
        setTeamRows(Array.isArray(teamRowsResp) ? teamRowsResp : []);
      } else {
        console.error('[Admin] fetchTeamProfileRows failed:', t.reason);
        setTeamRows([]);
      }

      if (ct.status === 'fulfilled') {
        const contestTimeResp = ct.value;
        if (contestTimeResp?.startTime) setStartTime(convertToDatetimeLocal(contestTimeResp.startTime));
        if (contestTimeResp?.endTime) setEndTime(convertToDatetimeLocal(contestTimeResp.endTime));
        if (contestTimeResp?.currentTime) setCurrentServerTime(contestTimeResp.currentTime);
      } else {
        console.error('[Admin] fetchContestTime failed:', ct.reason);
      }
    })();
  }, []);

  // ===== Helpers =====
  const onNewUserInput = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const onUserInput = (e) => {
    const { name, value } = e.target;
    if (!editingUser) return;
    setEditingUser((prev) => ({ ...prev, [name]: value }));
  };

  const onProblemInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onFile = (e) => setFormData((prev) => ({ ...prev, file: e.target.files?.[0] ?? null }));

  // 서버 → input(datetime-local)
  const convertToDatetimeLocal = (serverTime) => {
    if (!serverTime) return '';
    const base = serverTime.replace('T', ' ').slice(0, 16);
    return base.replace(' ', 'T');
  };

  // input(datetime-local) → 서버 형식
  const toServerDateTime = (val) => {
    if (!val) return '';
    let s = val.replace('T', ' ');
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s)) s += ':00';
    return s;
  };

  // ===== Users =====
  const handleCreateUser = async () => {
    const rolesArr = newUser.roles
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const payload = {
      loginId: newUser.loginId.trim(),
      password: newUser.password,
      email: newUser.email.trim(),
      univ: newUser.univ.trim(),
      roles: rolesArr.length ? rolesArr : ['user'],
    };

    if (!payload.loginId || !payload.password || !payload.email || !payload.univ) {
      alert('모든 입력을 채워주세요.');
      return;
    }

    try {
      const res = await addUser(payload);
      if (res?.code === 'SUCCESS') {
        const created = res.data ?? res.user ?? null;
        if (created && created.userId) {
          setUsers((prev) => (Array.isArray(prev) ? [...prev, created] : [created]));
        } else {
          const refreshed = await fetchAdminMembers();
          const usersList = Array.isArray(refreshed)
            ? refreshed
            : (Array.isArray(refreshed?.data) ? refreshed.data : []);
          setUsers(usersList);
        }
        setNewUser({ loginId: '', password: '', email: '', univ: '', roles: 'user' });
        alert('신규 유저가 생성되었습니다.');
      } else {
        alert(res?.message || '생성 실패');
      }
    } catch {
      alert('생성 요청 실패 (권한/중복/유효성 오류일 수 있습니다)');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await removeUser(userId);
      if (res?.code === 'SUCCESS') {
        setUsers((prev) => (Array.isArray(prev) ? prev.filter((u) => u.userId !== userId) : []));
        alert('회원 삭제 성공');
      } else {
        alert(res?.message || '삭제 실패');
      }
    } catch {
      alert('삭제 요청 실패');
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser) return alert('수정할 사용자를 선택하세요.');
    try {
      const payload = {
        email: editingUser.email,
        univ: editingUser.univ,
        loginId: editingUser.loginId,
        role: editingUser.role,
      };
      const updated = await updateUser(editingUser.userId, payload);
      const updatedObj = updated?.data ?? updated;
      setUsers((prev) => (Array.isArray(prev) ? prev.map((u) => (u.userId === updatedObj.userId ? updatedObj : u)) : []));
      setEditingUser(null);
      alert('사용자 정보가 수정되었습니다.');
    } catch {
      alert('수정에 실패했습니다.');
    }
  };

  // ===== Teams =====
  const handleCreateTeam = async () => {
    const name = teamNameForCreate.trim();
    if (!name) return alert('팀 이름을 입력하세요.');
    try {
      const res = await createTeam(name);
      if (res?.code === 'SUCCESS') {
        alert('팀이 생성되었습니다.');
        setTeamNameForCreate('');
        const latestRows = await fetchTeamProfileRows();
        setTeamRows(Array.isArray(latestRows) ? latestRows : []);
      } else {
        alert(res?.message || '팀 생성 실패');
      }
    } catch {
      alert('팀 생성 요청 실패 (이미 존재하거나 권한 오류일 수 있습니다)');
    }
  };

  const handleAddMember = async () => {
    const team = teamNameForAdd.trim();
    const email = memberEmailToAdd.trim();
    if (!team || !email) return alert('팀 이름과 이메일을 모두 입력하세요.');
    try {
      const res = await addTeamMember(team, email);
      if (res?.code === 'SUCCESS') {
        alert('팀원 추가 완료');
        setMemberEmailToAdd('');
        const latestRows = await fetchTeamProfileRows();
        setTeamRows(Array.isArray(latestRows) ? latestRows : []);
      } else {
        alert(res?.message || '팀원 추가 실패');
      }
    } catch {
      alert('팀원 추가 요청 실패 (존재하지 않는 팀/이메일일 수 있습니다)');
    }
  };

  // ===== Problems =====

  // 상세 하이드레이트(가능한 엔드포인트 순회)
  const hydrateProblemDetail = async (problem) => {
    const id = problem?.challengeId;
    if (!id) return problem;

    const candidates = [
      `/admin/challenges/${id}`,
      `/challenges/${id}`,
      `/problems/${id}`,
    ];

    for (const url of candidates) {
      try {
        const res = await Axios.get(url);
        const body = res.data?.data ?? res.data;
        if (body && typeof body === 'object') {
          return { ...problem, ...body };
        }
      } catch (e) {
        // 다음 후보 계속
      }
    }
    return problem;
  };

  const handleDeleteProblem = async (challengeId) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;
    const res = await deleteProblem(challengeId);
    if (res?.code === 'SUCCESS') {
      setProblems((prev) => (Array.isArray(prev) ? prev.filter((p) => p.challengeId !== challengeId) : []));
      alert('문제가 삭제되었습니다.');
    } else {
      alert(res?.message || '문제 삭제 실패');
    }
  };

  const handleEditProblem = async (problem) => {
    const full = await hydrateProblemDetail(problem);

    const minPts    = full.minPoints ?? full.minPoint ?? '';
    const initPts   = full.initialPoints ?? full.initialPoint ?? full.points ?? '';
    const clubName  = full.club ?? full.clubName ?? '';
    const mileage   = full.mileage ?? full.mileagePoint ?? full.miles ?? '';

    setEditingProblem(full);
    setShowEditProblemForm(true);

    setFormData({
      title:         full.title ?? '',
      description:   full.description ?? '',
      flag:          full.flag ?? '',
      points:        full.points ?? '',
      minPoints:     minPts ?? '',
      initialPoints: initPts ?? '',
      mileage:       mileage ?? '',
      startTime:     full.startTime ? convertToDatetimeLocal(full.startTime) : '',
      endTime:       full.endTime   ? convertToDatetimeLocal(full.endTime)   : '',
      file:          null, // 보안상 미리 채울 수 없음
      url:           full.url ?? '',
      fileUrl:       full.fileUrl ?? '',
      category:      full.category ?? '',
      club:          clubName,
    });
  };

  const handleSaveProblem = async () => {
    if (!editingProblem) return alert('수정할 문제를 선택하세요.');
    if (formData.category === 'SIGNATURE' && !String(formData.club || '').trim()) {
      alert('SIGNATURE 카테고리는 club(팀명)이 필수입니다.');
      return;
    }

    const payload = {
      title:         formData.title,
      description:   formData.description,
      flag:          formData.flag,
      points:        formData.points,
      minPoints:     formData.minPoints,
      initialPoints: formData.initialPoints || formData.points,
      mileage:       formData.mileage,
      startTime:     toServerDateTime(formData.startTime),
      endTime:       toServerDateTime(formData.endTime),
      url:           formData.url,
      // fileUrl은 읽기 전용이므로 payload에서 제외 (파일 업로드로만 변경 가능)
      category:      formData.category,
      ...(formData.category === 'SIGNATURE' ? { club: String(formData.club).trim() } : {}),
    };

    const fd = new FormData();
    fd.append('challenge', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (formData.file) fd.append('file', formData.file);

    try {
      const res = await updateProblem(editingProblem.challengeId, fd);
      if (res?.code === 'SUCCESS') {
        setProblems((prev) =>
          (Array.isArray(prev)
            ? prev.map((p) => (p.challengeId === editingProblem.challengeId ? { ...p, ...payload } : p))
            : []),
        );
        setEditingProblem(null);
        setShowEditProblemForm(false);
      }
      alert(res?.message || '문제 수정 결과 확인');
    } catch {
      alert('문제 수정 실패');
    }
  };

  // ===== Timer =====
  const handleSetContestTime = async () => {
    if (!startTime || !endTime) {
      alert('시작 시간과 종료 시간을 모두 입력해주세요.');
      return;
    }
    const formattedStartTime = startTime.replace('T', ' ') + ':00';
    const formattedEndTime = endTime.replace('T', ' ') + ':00';

    try {
      const res = await updateContestTime(formattedStartTime, formattedEndTime);
      if (res?.message || res?.code === 'SUCCESS') {
        alert(res?.message || '대회 시간이 설정되었습니다!');
        await refreshContestTime();
        const latestData = await fetchContestTime();
        if (latestData?.startTime) setStartTime(convertToDatetimeLocal(latestData.startTime));
        if (latestData?.endTime) setEndTime(convertToDatetimeLocal(latestData.endTime));
        if (latestData?.currentTime) setCurrentServerTime(latestData.currentTime);
      } else {
        alert('대회 시간 설정에 실패했습니다.');
      }
    } catch (e) {
      console.error('대회 시간 설정 실패:', e);
      alert('대회 시간 설정 요청 실패 (권한 또는 형식 오류일 수 있습니다)');
    }
  };

  // ===== Signature Admin Handlers =====
  const onSigBulkUpsert = async () => {
    let arr;
    try {
      arr = JSON.parse(sigBulkText);
      if (!Array.isArray(arr)) throw new Error('JSON 배열이어야 합니다.');
    } catch (e) {
      return alert('JSON 파싱 실패: ' + e.message);
    }
    try {
      setSigLoading(true);
      const res = await adminBulkUpsert(arr);
      alert(res?.message || '업서트 완료');
    } catch {
      alert('업서트 실패');
    } finally { setSigLoading(false); }
  };

  const onSigImport = async () => {
    if (!sigImportFile) return alert('CSV 파일을 선택하세요.');
    try {
      setSigLoading(true);
      const res = await adminImportCSV(sigImportFile);
      alert(res?.message || '임포트 완료');
      setSigImportFile(null);
    } catch {
      alert('임포트 실패');
    } finally { setSigLoading(false); }
  };

  const onSigExport = async () => {
    try {
      setSigLoading(true);
      const { blob, filename } = await adminExportCSV();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename || 'signature_codes.csv';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('익스포트 실패');
    } finally { setSigLoading(false); }
  };

  const onSigLoadPool = async () => {
    const id = parseInt(sigPoolChallengeId, 10);
    if (!id) return alert('challengeId를 입력하세요.');
    try {
      setSigLoading(true);
      const res = await adminGetPool(id);
      setSigPool({ challengeId: res.challengeId, items: res.items || [] });
    } catch {
      alert('풀 조회 실패');
    } finally { setSigLoading(false); }
  };

  const onSigGenerate = async () => {
    const cid = parseInt(genChallengeId, 10);
    const cnt = parseInt(genCount, 10);
    if (!cid || !cnt) return alert('challengeId와 count를 입력하세요.');
    try {
      setSigLoading(true);
      const res = await adminGenerate({ challengeId: cid, count: cnt, teamName: genTeamName || undefined });
      setGenResult(res);
      alert(`${res?.created ?? 0}개 생성 완료`);
    } catch {
      alert('생성 실패');
    } finally { setSigLoading(false); }
  };

  const onSigReassign = async () => {
    const cid = parseInt(rsChallengeId, 10);
    if (!cid || !rsCodeDigest) return alert('challengeId와 codeDigest를 입력하세요.');
    try {
      setSigLoading(true);
      const res = await adminReassign({
        challengeId: cid,
        codeDigest: rsCodeDigest.trim(),
        teamName: rsTeamName || null,
        resetConsumed: !!rsResetConsumed,
      });
      alert(res?.message || '재배정/초기화 완료');
      if (sigPool.challengeId === cid) await onSigLoadPool();
    } catch {
      alert('재배정 실패');
    } finally { setSigLoading(false); }
  };

  const onSigDeleteOne = async () => {
    const cid = parseInt(delChallengeId, 10);
    if (!cid || !delCodeDigest) return alert('challengeId와 codeDigest를 입력하세요.');
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      setSigLoading(true);
      const res = await adminDeleteOne(cid, delCodeDigest.trim());
      alert(res?.message || '삭제 완료');
      if (sigPool.challengeId === cid) await onSigLoadPool();
    } catch {
      alert('삭제 실패');
    } finally { setSigLoading(false); }
  };

  const onSigPurge = async () => {
    const cid = parseInt(purgeChallengeId, 10);
    if (!cid) return alert('challengeId를 입력하세요.');
    if (!window.confirm(`챌린지 ${cid}의 모든 코드를 삭제합니다. 계속할까요?`)) return;
    try {
      setSigLoading(true);
      const res = await adminPurgeChallenge(cid);
      alert(res?.message || '전체 삭제 완료');
      if (sigPool.challengeId === cid) setSigPool({ challengeId: cid, items: [] });
    } catch {
      alert('전체 삭제 실패');
    } finally { setSigLoading(false); }
  };

  const onSigForceUnlock = async () => {
    const cid = parseInt(fuChallengeId, 10);
    if (!cid || !fuTeamName.trim()) return alert('teamName과 challengeId를 입력하세요.');
    try {
      setSigLoading(true);
      const res = await adminForceUnlock({ teamName: fuTeamName.trim(), challengeId: cid });
      alert(res?.message || '강제 언락 완료');
    } catch {
      alert('강제 언락 실패');
    } finally { setSigLoading(false); }
  };

  // ===== Payment Handlers =====
  const loadPaymentHistory = async () => {
    try {
      setPaymentLoading(true);
      const history = await fetchAllPaymentHistory();
      setPaymentHistory(Array.isArray(history) ? history : []);
    } catch (err) {
      console.error('결제 히스토리 로딩 실패:', err);
      alert('결제 히스토리를 불러오는데 실패했습니다.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleRefundPayment = async (paymentHistoryId) => {
    if (!window.confirm('이 결제를 환불하시겠습니까? 마일리지가 팀에 반환됩니다.')) return;
    try {
      setPaymentLoading(true);
      const res = await refundPayment(paymentHistoryId);
      alert(res?.message || '환불이 완료되었습니다.');
      await loadPaymentHistory();
      const latestRows = await fetchTeamProfileRows();
      setTeamRows(Array.isArray(latestRows) ? latestRows : []);
    } catch (err) {
      console.error('환불 실패:', err);
      alert(err?.message || '환불에 실패했습니다.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleGrantMileage = async () => {
    const teamName = selectedTeamNameForMileage.trim();
    const amount = parseInt(mileageAmount, 10);

    if (!teamName) {
      alert('팀을 선택해주세요.');
      return;
    }

    if (!amount || isNaN(amount) || amount < 0) {
      alert('유효한 마일리지 금액을 입력해주세요 (0 이상).');
      return;
    }

    try {
      setPaymentLoading(true);
      const res = await grantMileageToTeam(teamName, amount);
      alert(res?.message || `${teamName} 팀에 마일리지 ${amount}가 부여되었습니다.`);
      setSelectedTeamNameForMileage('');
      setMileageAmount('');
      const latestRows = await fetchTeamProfileRows();
      setTeamRows(Array.isArray(latestRows) ? latestRows : []);
    } catch (err) {
      console.error('마일리지 부여 실패:', err);
      alert(err?.message || '마일리지 부여에 실패했습니다.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // ===== Solve Records Handlers =====
  const loadSolveRecords = async () => {
    try {
      setSolveRecordsLoading(true);
      const records = await fetchAllSolveRecords();
      setSolveRecords(Array.isArray(records) ? records : []);
    } catch (err) {
      console.error('제출 기록 로딩 실패:', err);
      alert('제출 기록을 불러오는데 실패했습니다.');
    } finally {
      setSolveRecordsLoading(false);
    }
  };

  const handleRevokeSolveRecord = async (challengeId, loginId, challengeTitle) => {
    if (!window.confirm(`[${challengeTitle}] 문제의 ${loginId} 사용자 제출 기록을 철회하시겠습니까?\n\n- 팀 점수 및 마일리지가 복구됩니다.\n- 다이나믹 스코어가 재계산됩니다.`)) {
      return;
    }

    try {
      setSolveRecordsLoading(true);
      const res = await revokeSolveRecord(challengeId, loginId);
      alert(res?.message || '제출 기록이 철회되었습니다.');
      await loadSolveRecords();
      const latestRows = await fetchTeamProfileRows();
      setTeamRows(Array.isArray(latestRows) ? latestRows : []);
      const latestProblems = await fetchProblems();
      setProblems(Array.isArray(latestProblems) ? latestProblems : []);
    } catch (err) {
      console.error('제출 기록 철회 실패:', err);
      alert(err?.message || '제출 기록 철회에 실패했습니다.');
    } finally {
      setSolveRecordsLoading(false);
    }
  };

  const handleBulkDeleteUserRecords = async () => {
    const loginId = selectedUserForBulkDelete.trim();

    if (!loginId) {
      alert('사용자 로그인 ID를 입력해주세요.');
      return;
    }

    if (!window.confirm(`${loginId} 사용자의 모든 제출 기록을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      setSolveRecordsLoading(true);
      const res = await deleteAllSolveRecordsByUser(loginId);
      alert(res?.message || `${res?.deletedCount || 0}개의 제출 기록이 삭제되었습니다.`);
      setSelectedUserForBulkDelete('');
      await loadSolveRecords();
      const latestRows = await fetchTeamProfileRows();
      setTeamRows(Array.isArray(latestRows) ? latestRows : []);
      const latestProblems = await fetchProblems();
      setProblems(Array.isArray(latestProblems) ? latestProblems : []);
    } catch (err) {
      console.error('사용자 제출 기록 삭제 실패:', err);
      alert(err?.message || '사용자 제출 기록 삭제에 실패했습니다.');
    } finally {
      setSolveRecordsLoading(false);
    }
  };

  return (
    <div className="admin">
      <h1>Admin Page</h1>

      <div className="tabs">
        <button aria-current={tab==='users' ? 'page' : undefined} onClick={() => setTab('users')}>User List</button>
        <button aria-current={tab==='teams' ? 'page' : undefined} onClick={() => setTab('teams')}>Team List</button>
        <button aria-current={tab==='problems' ? 'page' : undefined} onClick={() => setTab('problems')}>Problem List</button>
        <button aria-current={tab==='solverecords' ? 'page' : undefined} onClick={() => setTab('solverecords')}>Solve Records</button>
        <button aria-current={tab==='payment' ? 'page' : undefined} onClick={() => setTab('payment')}>Payment</button>
        <button aria-current={tab==='timer' ? 'page' : undefined} onClick={() => setTab('timer')}>Set Time</button>
        <button aria-current={tab==='signature' ? 'page' : undefined} onClick={() => setTab('signature')}>Signature</button>
      </div>

      {/* ================= Users Tab ================= */}
      {tab === 'users' && (
        <section>
          <h2>Users</h2>

          {/* Create new user */}
          <div className="card">
            <h3 className="card__title">신규 유저 추가</h3>
            <div className="form form-grid">
              <div className="field">
                <label className="label">Login ID</label>
                <input className="input" name="loginId" value={newUser.loginId} onChange={onNewUserInput} placeholder="newuser" />
              </div>
              <div className="field">
                <label className="label">Password</label>
                <input className="input" name="password" type="password" value={newUser.password} onChange={onNewUserInput} placeholder="비밀번호" />
              </div>
              <div className="field">
                <label className="label">Email</label>
                <input className="input" name="email" type="email" value={newUser.email} onChange={onNewUserInput} placeholder="newuser@example.com" />
              </div>
              <div className="field">
                <label className="label">Univ</label>
                <input className="input" name="univ" value={newUser.univ} onChange={onNewUserInput} placeholder="New University" />
              </div>

              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Roles (콤마 구분)</label>
                <input className="input" name="roles" value={newUser.roles} onChange={onNewUserInput} placeholder="user,admin" />
                <p className="hint">예: <code>user</code> 또는 <code>user,admin</code></p>
              </div>
            </div>
            <div className="actions">
              <button className="btn btn--primary" onClick={handleCreateUser}>Create User</button>
            </div>
          </div>

          {/* Edit panel */}
          {editingUser && (
            <div className="card">
              <h3 className="card__title">Edit User</h3>
              <div className="form form-grid">
                <div className="field">
                  <label className="label">Email</label>
                  <input className="input" type="email" name="email" value={editingUser.email} onChange={onUserInput} />
                </div>
                <div className="field">
                  <label className="label">University</label>
                  <input className="input" type="text" name="univ" value={editingUser.univ} onChange={onUserInput} />
                </div>
                <div className="field">
                  <label className="label">Login ID</label>
                  <input className="input" type="text" name="loginId" value={editingUser.loginId} onChange={onUserInput} />
                </div>
                <div className="field">
                  <label className="label">Role</label>
                  <input className="input" type="text" name="role" value={editingUser.role} onChange={onUserInput} />
                </div>
              </div>
              <div className="actions">
                <button className="btn" onClick={() => setEditingUser(null)}>Cancel</button>
                <button className="btn btn--primary" onClick={handleSaveUser}>Save</button>
              </div>
            </div>
          )}

          {/* Users table */}
          <table className="table">
            <thead>
              <tr>
                {['ID','Email','LoginId','Role','Univ','Created','Updated','Action'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(users) ? users : []).map((u) => (
                <tr key={u.userId}>
                  <td>{u.userId}</td>
                  <td>{u.email}</td>
                  <td>{u.loginId}</td>
                  <td>{u.role}</td>
                  <td>{u.univ}</td>
                  <td>{u.createdAt?.slice(0, 19)}</td>
                  <td>{u.updatedAt?.slice(0, 19)}</td>
                  <td>
                    <div className="actions" style={{ justifyContent: 'center' }}>
                      <button className="btn btn--danger" onClick={() => handleDeleteUser(u.userId)}>Delete</button>
                      <button className="btn" onClick={() => setEditingUser(u)}>Change</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ================= Teams Tab ================= */}
      {tab === 'teams' && (
        <section>
          <h2>Team List</h2>

          <div className="card">
            <h3 className="card__title">팀 생성</h3>
            <div className="form">
              <div className="field">
                <input className="input" placeholder="팀 이름" value={teamNameForCreate} onChange={(e) => setTeamNameForCreate(e.target.value)} />
              </div>
              <div className="actions">
                <button className="btn btn--primary" onClick={handleCreateTeam}>생성</button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card__title">팀원 추가</h3>
            <div className="form form-grid">
              <div className="field">
                <input className="input" placeholder="팀 이름" value={teamNameForAdd} onChange={(e) => setTeamNameForAdd(e.target.value)} />
              </div>
              <div className="field">
                <input className="input" placeholder="사용자 이메일" value={memberEmailToAdd} onChange={(e) => setMemberEmailToAdd(e.target.value)} />
              </div>
            </div>
            <div className="actions">
              <button className="btn btn--primary" onClick={handleAddMember}>추가</button>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                {['Team ID','Team Name','Member Email','Team Mileage','Team Total'].map((h) => (<th key={h}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(teamRows) ? teamRows : []).map((row, idx) => (
                <tr key={`${row.teamName}-${idx}`}>
                  <td>{row.teamId ?? '-'}</td>
                  <td>{row.teamName ?? '-'}</td>
                  <td>
                    {Array.isArray(row.memberEmails) && row.memberEmails.length
                      ? row.memberEmails.map((em, i) => (<div key={i} style={{ lineHeight: 1.2 }}>{em}</div>))
                      : '-'}
                  </td>
                  <td>{row.teamMileage ?? 0}</td>
                  <td>{row.teamTotalPoint ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ================= Problems Tab ================= */}
      {tab === 'problems' && (
        <section>
          <h2>Problems</h2>

          <div className="actions" style={{ marginBottom: 8 }}>
            <button className="btn" onClick={() => setShowAddProblemForm((v) => !v)}>
              {showAddProblemForm ? 'Close Add Problem' : 'Add Problem'}
            </button>
          </div>

          {/* Edit Problem */}
          {showEditProblemForm && editingProblem && (
            <div className="card card--edit">
              <h3 className="card__title">
                Edit Problem {editingProblem?.category && <span className="badge" style={{ marginLeft: 8 }}>{editingProblem.category}</span>}
              </h3>
              <form className="form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-grid">
                  <div className="field">
                    <label className="label">Title</label>
                    <input className="input" type="text" name="title" value={formData.title} onChange={onProblemInput} />
                  </div>
                  <div className="field">
                    <label className="label">Points</label>
                    <input className="input" type="number" name="points" value={formData.points} onChange={onProblemInput} />
                  </div>
                  <div className="field">
                    <label className="label">Mileage</label>
                    <input className="input" type="number" name="mileage" value={formData.mileage} onChange={onProblemInput} />
                  </div>

                  <div className="field" style={{ gridColumn: '1 / -1' }}>
                    <label className="label">Description</label>
                    <textarea className="textarea" name="description" value={formData.description} onChange={onProblemInput} />
                    <div className="hint">{formData.description?.length ?? 0} / 300</div>
                  </div>

                  <div className="field">
                    <label className="label">Flag</label>
                    <input className="input" type="text" name="flag" value={formData.flag} onChange={onProblemInput} />
                  </div>
                  <div className="field">
                    <label className="label">Min Points</label>
                    <input className="input" type="number" name="minPoints" value={formData.minPoints} onChange={onProblemInput} />
                  </div>

                  <div className="field">
                    <label className="label">Initial Points</label>
                    <input className="input" type="number" name="initialPoints" value={formData.initialPoints} onChange={onProblemInput} />
                  </div>
                  <div className="field">
                    <label className="label">URL</label>
                    <input className="input" type="text" name="url" value={formData.url} onChange={onProblemInput} />
                  </div>

                  <div className="field">
                    <label className="label">File URL (읽기 전용)</label>
                    <input
                      className="input"
                      type="text"
                      name="fileUrl"
                      value={formData.fileUrl || '(파일 없음)'}
                      readOnly
                      style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', color: '#666' }}
                    />
                  </div>

                  <div className="field">
                    <label className="label">Start Time</label>
                    <input className="input" type="datetime-local" name="startTime" value={formData.startTime} onChange={onProblemInput} />
                  </div>
                  <div className="field">
                    <label className="label">End Time</label>
                    <input className="input" type="datetime-local" name="endTime" value={formData.endTime} onChange={onProblemInput} />
                  </div>

                  <div className="field">
                    <label className="label">File</label>
                    <input className="input" type="file" name="file" onChange={onFile} />
                  </div>

                  <div className="field">
                    <label className="label">Category</label>
                    <input className="input" type="text" name="category" value={formData.category} onChange={onProblemInput} />
                  </div>

                  {formData.category === 'SIGNATURE' && (
                    <div className="field">
                      <label className="label">Club (팀명) — SIGNATURE 필수</label>
                      <input className="input" type="text" name="club" value={formData.club} onChange={onProblemInput} placeholder="예) alpha" />
                    </div>
                  )}
                </div>

                <div className="actions">
                  <button type="button" className="btn" onClick={() => setShowEditProblemForm(false)}>Cancel</button>
                  <button type="button" className="btn btn--primary" onClick={handleSaveProblem}>Save</button>
                </div>
              </form>
            </div>
          )}

          {/* Add Problem */}
          {showAddProblemForm && (
            <form
              className="card form"
              onSubmit={async (e) => {
                e.preventDefault();
                if (formData.category === 'SIGNATURE' && !String(formData.club || '').trim()) {
                  alert('SIGNATURE 카테고리는 club(팀명)이 필수입니다.');
                  return;
                }
                try {
                  const res = await createProblem(formData);
                  alert(res?.message || '생성 완료');
                } catch (err) {
                  alert(err?.message || '문제 생성 실패');
                }
              }}
              style={{ marginTop: 12 }}
            >
              <h3 className="card__title">Add Problem</h3>

              <div className="form-grid">
                <div className="field">
                  <label className="label">Title</label>
                  <input className="input" type="text" name="title" value={formData.title} onChange={onProblemInput} required />
                </div>

                <div className="field">
                  <label className="label">Points</label>
                  <input className="input" type="number" name="points" value={formData.points} onChange={onProblemInput} required />
                </div>

                <div className="field">
                  <label className="label">Mileage</label>
                  <input className="input" type="number" name="mileage" value={formData.mileage} onChange={onProblemInput} />
                </div>

                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <label className="label">Description</label>
                  <textarea
                    className="textarea"
                    name="description"
                    value={formData.description}
                    onChange={(e) => { if (e.target.value.length <= 300) onProblemInput(e); }}
                    required
                  />
                  <div className="hint">{formData.description.length} / 300</div>
                </div>

                <div className="field">
                  <label className="label">Flag</label>
                  <input className="input" type="text" name="flag" value={formData.flag} onChange={onProblemInput} required />
                </div>

                <div className="field">
                  <label className="label">Min Points</label>
                  <input className="input" type="number" name="minPoints" value={formData.minPoints} onChange={onProblemInput} required />
                </div>

                <div className="field">
                  <label className="label">Initial Points</label>
                  <input className="input" type="number" name="initialPoints" value={formData.initialPoints} onChange={onProblemInput} required />
                </div>

                <div className="field">
                  <label className="label">Start Time</label>
                  <input className="input" type="datetime-local" name="startTime" value={formData.startTime} onChange={onProblemInput} required />
                </div>

                <div className="field">
                  <label className="label">End Time</label>
                  <input className="input" type="datetime-local" name="endTime" value={formData.endTime} onChange={onProblemInput} required />
                </div>

                <div className="field">
                  <label className="label">File Upload</label>
                  <input className="input" type="file" name="file" onChange={onFile} />
                </div>

                <div className="field">
                  <label className="label">URL</label>
                  <input className="input" type="url" name="url" value={formData.url} onChange={onProblemInput} />
                </div>

                <div className="field">
                  <label className="label">CATEGORY</label>
                  <select className="select" name="category" value={formData.category} onChange={onProblemInput} required>
                    <option value="">카테고리 선택</option>
                    <option value="MISC">MISC</option>
                    <option value="REV">REV</option>
                    <option value="ANDROID">ANDROID</option>
                    <option value="FORENSICS">FORENSICS</option>
                    <option value="PWN">PWN</option>
                    <option value="WEB">WEB</option>
                    <option value="CRYPTO">CRYPTO</option>
                    <option value="SIGNATURE">SIGNATURE</option>
                  </select>
                </div>

                {formData.category === 'SIGNATURE' && (
                  <div className="field">
                    <label className="label">Club (팀명) — SIGNATURE 필수</label>
                    <input className="input" type="text" name="club" value={formData.club} onChange={onProblemInput} required placeholder="예) alpha" />
                  </div>
                )}
              </div>

              <div className="actions">
                <button type="button" className="btn">다른이름으로 저장</button>
                <button type="button" className="btn">저장 및 계속</button>
                <button type="submit" className="btn btn--primary">저장</button>
              </div>
            </form>
          )}

          {/* Problem table */}
          <table className="table" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                {['ID', 'Title', 'Points', 'Mileage', 'Category', 'Action'].map((h) => (<th key={h}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(problems) ? problems : []).map((p) => (
                <tr key={p.challengeId}>
                  <td>{p.challengeId}</td>
                  <td>{p.title}</td>
                  <td>{p.points}</td>
                  <td>{p.mileage ?? '-'}</td>
                  <td>{p.category}</td>
                  <td>
                    <div className="actions" style={{ justifyContent: 'center' }}>
                      <button className="btn btn--danger" onClick={() => handleDeleteProblem(p.challengeId)}>Delete</button>
                      <button className="btn" onClick={() => handleEditProblem(p)}>Change</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* ================= Payment Tab ================= */}
      {tab === 'payment' && (
        <section>
          <h2>Payment Management</h2>

          {/* Payment Processor (기존) */}
          <div className="card">
            <h3 className="card__title">결제 처리</h3>
            <PaymentProcessor />
          </div>

          {/* 마일리지 부여 */}
          <div className="card">
            <h3 className="card__title">팀 마일리지 부여</h3>
            <div className="form form-grid">
              <div className="field">
                <label className="label">팀 검색</label>
                <input
                  className="input"
                  type="text"
                  placeholder="팀명을 입력하세요"
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="label">팀 선택</label>
                <select
                  className="select"
                  value={selectedTeamNameForMileage}
                  onChange={(e) => setSelectedTeamNameForMileage(e.target.value)}
                >
                  <option value="">팀을 선택하세요</option>
                  {Array.from(new Map(teamRows.map(row => [row.teamName, row])).values())
                    .filter(team => team.teamName.toLowerCase().includes(teamSearchQuery.toLowerCase()))
                    .map((team) => (
                      <option key={team.teamName} value={team.teamName}>
                        {team.teamName} (ID: {team.teamId}, 마일리지: {team.teamMileage ?? 0})
                      </option>
                    ))}
                </select>
                <p className="hint">
                  {teamSearchQuery && `검색 결과: ${Array.from(new Map(teamRows.map(row => [row.teamName, row])).values()).filter(team => team.teamName.toLowerCase().includes(teamSearchQuery.toLowerCase())).length}개`}
                </p>
              </div>
              <div className="field">
                <label className="label">마일리지 금액</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  placeholder="부여할 마일리지"
                  value={mileageAmount}
                  onChange={(e) => setMileageAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="actions">
              <button
                className="btn btn--primary"
                onClick={handleGrantMileage}
                disabled={paymentLoading}
              >
                {paymentLoading ? '처리 중...' : '마일리지 부여'}
              </button>
            </div>
          </div>

          {/* 결제 히스토리 */}
          <div className="card">
            <h3 className="card__title">전체 결제 히스토리</h3>
            <div className="form form-grid" style={{ marginBottom: 12 }}>
              <div className="field">
                <input
                  className="input"
                  type="text"
                  placeholder="팀명 또는 요청자로 검색..."
                  value={paymentHistorySearchQuery}
                  onChange={(e) => setPaymentHistorySearchQuery(e.target.value)}
                />
              </div>
              <div className="actions" style={{ alignItems: 'end' }}>
                <button
                  className="btn btn--primary"
                  onClick={loadPaymentHistory}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? '로딩 중...' : '히스토리 조회'}
                </button>
              </div>
            </div>

            {paymentHistory.length > 0 ? (
              <>
                <p className="hint" style={{ marginBottom: 8 }}>
                  전체: {paymentHistory.length}건
                  {paymentHistorySearchQuery && ` / 검색 결과: ${paymentHistory.filter(p =>
                    (p.teamName?.toLowerCase().includes(paymentHistorySearchQuery.toLowerCase())) ||
                    (p.requesterLoginId?.toLowerCase().includes(paymentHistorySearchQuery.toLowerCase()))
                  ).length}건`}
                </p>
                <table className="table">
                  <thead>
                    <tr>
                      {['ID', '팀명', '사용 마일리지', '요청자', '결제 시간', '액션'].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory
                      .filter(payment => {
                        if (!paymentHistorySearchQuery) return true;
                        const query = paymentHistorySearchQuery.toLowerCase();
                        return (
                          payment.teamName?.toLowerCase().includes(query) ||
                          payment.requesterLoginId?.toLowerCase().includes(query)
                        );
                      })
                      .map((payment) => (
                        <tr key={payment.teamPaymentHistoryId}>
                          <td>{payment.teamPaymentHistoryId}</td>
                          <td>{payment.teamName ?? '-'}</td>
                          <td>{payment.mileageUsed?.toLocaleString() ?? 0}</td>
                          <td>{payment.requesterLoginId ?? '-'}</td>
                          <td>{payment.createdAt ? new Date(payment.createdAt).toLocaleString('ko-KR') : '-'}</td>
                          <td>
                            <div className="actions" style={{ justifyContent: 'center' }}>
                              <button
                                className="btn btn--danger"
                                onClick={() => handleRefundPayment(payment.teamPaymentHistoryId)}
                                disabled={paymentLoading}
                              >
                                환불
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="hint">결제 히스토리가 없거나 조회 버튼을 눌러주세요.</p>
            )}
          </div>
        </section>
      )}

      {/* ================= Solve Records Tab ================= */}
      {tab === 'solverecords' && (
        <section>
          <h2>Solve Records Management</h2>

          {/* 사용자 전체 제출 기록 삭제 */}
          <div className="card">
            <h3 className="card__title">사용자 전체 제출 기록 삭제</h3>
            <div className="form form-grid">
              <div className="field">
                <label className="label">사용자 로그인 ID</label>
                <input
                  className="input"
                  type="text"
                  placeholder="삭제할 사용자의 로그인 ID"
                  value={selectedUserForBulkDelete}
                  onChange={(e) => setSelectedUserForBulkDelete(e.target.value)}
                />
                <p className="hint">해당 사용자의 모든 문제 제출 기록이 삭제됩니다. (중복 제출 정리, 테스트 계정 정리 등에 유용)</p>
              </div>
            </div>
            <div className="actions">
              <button
                className="btn btn--danger"
                onClick={handleBulkDeleteUserRecords}
                disabled={solveRecordsLoading}
              >
                {solveRecordsLoading ? '삭제 중...' : '전체 삭제'}
              </button>
            </div>
          </div>

          {/* 제출 기록 조회 */}
          <div className="card">
            <h3 className="card__title">전체 제출 기록</h3>
            <div className="form form-grid" style={{ marginBottom: 12 }}>
              <div className="field">
                <input
                  className="input"
                  type="text"
                  placeholder="문제 제목, 로그인 ID, 팀명, 대학으로 검색..."
                  value={solveRecordsSearchQuery}
                  onChange={(e) => setSolveRecordsSearchQuery(e.target.value)}
                />
              </div>
              <div className="field">
                <select
                  className="select"
                  value={selectedChallengeFilter}
                  onChange={(e) => setSelectedChallengeFilter(e.target.value)}
                >
                  <option value="">모든 문제</option>
                  {Array.from(new Set(solveRecords.map(r => r.challengeId)))
                    .sort((a, b) => a - b)
                    .map((cid) => {
                      const record = solveRecords.find(r => r.challengeId === cid);
                      return (
                        <option key={cid} value={cid}>
                          [{cid}] {record?.challengeTitle || 'Unknown'}
                        </option>
                      );
                    })}
                </select>
              </div>
              <div className="actions" style={{ alignItems: 'end' }}>
                <button
                  className="btn btn--primary"
                  onClick={loadSolveRecords}
                  disabled={solveRecordsLoading}
                >
                  {solveRecordsLoading ? '로딩 중...' : '조회'}
                </button>
              </div>
            </div>

            {solveRecords.length > 0 ? (
              <>
                <p className="hint" style={{ marginBottom: 8 }}>
                  전체: {solveRecords.length}건
                  {(solveRecordsSearchQuery || selectedChallengeFilter) && ` / 필터링 결과: ${
                    solveRecords.filter(record => {
                      const query = solveRecordsSearchQuery.toLowerCase();
                      const matchesSearch = !solveRecordsSearchQuery ||
                        record.challengeTitle?.toLowerCase().includes(query) ||
                        record.loginId?.toLowerCase().includes(query) ||
                        record.teamName?.toLowerCase().includes(query) ||
                        record.univ?.toLowerCase().includes(query);
                      const matchesChallenge = !selectedChallengeFilter ||
                        String(record.challengeId) === String(selectedChallengeFilter);
                      return matchesSearch && matchesChallenge;
                    }).length
                  }건`}
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        {['History ID', '문제 ID', '문제 제목', '로그인 ID', '팀명', '대학', '제출 시간', '점수', '마일리지', 'FB 보너스', '퍼스트 블러드', '액션'].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {solveRecords
                        .filter(record => {
                          const query = solveRecordsSearchQuery.toLowerCase();
                          const matchesSearch = !solveRecordsSearchQuery ||
                            record.challengeTitle?.toLowerCase().includes(query) ||
                            record.loginId?.toLowerCase().includes(query) ||
                            record.teamName?.toLowerCase().includes(query) ||
                            record.univ?.toLowerCase().includes(query);
                          const matchesChallenge = !selectedChallengeFilter ||
                            String(record.challengeId) === String(selectedChallengeFilter);
                          return matchesSearch && matchesChallenge;
                        })
                        .map((record) => (
                          <tr key={record.historyId}>
                            <td>{record.historyId}</td>
                            <td>{record.challengeId}</td>
                            <td>{record.challengeTitle || '-'}</td>
                            <td>{record.loginId || '-'}</td>
                            <td>{record.teamName || '-'}</td>
                            <td>{record.univ || '-'}</td>
                            <td>{record.solvedTime ? new Date(record.solvedTime).toLocaleString('ko-KR') : '-'}</td>
                            <td>{record.pointsAwarded?.toLocaleString() || 0}</td>
                            <td>{record.mileageAwarded?.toLocaleString() || 0}</td>
                            <td>
                              {record.mileageBonus > 0 ? (
                                <span style={{ color: '#e67e22', fontWeight: 'bold' }}>
                                  +{record.mileageBonus}
                                </span>
                              ) : '-'}
                            </td>
                            <td>
                              {(record.isFirstBlood || record.firstBlood) ? (
                                <span style={{
                                  color: '#e74c3c',
                                  fontWeight: 'bold',
                                  backgroundColor: '#ffe6e6',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}>
                                  FIRST BLOOD
                                </span>
                              ) : '-'}
                            </td>
                            <td>
                              <div className="actions" style={{ justifyContent: 'center' }}>
                                <button
                                  className="btn btn--danger"
                                  onClick={() => handleRevokeSolveRecord(record.challengeId, record.loginId, record.challengeTitle)}
                                  disabled={solveRecordsLoading}
                                >
                                  철회
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="hint">제출 기록이 없거나 조회 버튼을 눌러주세요.</p>
            )}
          </div>
        </section>
      )}

      {/* ================= Timer Tab ================= */}
      {tab === 'timer' && (
        <section className="section--timer">
          <h2 style={{ gridColumn: '1 / -1' }}>Set Contest Time</h2>
          {/* 설정 폼 */}
          <div className="card">
            <div className="form form-grid">
              <div className="field">
                <label className="label">시작 시간</label>
                <input className="input" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                <p className="hint">형식: yyyy-MM-dd HH:mm (예: 2025-03-29 10:00)</p>
              </div>

              <div className="field">
                <label className="label">종료 시간</label>
                <input className="input" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                <p className="hint">형식: yyyy-MM-dd HH:mm (예: 2025-03-29 22:00)</p>
              </div>
            </div>

            <div className="actions">
              <button className="btn btn--primary" onClick={handleSetContestTime}>대회 시간 설정</button>
            </div>
          </div>
        </section>
      )}

      {/* ================= Signature Admin Tab ================= */}
      {tab === 'signature' && (
        <section>
          <h2>Signature Codes (Admin)</h2>
          {sigLoading && <p className="hint">처리 중…</p>}

          {/* 1) Bulk Upsert */}
          <div className="card">
            <h3 className="card__title">1) 코드 일괄 업서트 (JSON)</h3>
            <div className="form">
              <textarea className="textarea" value={sigBulkText} onChange={(e) => setSigBulkText(e.target.value)} />
            </div>
            <div className="actions">
              <button className="btn btn--primary" onClick={onSigBulkUpsert}>업서트</button>
            </div>
          </div>

          {/* 2) Import / 3) Export */}
          <div className="card">
            <h3 className="card__title">2) CSV 임포트 / 3) CSV 익스포트</h3>
            <div className="form">
              <input className="input" type="file" accept=".csv,text/csv" onChange={(e) => setSigImportFile(e.target.files?.[0] || null)} />
              <div className="actions">
                <button className="btn" onClick={onSigImport}>임포트</button>
                <button className="btn btn--primary" onClick={onSigExport}>익스포트</button>
              </div>
              <p className="hint">CSV 헤더: <code>teamName,challengeId,code</code></p>
            </div>
          </div>

          {/* 4) Pool 조회 */}
          <div className="card">
            <h3 className="card__title">4) 코드 풀 조회</h3>
            <div className="form form-grid">
              <div className="field">
                <input className="input" placeholder="challengeId" value={sigPoolChallengeId} onChange={(e) => setSigPoolChallengeId(e.target.value)} />
              </div>
              <div className="actions" style={{ alignItems: 'end' }}>
                <button className="btn btn--primary" onClick={onSigLoadPool}>조회</button>
              </div>
            </div>

            {sigPool?.items?.length > 0 ? (
              <table className="table" style={{ marginTop: 10 }}>
                <thead>
                  <tr>{['ID','codeDigest','assignedTeamId','consumed','consumedAt'].map(h => (<th key={h}>{h}</th>))}</tr>
                </thead>
                <tbody>
                  {sigPool.items.map((it) => (
                    <tr key={it.id}>
                      <td>{it.id}</td>
                      <td title={it.codeDigest}>{it.codeDigest}</td>
                      <td>{it.assignedTeamId ?? '-'}</td>
                      <td>{String(it.consumed)}</td>
                      <td>{it.consumedAt ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="hint" style={{ marginTop: 8 }}>아이템이 없습니다.</p>
            )}
          </div>

          {/* 5) Generate */}
          <div className="card">
            <h3 className="card__title">5) 랜덤 코드 생성</h3>
            <div className="form form-grid">
              <input className="input" placeholder="challengeId" value={genChallengeId} onChange={(e)=>setGenChallengeId(e.target.value)} />
              <input className="input" placeholder="count (1~10000)" value={genCount} onChange={(e)=>setGenCount(e.target.value)} />
              <input className="input" placeholder="teamName (선택)" value={genTeamName} onChange={(e)=>setGenTeamName(e.target.value)} />
            </div>
            <div className="actions">
              <button className="btn btn--primary" onClick={onSigGenerate}>생성</button>
            </div>
            {genResult && (
              <div className="form" style={{ paddingTop: 0 }}>
                <div>created: {genResult.created}</div>
                {Array.isArray(genResult.codes) && genResult.codes.length > 0 && (
                  <details style={{ marginTop: 6 }}>
                    <summary>생성된 코드 보기</summary>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{genResult.codes.join(', ')}</pre>
                  </details>
                )}
              </div>
            )}
          </div>

          {/* 6) Reassign / Reset */}
          <div className="card">
            <h3 className="card__title">6) 코드 재배정 / 소비상태 초기화</h3>
            <div className="form form-grid">
              <input className="input" placeholder="challengeId" value={rsChallengeId} onChange={(e)=>setRsChallengeId(e.target.value)} />
              <input className="input" placeholder="codeDigest (sha256 hex)" value={rsCodeDigest} onChange={(e)=>setRsCodeDigest(e.target.value)} />
              <input className="input" placeholder="teamName (비우면 배정해제)" value={rsTeamName} onChange={(e)=>setRsTeamName(e.target.value)} />
              <label className="label" style={{ alignSelf: 'center' }}>
                <input type="checkbox" checked={rsResetConsumed} onChange={(e)=>setRsResetConsumed(e.target.checked)} /> resetConsumed
              </label>
            </div>
            <div className="actions">
              <button className="btn btn--primary" onClick={onSigReassign}>재배정/초기화</button>
            </div>
          </div>

          {/* 7) Delete one */}
          <div className="card">
            <h3 className="card__title">7) 단건 삭제</h3>
            <div className="form form-grid">
              <input className="input" placeholder="challengeId" value={delChallengeId} onChange={(e)=>setDelChallengeId(e.target.value)} />
              <input className="input" placeholder="codeDigest" value={delCodeDigest} onChange={(e)=>setDelCodeDigest(e.target.value)} />
            </div>
            <div className="actions">
              <button className="btn btn--danger" onClick={onSigDeleteOne}>삭제</button>
            </div>
          </div>

          {/* 8) Purge */}
          <div className="card">
            <h3 className="card__title">8) 챌린지 전체 코드 제거</h3>
            <div className="form form-grid">
              <input className="input" placeholder="challengeId" value={purgeChallengeId} onChange={(e)=>setPurgeChallengeId(e.target.value)} />
            </div>
            <div className="actions">
              <button className="btn btn--danger" onClick={onSigPurge}>전체 삭제</button>
            </div>
          </div>

          {/* 9) Force Unlock */}
          <div className="card">
            <h3 className="card__title">9) 강제 언락</h3>
            <div className="form form-grid">
              <input className="input" placeholder="teamName" value={fuTeamName} onChange={(e)=>setFuTeamName(e.target.value)} />
              <input className="input" placeholder="challengeId" value={fuChallengeId} onChange={(e)=>setFuChallengeId(e.target.value)} />
            </div>
            <div className="actions">
              <button className="btn btn--primary" onClick={onSigForceUnlock}>강제 언락</button>
            </div>
            <p className="hint">레코드가 없으면 생성합니다.</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default Admin;
