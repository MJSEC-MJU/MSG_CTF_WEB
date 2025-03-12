import styled from 'styled-components';
import PropTypes from 'prop-types';

function Modal({ onClose, content }) {
  return (
    <ModalOverlay>
      <ModalContent>
        {content}
        <CloseButton onClick={onClose}>닫기</CloseButton>
      </ModalContent>
    </ModalOverlay>
  );
}

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  content: PropTypes.node.isRequired,
};

export default Modal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
`;

const ModalContent = styled.div`
  background-color: #111;
  color: #cc0033;
  padding: 2rem;
  border-radius: 10px;
  min-height: 200px;
  box-shadow: 0 0 15px #cc0033;
  width: 50%;
  font-family: 'Courier New', Courier, monospace;
  font-size: 18px;
  font-weight: bold;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-family: 'Courier New', Courier, monospace;
  color: #000;
  background-color: #cc0033;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  transition:
    transform 0.2s,
    background-color 0.2s;

  &:hover {
    transform: translateX(-50%) scale(1.1);
    background-color: #cc0033;
  }

  &:active {
    transform: translateX(-50%) scale(0.9);
    background-color: #cc0033;
  }
`;
