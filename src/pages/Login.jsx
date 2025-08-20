import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { signIn } from '../api/SigninApi';
import { loginSchema } from '../hook/validationYup';
import Modal2 from '../components/Modal2';

const SESSION_TIMEOUT = 3600;

const Login = ({ setIsLoggedIn }) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(
    () => localStorage.getItem('errorMessage') || ''
  );
  const [isError, setIsError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ loginId: '', password: '' });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const setLoginTime = () => {
    localStorage.setItem('loginTime', Date.now());
  };

  const checkSessionTimeout = () => {
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) return;

    const currentTime = Date.now();
    const elapsedTime = (currentTime - loginTime) / 1000;

    if (elapsedTime > SESSION_TIMEOUT) {
      localStorage.removeItem('loginTime');
      localStorage.removeItem('isLoggedIn');
      setIsLoggedIn(false);
      navigate('/login');
    }
  };

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) {
      navigate('/login');
    }

    const interval = setInterval(() => {
      checkSessionTimeout();
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, setIsLoggedIn]);

  useEffect(() => {
    localStorage.setItem('errorMessage', errorMessage);
  }, [errorMessage]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFieldErrors({ loginId: '', password: '' });
    setIsError(false);

    try {
      await loginSchema.validate(
        { ID: loginId, password },
        { abortEarly: false }
      );

      const data = await signIn({ loginId, password });

      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      setLoginTime();
      setIsModalVisible(true);
      setErrorMessage('');
      navigate('/');
    } catch (err) {
      if (err.inner) {
        const errorsObj = { loginId: '', password: '' };
        err.inner.forEach((error) => {
          if (error.path === 'ID') {
            errorsObj.loginId = error.message;
          }
          if (error.path === 'password') {
            errorsObj.password = error.message;
          }
        });
        setFieldErrors(errorsObj);
      } else {
        setErrorMessage(err.message || '로그인 실패');
      }
      setIsError(true);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    navigate('/');
  };

  return (
    <PageContainer>
      <RightTrapezoidWrapper>
        <RightTrapezoid />
      </RightTrapezoidWrapper>
        <Tag>SUPER<br/>Tasty</Tag>
        <form onSubmit={handleLogin}>
          <Input
            type='text'
            placeholder='아이디'
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />
          {fieldErrors.loginId && (
            <FieldError>{fieldErrors.loginId}</FieldError>
          )}
          <Input
            type='password'
            placeholder='비밀번호'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {fieldErrors.password && (
            <FieldError>{fieldErrors.password}</FieldError>
          )}
          <Button type='submit'>로그인</Button>
        </form>

      {/* 로그인 성공 시 Modal2 표시 */}
      {isModalVisible && (
        <Modal2 onClose={handleModalClose} content='로그인 성공' />
      )}
    </PageContainer>
  );
};

export default Login;


const PageContainer = styled.div`
  background-color: #fff;
  min-height: 100vh;
  min-width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: hidden;
`;

const RightTrapezoidWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 300px;
  overflow: hidden;
  z-index: 0; /* 이 부분이 핵심! 다른 요소보다 뒤로 보냅니다. */
`;

const RightTrapezoid = styled.div`
  position: absolute; /* 주석 해제: 요소를 원하는 위치에 배치 */
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%; /* 100vw는 이미 창 크기에 맞춰 작동 */
  height: 300px; 
  background: linear-gradient(90deg, #ff0000 77%, #ff8c00 100%);
  clip-path: polygon(0 0, 95% 0, 100% 100%, 0 100%);
`;

const Tag = styled.h1`
  color: #ffffff;
  font-weight: bold;
  font-size: 100px;
  margin-bottom: 1.5rem;
  position: absolute; /* 절대 위치를 사용하여 원하는 곳에 배치 */
  top: 45%;
  left: 5%; /* 왼쪽에서 5% 떨어진 위치 */
  transform: translateY(-50%);
  z-index: 1; /* 사다리꼴 위에 나타나게 합니다 */
  /* 추가적으로 텍스트를 정렬하려면 text-align을 사용할 수 있습니다. */
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  background-color: #222;
  border: 1px solid #cc0033;
  color: #cc0033;
  font-size: 1rem;
  border-radius: 5px;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #ff3366;
  }
  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.65rem;
  }
`;

const Button = styled.button`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  text-decoration: none;
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background-color: #cc0033;
  border: none;
  border-radius: 5px;
  color: #000;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #ff3366;
  }
  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.65rem;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #00ff00;
  margin-top: 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  &:hover {
    opacity: 0.8;
  }
`;

const FieldError = styled.p`
  margin: 0rem;
  font-size: 0.8rem;
  color: #00ff00;
  text-align: left;
`;

const Message = styled.p`
  margin-top: 1rem;
  color: ${({ error }) => (error ? '#f00' : '#cc0033')};
`;
