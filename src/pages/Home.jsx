import { useState } from 'react';
import styled from 'styled-components';
import Modal from '../components/Modal';
import NeonBackground from '../components/Background';

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const rulesContent = (
    <>
      <h2>게임 규칙</h2>
      <ul>
        <li>
          플래그 형식은 <strong>MSG&#123;&#125;</strong>입니다.
        </li>
        <li>
          제출이 틀렸을 경우 패널티가 부여됩니다. (2회 이상 틀릴 경우 추가 시간
          패널티)
        </li>
        <li>Dos 공격은 절대 금지입니다.</li>
        <li>1~3위까지는 Writeup을 작성하여 제출해야 합니다.</li>
      </ul>
    </>
  );

  return (
    <HomeWrapper>
      <NeonBackground />
      <Title>WELCOME TO THE H4CKING GAME</Title>
      <Subtitle>
        즐기기에 앞서 규칙을 먼저 읽어주시기 바라며,
        <br /> 규칙을 읽지 않아 발생하는 모든 문제의 책임은 당사자에게 있음을
        알립니다.
      </Subtitle>
      <CenteredButton onClick={toggleModal}>규칙 보기</CenteredButton>
      {isModalOpen && <Modal onClose={toggleModal} content={rulesContent} />}
      <AnimatedLines />
    </HomeWrapper>
  );
}

export default Home;

/* 🔥 스타일 */
const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #000000, #003300);
  color: #0f0;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  position: relative;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-family: 'Courier New', Courier, monospace;
  text-transform: uppercase;
  text-shadow: 0 0 40px rgba(0, 255, 0, 0.8);
  z-index: 2;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  font-family: 'Courier New', Courier, monospace;
  text-align: center;
  margin-top: 1rem;
  line-height: 1.5;
  text-shadow: 0 0 5px #0f0;
  z-index: 2;
`;

const CenteredButton = styled.button`
  margin: 2rem auto 0;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-family: 'Courier New', Courier, monospace;
  color: #000;
  background-color: #0f0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  z-index: 2;
  box-shadow:
    0 0 10px #0f0,
    0 0 20px #0f0;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    background-color 0.2s;

  &:hover {
    transform: scale(1.1);
    box-shadow:
      0 0 20px #0f0,
      0 0 40px #0f0;
  }

  &:active {
    transform: scale(0.9);
    box-shadow:
      0 0 5px #0f0,
      0 0 10px #0f0;
  }
`;

/* 🔥 그리드 애니메이션 */
const AnimatedLines = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 5px,
    rgba(0, 255, 0, 0.15) 5px,
    rgba(0, 255, 0, 0.15) 10px
  );
  opacity: 0.15;
  z-index: 1;
`;
