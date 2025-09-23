import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Loading from '../components/Loading';
import ContentBlock from '../components/Scoreboard/ContentBlock';
import { fetchLeaderboardData } from '../components/Scoreboard/dataConfig';

const Scoreboard = () => {
  const [datasetsConfig, setDatasetsConfig] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData(setDatasetsConfig, setLoading);
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
      <GlitchText>SCOREBOARD</GlitchText>
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
  min-height: 100vh;
  // background: #505050
`;

const GlitchText = styled.h1`
  font-size: 3.5rem;
  font-family: 'Courier New', Courier, monospace;
  text-transform: uppercase;
  background: linear-gradient(to right, #ff4500 20%, #dc0000 100%);
  -webkit-background-clip: text;  /* 크롬, 사파리 */
  -webkit-text-fill-color: transparent;
  background-clip: text;          /* 파이어폭스 최신 버전 */
  color: transparent; 
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