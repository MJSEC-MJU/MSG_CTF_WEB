import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ContentBlock from '../components/Scoreboard/ContentBlock';

const Scoreboard = () => {
  const [datasetsConfig, setDatasetsConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('api_token');

    if (!token) {
      setError('API 토큰이 없습니다');
      setLoading(false);
      return;
    }

    // 쿠키 인증을 포함한 EventSource 요청
    const eventSource = new EventSource(
      'https://msg.mjsec.kr/api/leaderboard/stream',
      {
        withCredentials: true, // 쿠키를 포함시켜 요청을 보냄
      }
    );

    eventSource.onopen = () => {
      console.log('SSE 연결이 열렸습니다.');
      setLoading(false); // 데이터 로딩이 완료되었음을 표시
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 데이터를 포맷팅하여 상태에 업데이트
        const formattedData = data.map((item) => ({
          title: item.univ || 'Individual Ranking',
          data: [
            {
              id: item.userid,
              scores: [item.totalPoint],
              color: 'rgba(54, 162, 235, 1)',
            },
          ],
        }));

        setDatasetsConfig(formattedData);
      } catch (err) {
        console.error('데이터 처리 중 오류 발생:', err);
        setError('데이터 처리에 실패했습니다.');
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE 오류 발생:', error);
      setError('실시간 데이터 스트리밍에 오류가 발생했습니다.');
    };

    // 컴포넌트가 unmount될 때 SSE 연결을 닫음
    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) {
    return <Wrapper>Loading...</Wrapper>;
  }

  return (
    <Wrapper>
      <GlitchText>HACKER SCOREBOARD</GlitchText>
      {error && <NoDataText>{error}</NoDataText>}
      {datasetsConfig.length > 0 ? (
        datasetsConfig.map((dataset, index) => (
          <ContentBlock key={index} dataset={dataset} />
        ))
      ) : (
        <NoDataText>No data available</NoDataText>
      )}
    </Wrapper>
  );
};

export default Scoreboard;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #0d0d0d;
  color: #8cff66;
  padding: 20px;
  width: 100%;
`;

const GlitchText = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #8cff66;
  text-shadow: 0 0 10px #ffffff;
`;

const NoDataText = styled.p`
  font-size: 1.5rem;
  color: red;
  margin-top: 20px;
`;
