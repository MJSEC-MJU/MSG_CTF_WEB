// SignupPage.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { signUp, checkId, checkEmail } from '../api/Axios';

const PageContainer = styled.div`
  background-color: #000;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FormContainer = styled.div`
  background-color: #111;
  padding: 2rem;
  border: 1px solid #cc0033;
  border-radius: 10px;
  box-shadow: 0 0 15px #cc0033;
  width: 90%;
  max-width: 400px;
  text-align: center;
  font-family: 'Courier New', Courier, monospace;
`;

const Title = styled.h1`
  color: #cc0033;
  margin-bottom: 1.5rem;
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
  &:focus {
    outline: none;
    border-color: #ff3366;
  }
`;

const CheckButton = styled.button`
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

const Message = styled.p`
  margin-top: 1rem;
  color: ${({ error }) => (error ? '#f00' : '#cc0033')};
`;

const SignupPage = () => {
  // 백엔드가 요구하는 필드명: loginId (camelCase)
  const [loginId, setLoginId] = useState('');
  const [univ, setUniv] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupMessage, setSignupMessage] = useState('');
  const [isSignupError, setIsSignupError] = useState(false);

  // 아이디, 이메일 중복 체크 결과 메시지
  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [emailCheckMessage, setEmailCheckMessage] = useState('');

  // 아이디 중복 체크 API 호출
  const handleIdCheck = async () => {
    try {
      const data = await checkId(loginId);
      setIdCheckMessage(data.message);
    } catch (error) {
      setIdCheckMessage(error.message || '아이디 중복 확인 실패');
    }
  };

  // 이메일 중복 체크 API 호출
  const handleEmailCheck = async () => {
    try {
      const data = await checkEmail(email);
      setEmailCheckMessage(data.message);
    } catch (error) {
      setEmailCheckMessage(error.message || '이메일 중복 확인 실패');
    }
  };

  // 회원가입 API 호출
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // 백엔드 요구에 맞춰 필드명을 loginId로 전송
      const data = await signUp({ loginId, univ, email, password });
      setSignupMessage(data.message);
      setIsSignupError(false);
      // 회원가입 성공 후 추가 동작 (예: 로그인 페이지로 이동) 처리 가능
    } catch (err) {
      setSignupMessage(err.message || '회원가입 실패');
      setIsSignupError(true);
    }
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
          <InputRow>
            <Input
              type='text'
              placeholder='학교명'
              value={univ}
              onChange={(e) => setUniv(e.target.value)}
              required
            />
          </InputRow>
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
          <InputRow>
            <Input
              type='password'
              placeholder='비밀번호'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputRow>
          <Button type='submit'>회원가입</Button>
        </form>
        {signupMessage && (
          <Message error={isSignupError}>{signupMessage}</Message>
        )}
      </FormContainer>
    </PageContainer>
  );
};

export default SignupPage;
