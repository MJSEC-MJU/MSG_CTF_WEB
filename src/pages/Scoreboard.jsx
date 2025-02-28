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

  return (
    <Wrapper>
      <GlitchText>HACKER SCOREBOARD</GlitchText>
      {loading ? (
        <LoadingWrapper>
          <Loading />
        </LoadingWrapper>
      ) : datasetsConfig.length > 0 ? (
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
  margin-bottom: 20px;
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
