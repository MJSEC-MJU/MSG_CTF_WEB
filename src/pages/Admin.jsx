import React, { useState, useEffect } from 'react';

// 예시 데이터와 API 호출 함수
const fetchUsers = async () => {
  return [
    { id: 1, name: 'User 1', email: 'user1@example.com' },
    { id: 2, name: 'User 2', email: 'user2@example.com' }
  ];
};

const fetchProblems = async () => {
  return [
    { id: 1, title: 'Problem 1' },
    { id: 2, title: 'Problem 2' }
  ];
};

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showProblems, setShowProblems] = useState(false);
  const [showAddProblemForm, setShowAddProblemForm] = useState(false);

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

  useEffect(() => {
    const loadUsers = async () => {
      const userData = await fetchUsers();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // 실제 저장 로직을 구현해야 합니다.
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
          <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse', border: '1px solid white'}}>
            <thead>
              <tr>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>ID</th>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>Name</th>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>Email</th>
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white',border: '1px solid white' }}>{user.id}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>{user.name}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>{user.email}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>
                    <button style={{margin:'5px'}}>Delete</button>
                    <button style={{margin:'5px'}}>Change</button>
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
                  required
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
                <th style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {problems.map(problem => (
                <tr key={problem.id}>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>{problem.id}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>{problem.title}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color:'white', border: '1px solid white' }}>
                    <button style={{margin:'5px'}}>Delete</button>
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
