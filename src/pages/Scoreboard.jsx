import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchLeaderboardData } from '../components/Scoreboard/dataConfig';
import ContentBlock from '../components/Scoreboard/ContentBlock';

const Scoreboard = () => {
  const [datasetsConfig, setDatasetsConfig] = useState([]);

  useEffect(() => {
    
    fetchLeaderboardData(setDatasetsConfig);
  }, []);

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
