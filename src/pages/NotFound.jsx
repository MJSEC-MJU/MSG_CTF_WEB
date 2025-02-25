import 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <NotFoundWrapper>
      <GlitchText>404</GlitchText>
      <Message>Page Not Found</Message>
      <HomeLink to='/'>Go Back to Home</HomeLink>
    </NotFoundWrapper>
  );
};

export default NotFound;

const NotFoundWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;

  color: #8cff66;
  text-align: center;

  overflow: hidden;
  position: relative;
  padding: 20px;
  animation: backgroundAnimation 10s linear infinite;
`;

const GlitchText = styled.h1`
  font-size: 10rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #8cff66;
  position: relative;
  z-index: 1;

  &::before {
    content: '404';
    position: absolute;
    left: 0;
    top: 0;
    color: red;
    z-index: -1;
    animation: glitch 1.5s infinite;
  }

  @keyframes glitch {
    0% {
      transform: translate(2px, 2px);
    }
    25% {
      transform: translate(-2px, -2px);
    }
    50% {
      transform: translate(2px, 2px);
    }
    75% {
      transform: translate(-2px, -2px);
    }
    100% {
      transform: translate(2px, 2px);
    }
  }
`;

const Message = styled.p`
  font-size: 2rem;
  margin: 10px 0;
  color: #fff;
  animation: fadeIn 2s ease-in-out;
`;

const HomeLink = styled(Link)`
  font-size: 1.5rem;
  color: #8cff66;
  text-decoration: none;
  margin-top: 20px;
  padding: 10px 20px;
  border: 2px solid #8cff66;
  border-radius: 10px;
  background-color: #0a0a0a;
  transition: all 0.3s ease;

  &:hover {
    background-color: #8cff66;
    color: #0a0a0a;
    text-decoration: none;
  }
`;
