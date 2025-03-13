import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../api/ProfileAPI';
import Loading from '../components/Loading';
import './MyPage.css';

const MyPage = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);

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

  // 1. 프로필 데이터 가져오기
  useEffect(() => {
    getProfile()
      .then((data) => {
        const user = data.data;
        // user_id를 포함해서 상태 업데이트 (user_id는 리더보드와 매칭하기 위해 필요)
        setProfile({
          loginId: user.loginId,
          user_id: user.user_id,
          name: user.email,
          rank: 1, // 초기값 (SSE에서 업데이트됨)
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

  useEffect(() => {
    if (!profile) return; 

    const eventSource = new EventSource('https://msg.mjsec.kr/api/leaderboard/stream');

    eventSource.onmessage = (event) => {
      try {
        let jsonStr = event.data;
        if (jsonStr.startsWith("data:")) {
          jsonStr = jsonStr.substring(5);
        }
        
        const payload = JSON.parse(jsonStr);
      
        const leaderboard = Array.isArray(payload) ? payload : payload.data;
        
        if (!Array.isArray(leaderboard)) {
          console.error("리더보드 데이터 형식이 올바르지 않습니다:", leaderboard);
          return;
        }
        
        const rankIndex = leaderboard.findIndex(item => item.userid === profile.loginId);
        if (rankIndex !== -1) {
          setProfile(prev => ({ ...prev, rank: rankIndex + 1 }));
        }
      } catch (err) {
        console.error('SSE 데이터 파싱 에러:', err);
      }
    };
    
    
    

    eventSource.onerror = (err) => {
      console.error('SSE 연결 에러:', err);
      setLeaderboardError(true);
      eventSource.close();
    };

    // 컴포넌트 언마운트 시 SSE 연결 종료
    return () => {
      eventSource.close();
    };
  }, [profile]);

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

      {leaderboardError && (
        <p className="error-message">리더보드 업데이트에 실패했습니다.</p>
      )}
    </div>
  );
};

export default MyPage;
