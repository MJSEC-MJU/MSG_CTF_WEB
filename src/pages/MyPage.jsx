import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../api/ProfileAPI';
import Loading from '../components/Loading';
import './MyPage.css';

const MyPage = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(false);

  const [solved] = useState([
    { id: '1', title: 'Easy' },
    { id: '2', title: 'Base' },
    { id: '3', title: 'Simple' },
  ]);

  const [challenged] = useState([
    { id: '1', title: 'Easy' },
    { id: '2', title: 'Base' },
    { id: '3', title: 'Simple' },
    { id: '4', title: 'Hard' },
    { id: '5', title: 'Very hard' },
  ]);

  useEffect(() => {
    getProfile()
      .then((data) => {
        const user = data.data;
        setProfile({
          name: user.email,
          rank: 1,
          points: user.total_point,
          avatarUrl: '/assets/profileSample.webp',
          univ: user.univ,
        });
      })
      .catch((error) => {
        console.error('프로필 불러오기 실패:', error);
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div className='mypage-container message-container'>
        <p className='error-message'>사용자 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='mypage-container message-container'>
        <Loading />
      </div>
    );
  }

  return (
    <div className='mypage-container'>
      <div className='profile'>
        <div className='avatar'>
          <img
            src={profile.avatarUrl}
            alt='User Avatar'
            className='avatar-image'
          />
        </div>
        <h2>{profile.name}</h2>
        <p>University: {profile.univ}</p>
        <p>Rank: #{profile.rank}</p>
        <p>{profile.points} Points</p>
      </div>

      <div className='problems-section'>
        <h3>Solved</h3>
        <div className='problems-box'>
          {solved.map((problem) => (
            <span
              key={problem.id}
              className='problem-link'
              onClick={() => navigate(`/problem/${problem.id}`)}
            >
              {problem.title}
            </span>
          ))}
        </div>

        <h3>Challenged</h3>
        <div className='problems-box'>
          {challenged.map((problem) => (
            <span
              key={problem.id}
              className='problem-link'
              onClick={() => navigate(`/problem/${problem.id}`)}
            >
              {problem.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
