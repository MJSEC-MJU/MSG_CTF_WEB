import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchLeaderboardData } from '../components/Scoreboard/dataConfig';
import ContentBlock from '../components/Scoreboard/ContentBlock';
import Loading from '../components/Loading';

const Scoreboard = () => {
  const [datasetsConfig, setDatasetsConfig] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetchLeaderboardData가 콜백 형태로 데이터를 반환한다고 가정
    fetchLeaderboardData((data) => {
      setDatasetsConfig(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Wrapper>
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <GlitchText>HACKER SCOREBOARD</GlitchText>
      {datasetsConfig.length > 0 ? (
        datasetsConfig.map((dataset) => (
          <ContentBlock key={dataset.title} dataset={dataset} />
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
  width: 100%;
`;

const GlitchText = styled.h1`
  margin-top: 80px;
  color: #8cff66;
  margin-bottom: 20px;
  text-shadow: 0 0 40px rgba(0, 255, 0, 0.8);
  font-size: 3.5rem;
  font-family: 'Courier New', Courier, monospace;
  text-transform: uppercase;
`;

const NoDataText = styled.p`
  font-size: 1.5rem;
  color: red;
  margin-top: 20px;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 20px;
`;
