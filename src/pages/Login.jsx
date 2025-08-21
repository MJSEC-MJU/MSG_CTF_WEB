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

      <ContentWrapper>
        <Tag>
          SUPER<br />
          TASTY
        </Tag>
        <InputWrapper>
          <PatternWrapper>
            <Pattern/>
            <PatternReverse/>
            <Pattern/>
            <PatternReverse/>
            <Pattern/>
            <PatternReverse/>
          </PatternWrapper>
          <Label>ID</Label>
          <Input
            type='text'
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />
          {fieldErrors.loginId && <FieldError>{fieldErrors.loginId}</FieldError>}
          <Label><br/>Password</Label>
          <Input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {fieldErrors.password && <FieldError>{fieldErrors.password}</FieldError>}
          <br/>
          <ButtonWrapper>
            <Button onClick={handleLogin}>Log In</Button>
          </ButtonWrapper>
        </InputWrapper>
      </ContentWrapper>

      {/* 로그인 성공 시 Modal2 표시 */}
      {isModalVisible && <Modal2 onClose={handleModalClose} content='로그인 성공' />}
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
  position: fixed;
  top: 55%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 300px;
  overflow: hidden;
  z-index: 0;
`;

const RightTrapezoid = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 250px;
  background: linear-gradient(90deg, #ff0000 77%, #ff8c00 100%);
  clip-path: polygon(0 0, 100% 0, 95% 100%, 0 100%);
`;

// Content wrapper
const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  position: relative;
  width: 100%;
`;

const Tag = styled.h1`
  color: #ffffff;
  font-weight: bold;
  font-size: 95px;
  margin-bottom: 1.5rem;
  position: absolute;
  top:35%;
  left: 0%;
  transform: translateY(-50%);
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

// Input Wrapper
const InputWrapper = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 4px 4px 15px #ff0000;
  display: flex;
  flex-direction: column;
  width: 500px;
  max-width: 90%;
  z-index: 3;
  position: relative;
  margin-left: -6%;
  align-items: stretch; 
  min-height: 450px;
  
  @media (max-width: 768px) {
    margin-left: 8%;
    width: 350px;
  }
  @media (max-width: 480px) {
    width: 300px;
    padding: 1.5rem;
    margin-left: 5%;
  }
`;

//Pattern Wrapper
const PatternWrapper = styled.div`
  width: 113%;
  height: 90px;
  overflow: hidden;
  margin-bottom: 1rem;
  border-radius: 10px 10px 0 0;
  margin: -2rem -2rem 1rem -2rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(0,0,0,0) 0%,
      rgba(0,0,0,0.2) 100%
    );
    pointer-events: none;
  }
`;

const Pattern = styled.div`
  width: 200%;
  height: 15px;
  background: repeating-linear-gradient(
    90deg,
    #ff0000 0px,
    #ff0000 30px,
    #ffffff 30px,
    #ffffff 60px
  );
  transform: skewX(-30deg);
`;

const PatternReverse = styled.div`
  width: 200%;
  height: 15px;
  background: repeating-linear-gradient(
    90deg,
    #ffffff 0px,
    #ffffff 30px,
    #ff0000 30px,
    #ff0000 60px
  );
  transform: skewX(-30deg);
`;

const Label = styled.label`
  font-size: 1.2rem;
  color: #B50202;
  text-align: left;
  margin-bottom: 0.25rem;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  margin: 0.5rem 0;
  background-color: #fff;
  border: 2px solid #B50202;
  color: #000;
  font-size: 1rem;
  border-radius: 20px;
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

const ButtonWrapper = styled.div`
  text-align: right;
  margin-top: 1rem;
`;

const Button = styled.button`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  text-decoration: none;
  width: 150px;
  padding: 0.75rem;
  margin-top: 1rem;
  background: linear-gradient(90deg, #F00000 0%, #F9D905 100%);
  border: none;
  border-radius: 30px;
  color: #fff;
  font-size: 1rem;
  font-weight: bold;
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

const FieldError = styled.p`
  margin: 0rem;
  font-size: 0.8rem;
  color: #FF0000;
  text-align: left;
  min-height: 1rem;
`;

const Message = styled.p`
  margin-top: 1rem;
  color: ${({ error }) => (error ? '#f00' : '#cc0033')};
`;