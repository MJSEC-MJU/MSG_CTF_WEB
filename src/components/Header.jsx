import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Cookies from 'js-cookie';
import Logo from '/src/assets/Header/MsgLogo.svg';
import loginIcon from '/src/assets/Header/Login.svg';
import logoutIcon from '/src/assets/Header/Logout.svg';
import profileIcon from '/src/assets/Header/Profile.svg';
import logout from '../api/LogoutApi';
import Modal2 from './Modal2';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 초기 로그인 상태 확인
    const checkLoginStatus = () => {
      const token = Cookies.get('accessToken');
      setIsLoggedIn(!!token);
    };
    checkLoginStatus();

    // 탭 포커스/가시성 복귀 시 재확인
    const handleFocus = () => checkLoginStatus();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkLoginStatus();
    };

    // ★ 로그인/로그아웃 직후 강제 동기화(커스텀 이벤트)
    const handleAuthChanged = () => checkLoginStatus();

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('auth:changed', handleAuthChanged);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('auth:changed', handleAuthChanged);
    };
  }, []);

  const handleProfile = () => navigate('/mypage');
  const handleLogin = () => navigate('/login');

  const handleLogout = async () => {
    try {
      const accessToken = Cookies.get('accessToken');
      if (!accessToken) return;

      // 즉시 로그아웃 상태로 변경 (UX)
      setIsLoggedIn(false);

      await logout();
      //  모든 컴포넌트에 "상태 바뀜" 알림
      window.dispatchEvent(new Event('auth:changed'));
      navigate('/');
    } catch (error) {
      // 실패해도 로그아웃 처리 (쿠키는 이미 삭제됨)
      window.dispatchEvent(new Event('auth:changed'));
      navigate('/');
    }
  };

  // ★ 클릭 시점마다 최신 쿠키로 판정(핵심 패치)
  const handleNavigation = (e, targetPage) => {
    e.preventDefault();
    const authedNow = !!Cookies.get('accessToken');
    if (!authedNow) setIsModalVisible(true);
    else navigate(targetPage);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    navigate('/login');
  };

  return (
    <HeaderWrapper>
      <HeaderContainer>
        <LogoWrap to="/">
          <LogoIcon src={Logo} alt="Logo" />
        </LogoWrap>

        <Navigation aria-label="global">
          <StyledLink onClick={(e) => handleNavigation(e, '/scoreboard')}>
            Scoreboard
          </StyledLink>
          <StyledLink onClick={(e) => handleNavigation(e, '/challenge')}>
            Challenge
          </StyledLink>
          <StyledLink onClick={(e) => handleNavigation(e, '/ranking')}>
            Ranking
          </StyledLink>
        </Navigation>

        <UserSection>
          {isLoggedIn ? (
            <>
              <ProfileIcon
                src={profileIcon}
                onClick={handleProfile}
                alt="Profile"
              />
              <AuthIcon src={logoutIcon} alt="Logout" onClick={handleLogout} />
            </>
          ) : (
            <AuthIcon src={loginIcon} alt="Login" onClick={handleLogin} />
          )}
        </UserSection>
      </HeaderContainer>

      {isModalVisible && (
        <Modal2 onClose={handleModalClose} content="로그인 해주세요!" />
      )}
    </HeaderWrapper>
  );
};

export default Header;

/* ========================= */
/* styled-components (반응형) */
/* ========================= */

const backgroundAnimation = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: -30px -30px; }
`;

const HeaderWrapper = styled.div`
  position: fixed;
  inset: 0 0 auto 0;
  width: 100%;
  background-color: #232323;
  background-size: 60px 60px;
  animation: ${backgroundAnimation} 3s linear infinite;
  z-index: 100;
  box-sizing: border-box;

  /* iOS safe area 대응 */
  padding-top: env(safe-area-inset-top, 0);

  /* 살짝 블러 (홈과 톤 맞춤) */
  backdrop-filter: saturate(120%) blur(4px);
`;

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  max-width: 1780px;
  margin: 0 auto;

  height: 72px;
  padding: 0 16px;

  @media (max-width: 420px) {
    height: 56px;
    padding: 0 10px;
    gap: 10px;
  }
`;

const LogoWrap = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-width: 0;
`;

const LogoIcon = styled.img`
  width: 180px;
  height: 120px;
  object-fit: contain;
  display: block;

  @media (max-width: 768px) {
    width: 100px;
    height: 42px;
  }
  @media (max-width: 420px) {
    width: 84px;
    height: 36px;
    animation: none; /* 작은 화면에서 깜빡임 제거 */
  }
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;

  flex: 1 1 auto;
  min-width: 0;
  gap: clamp(16px, 6vw, 140px);
  white-space: nowrap;

  @media (max-width: 768px) {
    gap: clamp(12px, 5vw, 60px);
  }
  @media (max-width: 420px) {
    gap: clamp(8px, 4vw, 32px);
  }
`;

const StyledLink = styled(Link)`
  color: #ffffff;
  text-decoration: none;
  font-weight: 800;
  font-size: clamp(12px, 2.4vw, 20px);
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);

  &:hover {
    color: #ff5500ff;
    text-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
  }

  @media (max-width: 420px) {
    padding: 6px 4px; /* 손가락 터치 타겟 */
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 6px;

  @media (max-width: 768px) {
    gap: 8px;
    margin-right: 4px;
  }
  @media (max-width: 420px) {
    gap: 6px;
    margin-right: 2px;
  }
`;

const AuthIcon = styled.img`
  width: 40px;
  height: auto;
  cursor: pointer;
  flex-shrink: 0;

  @media (max-width: 768px) { width: 34px; }
  @media (max-width: 420px) { width: 30px; }
`;

const ProfileIcon = styled.img`
  width: 35px;
  height: 35px;
  object-fit: cover;
  cursor: pointer;
  border-radius: 50%;
  flex-shrink: 0;

  @media (max-width: 768px) { width: 30px; height: 30px; }
  @media (max-width: 420px) { width: 28px; height: 28px; }
`;
