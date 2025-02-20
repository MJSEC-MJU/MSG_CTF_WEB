import { useState } from 'react';
import styled from 'styled-components';
import { loginSchema } from '../hook/validationYup';

function AdminLogin() {
  const [ID, setID] = useState('');
  const [password, setPassword] = useState('');
  const [IDError, setIDError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleIDBlur = async () => {
    try {
      await loginSchema.validateAt('ID', { ID });
      setIDError('');
    } catch (err) {
      setIDError(err.message);
    }
  };

  const handlePasswordBlur = async () => {
    try {
      await loginSchema.validateAt('password', { password });
      setPasswordError('');
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginSchema.validate({ ID, password }, { abortEarly: false });
      setIDError('');
      setPasswordError('');
      console.log('로그인 시도:', ID, password);
      // 실제 로그인 로직 추가
    } catch (err) {
      let idError = '';
      let pwdError = '';
      err.inner.forEach((error) => {
        if (error.path === 'ID') {
          idError = error.message;
        }
        if (error.path === 'password') {
          pwdError = error.message;
        }
      });
      setIDError(idError);
      setPasswordError(pwdError);
    }
  };

  return (
    <Container>
      <Terminal>
        <Title>ADMIN LOGIN</Title>
        <Subtitle>접근 권한이 있는 사용자만 로그인 할 수 있습니다.</Subtitle>
        <Form onSubmit={handleLogin}>
          <Label>
            ID
            <Input
              type='text'
              value={ID}
              onChange={(e) => setID(e.target.value)}
              onBlur={handleIDBlur}
              placeholder='아이디 입력'
            />
            {IDError && <ErrorText>{IDError}</ErrorText>}
          </Label>
          <Label>
            Password
            <Input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handlePasswordBlur}
              placeholder='비밀번호 입력'
            />
            {passwordError && <ErrorText>{passwordError}</ErrorText>}
          </Label>
          <LoginButton type='submit'>Login</LoginButton>
        </Form>
        <FooterText>무단 접근 시 법적 조치가 따릅니다.</FooterText>
      </Terminal>
    </Container>
  );
}

export default AdminLogin;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #000;
`;

const Terminal = styled.div`
  width: 400px;
  padding: 2rem;
  background: #111;
  border: 2px solid #f97c7c;
  box-shadow: 0 0 20px rgba(251, 0, 0, 0.5);
  color: #f97c7c;
  font-family: 'Courier New', Courier, monospace;
  position: relative;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  text-align: center;
  letter-spacing: 2px;
`;

const Subtitle = styled.p`
  text-align: center;
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 1rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  text-align: left;
`;

const Input = styled.input`
  margin-top: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #f97c7c;
  background: #000;
  color: #0f0;
  font-family: 'Courier New', Courier, monospace;
  outline: none;
  &::placeholder {
    color: #f97c7c;
    opacity: 0.5;
  }
  &:focus {
    border-color: #0f0;
  }
`;

const LoginButton = styled.button`
  padding: 0.8rem;
  margin-top: 1rem;
  border: 1px solid #f97c7c;
  background: transparent;
  color: #f97c7c;
  font-size: 1rem;
  cursor: pointer;
  font-family: 'Courier New', Courier, monospace;
  &:hover {
    background: #0f0;
    color: #000;
  }
`;

const FooterText = styled.p`
  margin-top: 1.5rem;
  font-size: 0.8rem;
  text-align: center;
  opacity: 0.6;
`;

const ErrorText = styled.p`
  margin-top: 0.3rem;
  color: #0f0;
  font-size: 0.85rem;
  text-align: left;
`;
