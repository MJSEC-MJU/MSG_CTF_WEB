import React, { useEffect, useMemo, useState } from 'react';
import { createProblem } from '../api/CreateProblemAPI';
import { fetchProblems, deleteProblem } from '../api/SummaryProblemAPI';
import { fetchAdminMembers, deleteUser as removeUser, updateUser, addUser } from '../api/AdminUserAPI';
import { fetchTeamProfileRows, createTeam, addTeamMember } from '../api/TeamAPI';
import { updateProblem } from '../api/ProblemUpdateAPI';

const Admin = () => {
  // ===== UI state =====
  const [tab, setTab] = useState('users'); // 'users' | 'problems'

  // ===== Users & Teams =====
  const [users, setUsers] = useState([]);
  const [teamRows, setTeamRows] = useState([]); // normalized rows from team profile
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    loginId: '',
    password: '',
    email: '',
    univ: '',
    roles: 'user', // 콤마로 여러 개 입력 가능: "user,admin"
  });

  // Team tools inputs
  const [teamNameForCreate, setTeamNameForCreate] = useState('');
  const [teamNameForAdd, setTeamNameForAdd] = useState('');
  const [memberEmailToAdd, setMemberEmailToAdd] = useState('');

  // ===== Problems =====
  const [problems, setProblems] = useState([]);
  const [editingProblem, setEditingProblem] = useState(null);
  const [showEditProblemForm, setShowEditProblemForm] = useState(false);
  const [showAddProblemForm, setShowAddProblemForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    flag: '',
    points: '',
    minPoints: '',
    initialPoints: '',
    startTime: '',
    endTime: '',
    file: null,
    url: '',
    category: '',
    date: '',
    time: '',
  });

  // ===== Derived: map member email -> team row =====
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

  // ===== Effects: initial data load =====
  useEffect(() => {
    (async () => {
       const [m, p, t] = await Promise.allSettled([
        fetchAdminMembers(),
        fetchProblems(),
        fetchTeamProfileRows(),
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
        setTeamRows([]); // 실패해도 비워두고 진행
      }
    })();
  }, []);

  // ===== Users =====
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
    } catch (e) {
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
      const updatedObj = updated?.data ?? updated; // 서버 반환 형태 보정
      setUsers((prev) => (Array.isArray(prev) ? prev.map((u) => (u.userId === updatedObj.userId ? updatedObj : u)) : []));
      setEditingUser(null);
      alert('사용자 정보가 수정되었습니다.');
    } catch (e) {
      alert('수정에 실패했습니다.');
    }
  };

  const onNewUserInput = (e) => {
  const { name, value } = e.target;
  setNewUser((prev) => ({ ...prev, [name]: value }));
};

