import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { signUp, checkId, checkEmail } from '../api/SignupApi';
import { signupSchema } from '../hook/validationYup';
import Modal from '../components/Modal2';

const SignupPage = () => {
  const [loginId, setLoginId] = useState('');
  const [univ, setUniv] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [signupMessage, setSignupMessage] = useState('');
  const [isSignupError, setIsSignupError] = useState(false);

  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [emailCheckMessage, setEmailCheckMessage] = useState('');

  const [fieldErrors, setFieldErrors] = useState({
    loginId: '',
    univ: '',
    email: '',
    password: '',
  });

  // 모달 표시 여부 상태
  const [isModalVisible, setIsModalVisible] = useState(false);

  const navigate = useNavigate();

  const handleIdCheck = async () => {
    try {
      const data = await checkId(loginId);
      setIdCheckMessage(data.message);
    } catch (error) {
      setIdCheckMessage(error.message || '아이디 중복 확인 실패');
    }
  };

  const handleEmailCheck = async () => {
    try {
      const data = await checkEmail(email);
      setEmailCheckMessage(data.message);
    } catch (error) {
      setEmailCheckMessage(error.message || '이메일 중복 확인 실패');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    setFieldErrors({ loginId: '', univ: '', email: '', password: '' });
    setSignupMessage('');

    try {
      await signupSchema.validate(
        { loginId, univ, email, password },
        { abortEarly: false }
      );

      const data = await signUp({ loginId, univ, email, password });
      setSignupMessage(data.message);
      setIsSignupError(false);
      // 회원가입 성공 시 모달 띄움
      setIsModalVisible(true);
    } catch (err) {
      if (err.inner) {
        const errorsObj = { loginId: '', univ: '', email: '', password: '' };
        err.inner.forEach((error) => {
          if (error.path === 'loginId') {
            errorsObj.loginId = error.message;
          }
          if (error.path === 'univ') {
            errorsObj.univ = error.message;
          }
          if (error.path === 'email') {
            errorsObj.email = error.message;
          }
          if (error.path === 'password') {
            errorsObj.password = error.message;
          }
        });
        setFieldErrors(errorsObj);
      } else {
        setSignupMessage(err.message || '회원가입 실패');
        setIsSignupError(true);
      }
    }
  };

  // 모달 닫기 시 로그인 페이지로 이동
  const handleModalClose = () => {
    setIsModalVisible(false);
    navigate('/login');
  };

  const handleToggle = () => {
    navigate('/login');
  };

  return (
    <PageContainer>
      <FormContainer>
        <Title>회원가입</Title>
        <form onSubmit={handleSignUp}>
          <InputRow>
            <Input
              type='text'
              placeholder='로그인 아이디'
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
            />
            <CheckButton type='button' onClick={handleIdCheck}>
              확인
            </CheckButton>
          </InputRow>
          {idCheckMessage && (
            <Message error={idCheckMessage.includes('사용할 수 없는')}>
              {idCheckMessage}
            </Message>
          )}
          {fieldErrors.loginId && (
            <FieldError>{fieldErrors.loginId}</FieldError>
          )}

          <InputRow>
            <Input
              type='text'
              placeholder='학교명'
              value={univ}
              onChange={(e) => setUniv(e.target.value)}
              required
            />
          </InputRow>
          {fieldErrors.univ && <FieldError>{fieldErrors.univ}</FieldError>}

          <InputRow>
            <Input
              type='email'
              placeholder='이메일'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <CheckButton type='button' onClick={handleEmailCheck}>
              확인
            </CheckButton>
          </InputRow>
          {emailCheckMessage && (
            <Message error={emailCheckMessage.includes('사용 중인')}>
              {emailCheckMessage}
            </Message>
          )}
          {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}

          <InputRow>
            <Input
              type='password'
              placeholder='비밀번호'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputRow>
          {fieldErrors.password && (
            <FieldError>{fieldErrors.password}</FieldError>
          )}

          <Button type='submit'>회원가입</Button>
        </form>

        {signupMessage && (
          <Message error={isSignupError}>{signupMessage}</Message>
        )}

        <ToggleButton onClick={handleToggle}>로그인 하러 가기</ToggleButton>
      </FormContainer>

      {/* 모달 표시 */}
      {isModalVisible && (
        <Modal onClose={handleModalClose} content='회원가입이 완료' />
      )}
    </PageContainer>
  );
};

export default SignupPage;

/* styled-components */
const PageContainer = styled.div`
  background-color: #000;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const FormContainer = styled.div`
  background-color: #111;
  padding: 2rem;
  border: 1px solid #cc0033;
  border-radius: 10px;
  box-shadow: 0 0 15px #cc0033;
  width: 100%;
  max-width: 400px;
  text-align: center;
  font-family: 'Courier New', Courier, monospace;
`;

const Title = styled.h1`
  color: #cc0033;
  margin-bottom: 1.5rem;
  font-size: 2rem;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
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
`;

const CheckButton = styled.button`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
  margin-left: 0.5rem;
  padding: 0.75rem;
  background-color: #cc0033;
  border: none;
  border-radius: 5px;
  color: #000;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #ff3366;
  }
`;

const Button = styled.button`
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

const Message = styled.p`
  margin-top: 1rem;
  color: ${({ error }) => (error ? '#f00' : '#cc0033')};
`;

const FieldError = styled.p`
  margin: 0rem;
  font-size: 0.8rem;
  color: #00ff00;
  text-align: left;
`;
