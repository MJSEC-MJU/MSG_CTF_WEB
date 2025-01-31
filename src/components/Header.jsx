import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Logo from '../assets/MsgLogo.svg';

const Header = () => {
  return (
    <HeaderWrapper>
      <HeaderContainer>
        <LogoIcon src={Logo} alt='Logo' />
        <Navigation>
          <StyledLink to='/scoreboard'>Scoreboard</StyledLink>
          <StyledLink to='/challenge'>Challenge</StyledLink>
          <StyledLink to='/ranking'>Ranking</StyledLink>
          <StyledLink to='/rule'>Rule</StyledLink>
        </Navigation>
      </HeaderContainer>
    </HeaderWrapper>
  );
};

export default Header;

const backgroundAnimation = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: -30px -30px; }
`;

const blink = keyframes`
  50% { opacity: 0; }
`;

const HeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 1rem;
  background-color: #232323;
  background-size: 60px 60px;
  animation: ${backgroundAnimation} 3s linear infinite;
  z-index: 100;
`;

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0 auto;
`;

const LogoIcon = styled.img`
  width: 120px;
  height: auto;
  animation: ${blink} 1s steps(2, start) infinite;
`;

const Navigation = styled.nav`
  display: flex;
  justify-content: space-around;
  flex-grow: 1;
  margin-left: 20px;
`;

const StyledLink = styled(Link)`
  color: #ffffff;
  text-decoration: none;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);

  &:hover {
    color: #00ff00;
    text-decoration: none;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
  }
`;