const handleCreateUser = async () => {
  // roles: 문자열 -> 배열 화
  const rolesArr = newUser.roles
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);

  const payload = {
    loginId: newUser.loginId.trim(),
    password: newUser.password, // 빈 값 방지 검증은 최소한으로
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
      // 서버가 생성된 유저 객체를 data나 본문으로 돌려준다고 가정
      const created = res.data ?? res.user ?? null;

      // 1) 반환 객체가 있으면 낙관적으로 리스트에 추가
      if (created && created.userId) {
        setUsers((prev) => (Array.isArray(prev) ? [...prev, created] : [created]));
      } else {
        // 2) 없다면 다시 조회해서 동기화
        const refreshed = await fetchAdminMembers();
        const usersList = Array.isArray(refreshed)
          ? refreshed
          : (Array.isArray(refreshed?.data) ? refreshed.data : []);
        setUsers(usersList);
      }

      // 폼 초기화
      setNewUser({ loginId: '', password: '', email: '', univ: '', roles: 'user' });
      alert('신규 유저가 생성되었습니다.');
    } else {
      alert(res?.message || '생성 실패');
    }
  } catch (e) {
    alert('생성 요청 실패 (권한/중복/유효성 오류일 수 있습니다)');
  }
};


  // ===== Team tools =====
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
    } catch (e) {
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
    } catch (e) {
      alert('팀원 추가 요청 실패 (존재하지 않는 팀/이메일일 수 있습니다)');
    }
  };

  // ===== Problems =====
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

  const handleEditProblem = (problem) => {
    setEditingProblem(problem);
    setShowEditProblemForm(true);
    setFormData((fd) => ({
      ...fd,
      title: problem.title ?? '',
      points: problem.points ?? '',
      category: problem.category ?? '',
    }));
  };

  const handleSaveProblem = async () => {
    if (!editingProblem) return alert('수정할 문제를 선택하세요.');
    const fd = new FormData();
    fd.append('challenge', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
    if (formData.file) fd.append('file', formData.file);
    try {
      const res = await updateProblem(editingProblem.challengeId, fd);
      if (res?.code === 'SUCCESS') {
        setProblems((prev) => (Array.isArray(prev) ? prev.map((p) => (p.challengeId === editingProblem.challengeId ? { ...p, ...formData } : p)) : []));
        setEditingProblem(null);
        setShowEditProblemForm(false);
      }
      alert(res?.message || '문제 수정 결과 확인');
    } catch (e) {
      alert('문제 수정 실패');
    }
  };

  // ===== Shared form helpers =====
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

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ color: 'black' }}>Admin Page</h1>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setTab('users')}>User List</button>
        <button onClick={() => setTab('problems')} style={{ marginLeft: 8 }}>
          Problem List
        </button>
      </div>

      {/* ================= Users Tab ================= */}
      {tab === 'users' && (
        <section>
          <h2 style={{ color: 'black' }}>Users</h2>

          {/* Team tools */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              padding: 12,
              border: '1px solid #000',
              borderRadius: 8,
              marginBottom: 12,
              background: '#fafafa',
            }}
          >
            <div>
              <h3 style={{ color: 'black', marginTop: 0 }}>팀 생성</h3>
              <input
                placeholder="팀 이름"
                value={teamNameForCreate}
                onChange={(e) => setTeamNameForCreate(e.target.value)}
                style={{ padding: 6, marginRight: 8 }}
              />
              <button onClick={handleCreateTeam}>생성</button>
            </div>
            <div>
              <h3 style={{ color: 'black', marginTop: 0 }}>팀원 추가</h3>
              <input
                placeholder="팀 이름"
                value={teamNameForAdd}
                onChange={(e) => setTeamNameForAdd(e.target.value)}
                style={{ padding: 6, marginRight: 8 }}
              />
              <input
                placeholder="사용자 이메일"
                value={memberEmailToAdd}
                onChange={(e) => setMemberEmailToAdd(e.target.value)}
                style={{ padding: 6, marginRight: 8 }}
              />
              <button onClick={handleAddMember}>추가</button>
            </div>
          </div>
          {/* Create new user */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              padding: 12,
              border: '1px solid #000',
              borderRadius: 8,
              marginBottom: 12,
              background: '#f5faff',
            }}
          >
            <div style={{ gridColumn: '1 / -1' }}>
              <h3 style={{ color: 'black', marginTop: 0 }}>신규 유저 추가</h3>
            </div>

            <div>
              <label style={{ color: 'black', display: 'block', marginBottom: 4 }}>Login ID</label>
              <input
                name="loginId"
                value={newUser.loginId}
                onChange={onNewUserInput}
                style={{ width: '100%', padding: 6 }}
                placeholder="newuser"
              />
            </div>
            <div>
              <label style={{ color: 'black', display: 'block', marginBottom: 4 }}>Password</label>
              <input
                name="password"
                type="password"
                value={newUser.password}
                onChange={onNewUserInput}
                style={{ width: '100%', padding: 6 }}
                placeholder="비밀번호"
              />
            </div>
            <div>
              <label style={{ color: 'black', display: 'block', marginBottom: 4 }}>Email</label>
              <input
                name="email"
                type="email"
                value={newUser.email}
                onChange={onNewUserInput}
                style={{ width: '100%', padding: 6 }}
                placeholder="newuser@example.com"
              />
            </div>
            <div>
              <label style={{ color: 'black', display: 'block', marginBottom: 4 }}>Univ</label>
              <input
                name="univ"
                value={newUser.univ}
                onChange={onNewUserInput}
                style={{ width: '100%', padding: 6 }}
                placeholder="New University"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ color: 'black', display: 'block', marginBottom: 4 }}>Roles (콤마 구분)</label>
              <input
                name="roles"
                value={newUser.roles}
                onChange={onNewUserInput}
                style={{ width: '100%', padding: 6 }}
                placeholder="user,admin"
              />
              <p style={{ marginTop: 6, color: '#333', fontSize: 12 }}>
                예: <code>user</code> 또는 <code>user,admin</code>
              </p>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <button onClick={handleCreateUser}>Create User</button>
            </div>
          </div>

          {/* Edit panel */}
          {editingUser && (
            <div style={{ color: 'black', marginBottom: 12 }}>
              <h3>Edit User</h3>
              <label>Email:</label>
              <input type="email" name="email" value={editingUser.email} onChange={onUserInput} />
              <label>University:</label>
              <input type="text" name="univ" value={editingUser.univ} onChange={onUserInput} />
              <label>Login ID:</label>
              <input type="text" name="loginId" value={editingUser.loginId} onChange={onUserInput} />
              <label>Role:</label>
              <input type="text" name="role" value={editingUser.role} onChange={onUserInput} />
              <button onClick={handleSaveUser}>Save</button>
              <button onClick={() => setEditingUser(null)}>Cancel</button>
            </div>
          )}

          {/* Users + Team columns */}
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
            <thead>
              <tr>
                {[
                  'ID',
                  'Email',
                  'LoginId',
                  'Role',
                  'Point',
                  'Univ',
                  'Team Name',
                  'Member Email',
                  'Team Mileage',
                  'Team Total',
                  'Team Solves',
                  'Created',
                  'Updated',
                  'Action',
                ].map((h) => (
                  <th key={h} style={{ padding: 10, textAlign: 'center', color: 'black', border: '1px solid black' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(users) ? users : []).map((u) => {
                const relatedMemberEmails = Array.from(
                  new Set(
                    (Array.isArray(teamRows) ? teamRows : [])
                      .filter(r => r.memberEmail === u.email || r.userEmail === u.email)
                      .map(r => r.memberEmail)
                      .filter(Boolean)
                  )
                ).slice(0, 2);
                const team = teamByMemberEmail.get(u.email) || null;
                return (
                  <tr key={u.userId}>
                    <td style={cell}>{u.userId}</td>
                    <td style={cell}>{u.email}</td>
                    <td style={cell}>{u.loginId}</td>
                    <td style={cell}>{u.role}</td>
                    <td style={cell}>{u.totalPoint}</td>
                    <td style={cell}>{u.univ}</td>
                    <td style={cell}>{team?.teamName ?? '-'}</td>
                    <td style={cell}>
                      {relatedMemberEmails.length === 0 ? (
                        '-' 
                      ) : (
                        relatedMemberEmails.map((em, i) => (
                          <div key={i} style={{ lineHeight: 1.2 }}>{em}</div>
                        ))
                      )}
                    </td>
                    <td style={cell}>{team?.teamMileage ?? 0}</td>
                    <td style={cell}>{team?.teamTotalPoint ?? 0}</td>
                    <td style={cell}>{team?.teamSolvedCount ?? 0}</td>
                    <td style={cell}>{u.createdAt?.slice(0, 19)}</td>
                    <td style={cell}>{u.updatedAt?.slice(0, 19)}</td>
                    <td style={cell}>
                      <button style={{ margin: 5 }} onClick={() => handleDeleteUser(u.userId)}>
                        Delete
                      </button>
                      <button style={{ margin: 5 }} onClick={() => setEditingUser(u)}>
                        Change
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {/* ================= Problems Tab ================= */}
      {tab === 'problems' && (
        <section>
          <h2 style={{ color: 'black' }}>Problems</h2>

          <button onClick={() => setShowAddProblemForm((v) => !v)}>
            {showAddProblemForm ? 'Close Add Problem' : 'Add Problem'}
          </button>

          {/* Edit Problem */}
          {showEditProblemForm && editingProblem && (
            <div style={{ color: 'black', padding: 10, border: '1px solid black', marginTop: 10 }}>
              <h3>Edit Problem</h3>
              <form onSubmit={(e) => e.preventDefault()}>
                <label>Title:</label>
                <input type="text" name="title" value={formData.title} onChange={onProblemInput} />
                <label>Description:</label>
                <textarea name="description" value={formData.description} onChange={onProblemInput} />
                <label>Flag:</label>
                <input type="text" name="flag" value={formData.flag} onChange={onProblemInput} />
                <label>Points:</label>
                <input type="number" name="points" value={formData.points} onChange={onProblemInput} />
                <label>Min Points:</label>
                <input type="number" name="minPoints" value={formData.minPoints} onChange={onProblemInput} />
                <label>Initial Points:</label>
                <input type="number" name="initialPoints" value={formData.initialPoints} onChange={onProblemInput} />
                <label>Start Time:</label>
                <input type="datetime-local" name="startTime" value={formData.startTime} onChange={onProblemInput} />
                <label>End Time:</label>
                <input type="datetime-local" name="endTime" value={formData.endTime} onChange={onProblemInput} />
                <label>URL:</label>
                <input type="text" name="url" value={formData.url} onChange={onProblemInput} />
                <label>File:</label>
                <input type="file" name="file" onChange={onFile} />
                <label>Category:</label>
                <input type="text" name="category" value={formData.category} onChange={onProblemInput} />
                <button type="button" onClick={handleSaveProblem}>
                  Save
                </button>
                <button type="button" onClick={() => setShowEditProblemForm(false)}>
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* Add Problem */}
          {showAddProblemForm && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await createProblem(formData);
                  alert(res?.message || '생성 완료');
                } catch {
                  alert('문제 생성 실패');
                }
              }}
              style={{ marginTop: 20 }}
            >
              <div>
                <label style={{ color: 'black' }}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={onProblemInput}
                  required
                  style={{ width: '100%', padding: 10, marginBottom: 10 }}
                />
              </div>
              <div>
                <label style={{ color: 'black' }}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => {
                    if (e.target.value.length <= 300) onProblemInput(e);
                  }}
                  required
                  style={{ width: '100%', padding: 10, marginBottom: 10, height: 100 }}
                />
                <p style={{ color: 'black', fontSize: 12, textAlign: 'right' }}>{formData.description.length} / 300</p>
              </div>
              <div>
                <label style={{ color: 'black' }}>Flag</label>
                <input type="text" name="flag" value={formData.flag} onChange={onProblemInput} required style={{ width: '100%', padding: 10, marginBottom: 10 }} />
              </div>
              <div>
                <label style={{ color: 'black' }}>Points</label>
                <input type="number" name="points" value={formData.points} onChange={onProblemInput} required style={{ width: '100%', padding: 10, marginBottom: 10 }} />
              </div>
              <div>
                <label style={{ color: 'black' }}>Min Points</label>
                <input type="number" name="minPoints" value={formData.minPoints} onChange={onProblemInput} required style={{ width: '100%', padding: 10, marginBottom: 10 }} />
              </div>
              <div>
                <label style={{ color: 'black' }}>Date</label>
                <input type="date" name="date" value={formData.date} onChange={onProblemInput} required style={{ width: '100%', padding: 10, marginBottom: 10 }} />
              </div>
              <div>
                <label style={{ color: 'black' }}>Time</label>
                <input type="time" name="time" value={formData.time} onChange={onProblemInput} required style={{ width: '100%', padding: 10, marginBottom: 10 }} />
              </div>
              <div>
                <label style={{ color: 'black' }}>File Upload</label>
                <input type="file" name="file" onChange={onFile} style={{ marginBottom: 10, color: 'black' }} />
              </div>
              <div>
                <label style={{ color: 'black' }}>URL</label>
                <input type="url" name="url" value={formData.url} onChange={onProblemInput} style={{ width: '100%', padding: 10, marginBottom: 10 }} />
              </div>
              <div>
                <label style={{ color: 'black' }}>CATEGORY</label>
                <select name="category" value={formData.category} onChange={onProblemInput} required style={{ width: '100%', padding: 10, marginBottom: 10, backgroundColor: 'white', color: 'black' }}>
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
              <div style={{ marginTop: 20 }}>
                <button type="submit" style={{ marginRight: 10 }}>
                  저장
                </button>
                <button type="button" style={{ marginRight: 10 }}>
                  다른이름으로 저장
                </button>
                <button type="button">저장 및 계속</button>
              </div>
            </form>
          )}

          {/* Problem table */}
          <table style={{ width: '100%', marginTop: 10, borderCollapse: 'collapse', border: '1px solid black' }}>
            <thead>
              <tr>
                {['ID', 'Title', 'Points', 'Category', 'Action'].map((h) => (
                  <th key={h} style={{ padding: 10, textAlign: 'center', color: 'black', border: '1px solid black' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(problems) ? problems : []).map((p) => (
                <tr key={p.challengeId}>
                  <td style={cell}>{p.challengeId}</td>
                  <td style={cell}>{p.title}</td>
                  <td style={cell}>{p.points}</td>
                  <td style={cell}>{p.category}</td>
                  <td style={cell}>
                    <button onClick={() => handleDeleteProblem(p.challengeId)} style={{ margin: 5 }}>
                      Delete
                    </button>
                    <button style={{ margin: 5 }} onClick={() => handleEditProblem(p)}>
                      Change
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

const cell = { padding: 10, textAlign: 'center', color: 'black', border: '1px solid black' };

export default Admin;
