import styled from 'styled-components';

export const GlobalStyle = styled.div`
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');
  body {
    margin: 0;
    font-family: 'Roboto Mono', monospace;
    background-color: #0d0d0d;
    color: #e0e0e0;
  }
`;

export const PageContainer = styled.div`
  background: linear-gradient(135deg, #1a1a1a, #0d0d0d);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

export const FormContainer = styled.div`
  background-color: #111;
  padding: 2.5rem 2rem;
  border: 1px solid #cc0033;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(204, 0, 51, 0.7);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

export const Title = styled.h1`
  color: #cc0033;
  margin-bottom: 1.5rem;
  font-size: 2.2rem;
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

export const InputRow = styled.div`
  display: flex;
  align-items: center;
  margin: 0.6rem 0;
`;

export const Input = styled.input`
  flex: 1;
  padding: 0.85rem;
  background-color: #222;
  border: 1px solid #cc0033;
  color: #e0e0e0;
  font-size: 1rem;
  border-radius: 5px;
  transition: border-color 0.3s;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #ff3366;
  }
  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.75rem;
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: 0.85rem;
  margin-top: 1.2rem;
  background-color: #cc0033;
  border: none;
  border-radius: 5px;
  color: #0d0d0d;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.2s;
  &:hover {
    background-color: #ff3366;
    transform: scale(1.02);
  }
  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.75rem;
  }
`;

export const CheckButton = styled(Button)`
  width: auto;
  margin-top: 0;
  margin-left: 0.5rem;
  padding: 0.85rem;
  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0.75rem;
  }
`;

export const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #00ff99;
  margin-top: 1.2rem;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.8;
  }
`;

export const Message = styled.p`
  margin-top: 1rem;

  font-weight: bold;
`;
