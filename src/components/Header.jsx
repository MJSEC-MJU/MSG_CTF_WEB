import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Logo from '../assets/MsgLogo.svg';

// Header 컴포넌트 정의
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

// 스타일 정의
const HeaderWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 1rem;
  background-color: #232323;
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
`;

const Navigation = styled.nav`
  display: flex;
  justify-content: space-around;
  flex-grow: 1;
  margin-left: 20px; // 로고와 네비게이션 사이의 간격
`;

const StyledLink = styled(Link)`
  color: #ffffff;
  text-decoration: none;
  font-size: 16px;
  font-weight: bold;
  &:hover {
    text-decoration: underline;
  }
`;
