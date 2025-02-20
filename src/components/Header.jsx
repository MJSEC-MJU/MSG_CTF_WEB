import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Logo from '../assets/MsgLogo.svg';

import loginIcon from '../assets/Login.png';
import logoutIcon from '../assets/Logout.png';
import profileIcon from '../assets/profile.png';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // 임시 콘솔에서 로그인/로그아웃 상태 제어(테스트용)
  // window.login();
  // window.logout();
  useEffect(() => {
    window.login = () => {
      setIsLoggedIn(true);
      console.log('✅ 로그인 상태로 전환되었습니다.');
    };
    window.logout = () => {
      setIsLoggedIn(false);
      console.log('🚪 로그아웃 상태로 전환되었습니다.');
    };
  }, []);

  const handleProfile = () => {
    navigate('/mypage');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    console.log('🚫 로그아웃 되었습니다.');
  };

  return (
    <HeaderWrapper>
      <HeaderContainer>
        <Link to='/'>
          <LogoIcon src={Logo} alt='Logo' />
        </Link>
        <Navigation>
          <StyledLink to='/scoreboard'>Scoreboard</StyledLink>
          <StyledLink to='/challenge'>Challenge</StyledLink>
          <StyledLink to='/ranking'>Ranking</StyledLink>
        </Navigation>
        <UserSection>
          {isLoggedIn ? (
            <>
              <ProfileIcon
                src={profileIcon}
                onClick={handleProfile}
                alt='Profile'
              />
              <AuthIcon src={logoutIcon} alt='Logout' onClick={handleLogout} />
            </>
          ) : (
            <>
              <AuthIcon src={loginIcon} alt='Login' onClick={handleLogin} />
            </>
          )}
        </UserSection>
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

  background-color: #232323;
  background-size: 60px 60px;
  animation: ${backgroundAnimation} 3s linear infinite;
  z-index: 100;
`;

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0 auto;
`;

const LogoIcon = styled.img`
  width: 120px;
  height: 50px;
  object-fit: contain;
  display: block;
  animation: ${blink} 1s steps(2, start) infinite;
`;

const Navigation = styled.nav`
  display: flex;
  justify-content: center;
  gap: 10vw;
  flex-grow: 1;

  @media (max-width: 768px) {
    gap: 5vw;
  }
`;

const StyledLink = styled(Link)`
  color: #ffffff;
  text-decoration: none;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);

  &:hover {
    color: #00ff00;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.7);
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 30px;
`;

const AuthIcon = styled.img`
  width: 40px;
  height: auto;
  cursor: pointer;
`;
const ProfileIcon = styled.img`
  width: 35px;
  height: 35px;
  object-fit: cover;
  cursor: pointer;
`;
