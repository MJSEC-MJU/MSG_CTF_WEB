import styled from 'styled-components';

function Home() {
  return (
    <HomeWrapper>
      <Title>Home Page</Title>
      <Content>MSG</Content>
    </HomeWrapper>
  );
}

export default Home;

const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px;
  background-color: #f5f5f5;
  min-height: 100vh;
  width: 100%;
`;

const Title = styled.h2`
  color: #333;
  font-size: 24px;
`;

const Content = styled.p`
  color: #666;
  font-size: 16px;
  text-align: center;
  max-width: 600px;
  margin-top: 20px;
`;
