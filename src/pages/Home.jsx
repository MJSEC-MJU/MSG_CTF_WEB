import { useState } from 'react';
import styled from 'styled-components';
import Modal from '../components/Modal';
import "./Home.css";

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
      <div className="WallWrapper">
        <img src={`/assets/wall.png`} />
        <div className="MainLogoWrapper">
          <img src={`/assets/MainLogo.png`} />
        </div>        
        <div className="CtButtonWrapper">
          <CenteredButton onClick={toggleModal}></CenteredButton>
        </div>
        {isModalOpen && <Modal onClose={toggleModal} content={rulesContent} />}
        <div className="GamsungWrapper">
          <img src={`/assets/gamsung.png`} />
        </div>
        <div className="ClickWrapper">
          <img src={`/assets/click.png`} />
        </div>
      </div>
    </HomeWrapper>
  );
}

export default Home;

const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: auto;
  min-height: 100vh;
  width: auto;
  min-width: 100xw;
  overflow: hidden;
  position: relative;
`;

const CenteredButton = styled.button`
  margin: 2rem auto 0;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-family: 'Courier New', Courier, monospace;
  color: #000;
  background: url('/assets/ruleButton.png') no-repeat center center; 
  background-size: contain; 
  width: 250px; 
  height: 100px;
  border: none;
  border-radius: 0; 
  cursor: pointer;
  z-index: 1;
  transition: transform 0.2s, filter 0.2s;

  &:hover {
    transform: scale(1.1);
    filter: brightness(1.2);
  }

  &:active {
    transform: scale(0.9);
    filter: brightness(0.9);
  }
`;

