import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const Loading = () => {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 9000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingContainer>
      {timedOut ? (
        <ErrorText>데이터를 불러올 수 없습니다</ErrorText>
      ) : (
        <Spinner />
      )}
    </LoadingContainer>
  );
};

export default Loading;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  border: 8px solid rgba(0, 255, 0, 0.2);
  border-top: 8px solid #00ff00;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: ${rotate} 1.5s linear infinite;
`;

const ErrorText = styled.div`
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.8rem;
  color: #ff0000;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 30px #ff0000;
`;
