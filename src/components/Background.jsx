import styled, { keyframes } from 'styled-components';

/* 🔥 심연에서 흐르는 네온 파동 */
const deepWave = keyframes`
  0% { background-position: 0% 0%; transform: scale(1); opacity: 0.7; }
  50% { background-position: 50% 50%; transform: scale(1.1); opacity: 1; }
  100% { background-position: 100% 100%; transform: scale(1); opacity: 0.7; }
`;

/* 🔥 깊이 있는 빛 확산 효과 */
const deepGlow = keyframes`
  0% { opacity: 0.1; filter: blur(40px); }
  50% { opacity: 0.5; filter: blur(70px); }
  100% { opacity: 0.1; filter: blur(40px); }
`;

/* 🔥 밤하늘의 별처럼 반짝이는 입자 효과 */
const starryTwinkle = keyframes`
  0% { opacity: 0.05; transform: scale(0.9); }
  50% { opacity: 0.8; transform: scale(1.1); }
  100% { opacity: 0.05; transform: scale(0.9); }
`;

/* 🔥 어두운 심연 속의 네온 감성 배경 */
const DarkNeonBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #080808, #0a0a1a, #1a0026);
  background-size: 400% 400%;
  animation: ${deepWave} 50s infinite alternate;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle,
      rgba(0, 255, 0, 0.2) 10%,
      transparent 90%
    );
    filter: blur(100px);
    animation: ${deepGlow} 25s infinite ease-in-out;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      rgba(0, 255, 0, 0.05) 5px,
      transparent 15px
    );
    opacity: 0.4;
    animation: ${starryTwinkle} 18s infinite alternate;
  }
`;

export default DarkNeonBackground;
