import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Ranking from './pages/Ranking';
import Scoreboard from './pages/Scoreboard';
import Challenge from './pages/Challenge';
import ProblemDetail from "./pages/ProblemDetail";
import MyPage from "./pages/MyPage"


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/ranking' element={<Ranking />} />
        <Route path='/scoreboard' element={<Scoreboard />} />
        <Route path='/challenge' element={<Challenge />}/>
        <Route path="/problem/:id" element={<ProblemDetail />} />
        <Route path='/myPage' element={<MyPage />}/>
      </Routes>
    </Router>
  );
}

export default App;
