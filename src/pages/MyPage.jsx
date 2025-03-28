import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../api/ProfileAPI';
import { fetchProblems } from '../api/ChallengeAllAPI';
import Loading from '../components/Loading';
import './MyPage.css';

const MyPage = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);

  // 문제 데이터 관련 상태
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [unsolvedProblems, setUnsolvedProblems] = useState([]);
  const [problemsLoading, setProblemsLoading] = useState(true);
  const [problemsError, setProblemsError] = useState(false);

  // 1. 프로필 데이터 가져오기
  useEffect(() => {
    getProfile()
      .then((data) => {
        const user = data.data;
        setProfile({
          loginId: user.loginId,
          user_id: user.user_id,
          name: user.email,
          rank: 1, // 초기값, SSE로 업데이트됨
          points: user.total_point,
          avatarUrl: '/assets/profileSample.webp',
          univ: user.univ,
        });
      })
      .catch((error) => {
        //console.error('프로필 불러오기 실패:', error);
        setProfileError(true);
      });
  }, []);

  // 2. 문제 데이터 가져오기 및 분리 (푼 문제 vs 안 푼 문제)
  useEffect(() => {
    setProblemsLoading(true);
    fetchProblems(0, 20)
      .then(({ problems }) => {
        // solved 속성이 boolean 타입이므로, true이면 푼 문제, false이면 안 푼 문제로 분리
        const solved = problems.filter(problem => problem.solved === true);
        const unsolved = problems.filter(problem => problem.solved === false);
        setSolvedProblems(solved);
        setUnsolvedProblems(unsolved);
      })
      .catch(error => {
        //console.error("문제 데이터를 불러오는 중 오류 발생:", error);
        setProblemsError(true);
      })
      .finally(() => {
        setProblemsLoading(false);
      });
  }, []);

  // 3. 리더보드 SSE 연결
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
          //console.error("리더보드 데이터 형식이 올바르지 않습니다:", leaderboard);
          return;
        }
        const rankIndex = leaderboard.findIndex(item => item.userId === profile.loginId);
        if (rankIndex !== -1) {
          setProfile(prev => ({ ...prev, rank: rankIndex + 1 }));
        }
      } catch (err) {
        //console.error('SSE 데이터 파싱 에러:', err);
      }
    };

    eventSource.onerror = (err) => {
      //console.error('SSE 연결 에러:', err);
      setLeaderboardError(true);
      eventSource.close();
    };

    // 컴포넌트 언마운트 시 SSE 연결 종료
    return () => {
      eventSource.close();
    };
  }, [profile]);

  if (profileError) {
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
          <img src={profile.avatarUrl} alt='User Avatar' className='avatar-image' />
        </div>
        <h2>{profile.name}</h2>
        <p>University: {profile.univ}</p>
        <p>Rank: #{profile.rank}</p>
        <p>{profile.points} Points</p>
      </div>

      <div className='problems-section'>
        <h3>Solved Problems</h3>
        <div className='problems-box'>
          {problemsLoading ? (
            <Loading />
          ) : problemsError ? (
            <p className='error-message'>문제 데이터를 불러오는 중 오류가 발생했습니다.</p>
          ) : solvedProblems.length ? (
            solvedProblems.map(problem => (
              <span
                key={problem.challengeId}
                className='problem-link'
                onClick={() => navigate(`/problem/${problem.challengeId}`)}
              >
                {problem.title} ({problem.points} pts)
              </span>
            ))
          ) : (
            <p>푼 문제가 없습니다.</p>
          )}
        </div>

        <h3>Unsolved Problems</h3>
        <div className='problems-box'>
          {problemsLoading ? (
            <Loading />
          ) : problemsError ? (
            <p className='error-message'>문제 데이터를 불러오는 중 오류가 발생했습니다.</p>
          ) : unsolvedProblems.length ? (
            unsolvedProblems.map(problem => (
              <span
                key={problem.challengeId}
                className='problem-link'
                onClick={() => navigate(`/problem/${problem.challengeId}`)}
              >
                {problem.title} ({problem.points} pts)
              </span>
            ))
          ) : (
            <p>안 푼 문제가 없습니다.</p>
          )}
        </div>
      </div>

      {leaderboardError && (
        <p className="error-message">리더보드 업데이트에 실패했습니다.</p>
      )}
    </div>
  );
};

export default MyPage;
