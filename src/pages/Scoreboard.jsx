import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ContentBlock from '../components/Scoreboard/ContentBlock';

const Scoreboard = () => {
  const [datasetsConfig, setDatasetsConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('api_token'); // 로컬 스토리지에서 토큰 가져오기

        if (!token) {
          throw new Error('API 토큰이 없습니다');
        }

        const response = await fetch(
          'https://msg.mjsec.kr/api/leaderboard/stream',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`, // Authorization 헤더에 토큰 추가
            },
          }
        );

        if (!response.ok) {
          throw new Error(`API 응답에 문제가 발생했습니다: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched data:', data);

        const formattedData = data.data.map((item) => ({
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
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('데이터를 불러오는 데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchData();
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
