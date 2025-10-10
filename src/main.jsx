import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ContestTimeProvider } from "./TimerComponents";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ContestTimeProvider>
      <App />
    </ContestTimeProvider>
  </StrictMode>
);
