import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Scoreboard from './pages/Scoreboard';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/scoreboard' element={<Scoreboard />} />
      </Routes>
    </Router>
  );
}

export default App;
