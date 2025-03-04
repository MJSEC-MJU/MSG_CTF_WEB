import React, { useState, useEffect } from 'react';
import { createProblem } from '../api/CreateProblemAPI'; 
import { fetchProblems, deleteProblem } from "../api/SummaryProblemAPI";
import { fetchAdminMembers } from "../api/AdminUser";




const Admin = () => {
  const [users, setUsers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showProblems, setShowProblems] = useState(false);
  const [showAddProblemForm, setShowAddProblemForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    flag: '',
    points: '',
    minPoints: '',
    date: '',
    time: '',
    file: null,
    url: ''
  });

  const handleDeleteProblem = async (challengeId) => {
    const isConfirmed = window.confirm("정말로 삭제하시겠습니까?");
    if (!isConfirmed) return;

    const responseD = await deleteProblem(challengeId);
    if (responseD.code === "SUCCESS") {
      alert("문제가 삭제되었습니다.");
      setProblems(problems.filter((p) => p.challengeId !== challengeId)); // 삭제 후 목록 갱신
    } else {
      alert("문제 삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      const userData = await fetchAdminMembers();
      setUsers(userData);
    };

    const loadProblems = async () => {
      const problemData = await fetchProblems();
      setProblems(problemData);
    };

    loadUsers();
    loadProblems();
  }, []);

  const toggleUsers = () => {
    setShowUsers(true);
    setShowProblems(false);
  };

  const toggleProblems = () => {
    setShowUsers(false);
    setShowProblems(true);
  };
  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setEditingUser({ ...editingUser, [name]: value });
  };

  const handleSaveUser = () => {
    setUsers(users.map(user => (user.id === editingUser.id ? editingUser : user)));
    setEditingUser(null);
  };

  const toggleAddProblemForm = () => {
    setShowAddProblemForm(!showAddProblemForm);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0]
    });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const response = await createProblem(formData);
      alert(response.message); // 성공 메시지 표시
    } catch (error) {
      alert('문제 생성 실패');
    }
  };

  return (
    <div>
      <h1 style={{color:'white'}}>Admin Page</h1>

      <button onClick={toggleUsers}>User List</button>
      <button onClick={toggleProblems}>Problem List</button>

      {showUsers && (
        <section>
          <h2 style={{color:'white'}}>Users</h2>
          <button>Add User</button>
          <input style={{ padding: '5px',  marginLeft: '30px',marginRight: '10px', marginBottom: '10px' }}/>
          <button>찾기</button>
          {editingUser && (
            <div style={{color:'white'}}>
              <h3>Edit User</h3>
              <label>Email:</label>
              <input type="email" name="email" value={editingUser.email} onChange={handleChangeInput} />
              <label>University:</label>
              <input type="text" name="univ" value={editingUser.univ} onChange={handleChangeInput} />
              <label>Login ID:</label>
              <input type="text" name="loginId" value={editingUser.loginId} onChange={handleChangeInput} />
              <button onClick={handleSaveUser}>Save</button>
              <button onClick={() => setEditingUser(null)}>Cancel</button>
            </div>
          )}
          <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse', border: '1px solid white'}}>
            <thead>
              <tr>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>ID</th>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>Email</th>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>LoginId</th>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>Roles</th>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>Point</th>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>Univ</th>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>Created</th>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>Updated</th>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.userId}>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white',border: '1px solid white' }}>{user.userId}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>{user.email}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>{user.loginId}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>{user.roles}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>{user.totalPoint}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>{user.univ}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>{user.createdAt.slice(0, 19)}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>{user.updatedAt.slice(0, 19)}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>
                    <button style={{margin:'5px'}}>Delete</button>
                    <button style={{margin:'5px'}} onClick={() => handleEditUser(user)}>Change</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {showProblems && (
        <section>
          <h2 style={{color:'white'}}>Problems</h2>
          <button onClick={toggleAddProblemForm}>
            {showAddProblemForm ? 'Close Add Problem' : 'Add Problem'}
          </button>
          <input style={{ padding: '5px',  marginLeft: '30px',marginRight: '10px', marginBottom: '10px' }}/>
          <button>찾기</button>
          {/* Add Problem 폼 */}
          {showAddProblemForm && (
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div>
                <label style={{color:'white'}}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
              </div>

              <div>
                <label style={{color:'white'}}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    height: '100px',
                  }}
                />
              </div>

              <div>
                <label style={{color:'white'}}>Flag</label>
                <input
                  type="text"
                  name="flag"
                  value={formData.flag}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
              </div>

              <div>
                <label style={{color:'white'}}>Points</label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
              </div>

              <div>
                <label style={{color:'white'}}>Min Points</label>
                <input
                  type="number"
                  name="minPoints"
                  value={formData.minPoints}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
              </div>

              <div>
                <label style={{color:'white'}}>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
              </div>

              <div>
                <label style={{color:'white'}}>Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
              </div>

              <div>
                <label style={{color:'white'}}>File Upload</label>
                <input
                  type="file"
                  name="file"
                  onChange={handleFileChange}
                  style={{ marginBottom: '10px', color:'white' }}
                />
              </div>

              <div>
                <label style={{color:'white'}}>URL</label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
              </div>

              {/* 버튼들 */}
              <div style={{ marginTop: '20px' }}>
                <button type="submit" style={{ marginRight: '10px' }}>
                  저장
                </button>
                <button type="button" style={{ marginRight: '10px' }}>
                  다른이름으로 저장
                </button>
                <button type="button">저장 및 계속</button>
              </div>
            </form>
          )}
          <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse', border: '1px solid white' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>ID</th>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>Title</th>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>Points</th>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {problems.map(problem => (
                <tr key={problem.id}>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>{problem.challengeId}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>{problem.title}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>{problem.points}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>
                    <button onClick={() => handleDeleteProblem(problem.challengeId)} style={{margin:'5px'}}>Delete</button>
                    <button style={{margin:'5px'}}>Change</button>
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

export default Admin;
