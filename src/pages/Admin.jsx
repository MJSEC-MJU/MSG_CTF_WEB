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
  const [showUsers, setShowUsers] = useState(true);
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
    console.log('폼 제출됨', formData);
    // 실제 저장 로직을 구현해야 합니다.
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        minHeight: '100vh',
        padding: '20px',
        backgroundImage: 'url("your-image-url.jpg")', // 실제 이미지 URL로 교체
        backgroundSize: 'cover', // 화면을 꽉 채우도록 설정
        backgroundPosition: 'center', // 배경이 화면 중앙에 위치하도록 설정
        backgroundRepeat: 'no-repeat', // 배경 이미지 반복 방지
        position: 'relative',
      }}
    >
      <h1>Admin Page</h1>

      <button onClick={toggleUsers}>User List</button>
      <button onClick={toggleProblems}>Problem List</button>

      {showUsers && (
        <section>
          <h2>Users</h2>
          <button>Add User</button>
          <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', textAlign: 'center' }}>ID</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Name</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Email</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{user.id}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{user.name}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{user.email}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button>Change</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {showProblems && (
        <section>
          <h2>Problems</h2>
          <button onClick={toggleAddProblemForm}>
            {showAddProblemForm ? 'Close Add Problem' : 'Add Problem'}
          </button>
          
          {/* Add Problem 폼 */}
          {showAddProblemForm && (
            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
              <div>
                <label>Title</label>
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
                <label>Description</label>
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
                <label>Flag</label>
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
                <label>Points</label>
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
                <label>Min Points</label>
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
                <label>Date</label>
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
                <label>Time</label>
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
                <label>File Upload</label>
                <input
                  type="file"
                  name="file"
                  onChange={handleFileChange}
                  required
                  style={{ marginBottom: '10px' }}
                />
              </div>

              <div>
                <label>URL</label>
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
                  Save
                </button>
                <button type="button" style={{ marginRight: '10px' }}>
                  Save As Different Name
                </button>
                <button type="button">Save & Continue Editing</button>
              </div>
            </form>
          )}
          <table style={{ width: '100%', marginTop: '10px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', textAlign: 'center' }}>ID</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Title</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {problems.map(problem => (
                <tr key={problem.id}>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{problem.id}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{problem.title}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button>Change</button>
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
