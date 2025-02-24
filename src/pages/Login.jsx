import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { signIn } from '../api/SigninApi';

const LoginPage = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 로그인 API에는 필드명이 loginId와 password로 전송 (명세에 맞춤)
      const data = await signIn({ loginId, password });
      setMessage(data.message);
      setIsError(false);
      // 로그인 성공 후 추가 동작 처리 (예: 대시보드 이동)
      // navigate('/dashboard');
    } catch (err) {
      setMessage(err.message || '로그인 실패');
      setIsError(true);
    }
  };

  const handleToggle = () => {
    // 회원가입 페이지로 이동
    navigate('/signup');
  };

  return (
    <PageContainer>
      <FormContainer>
        <Title>로그인</Title>
        <form onSubmit={handleLogin}>
          <Input
            type='text'
            placeholder='로그인 아이디'
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
          />
          <Input
            type='password'
            placeholder='비밀번호'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type='submit'>로그인</Button>
        </form>
        {message && <Message error={isError}>{message}</Message>}
        <ToggleButton onClick={handleToggle}>회원가입 하러가기</ToggleButton>
      </FormContainer>
    </PageContainer>
  );
};

export default LoginPage;

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

const Message = styled.p`
  margin-top: 1rem;
  color: ${({ error }) => (error ? '#f00' : '#cc0033')};
`;
