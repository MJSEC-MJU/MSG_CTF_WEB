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

  useEffect(() => {
    // 마운트 시 배경색 변경
    const prevColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#505050";

    // 언마운트 시 원래 배경 복구
    return () => {
      document.body.style.backgroundColor = prevColor;
    };
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
  background: #505050
`;

const GlitchText = styled.h1`
  font-size: 3.5rem;
  font-family: 'Courier New', Courier, monospace;
  text-transform: uppercase;
  color: #ff4500; /* 불 느낌 주황 */
  text-shadow: 
    0 0 5px #ff6347,
    0 0 10px #ff4500,
    0 0 20px #ff0000,
    0 0 40px #ff8c00,
    0 0 80px #ff4500;
  animation: flicker 1.5s infinite alternate;
  
  @keyframes flicker {
    0%   { opacity: 1; text-shadow: 0 0 5px #ff6347, 0 0 10px #ff4500, 0 0 20px #ff0000, 0 0 40px #ff8c00, 0 0 80px #ff4500; }
    50%  { opacity: 0.8; text-shadow: 0 0 3px #ff6347, 0 0 6px #ff4500, 0 0 12px #ff0000, 0 0 24px #ff8c00, 0 0 48px #ff4500; }
    100% { opacity: 1; text-shadow: 0 0 6px #ff6347, 0 0 12px #ff4500, 0 0 24px #ff0000, 0 0 48px #ff8c00, 0 0 96px #ff4500; }
  }
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