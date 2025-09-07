import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Landing from './components/Landing';
import Profile from './components/Profile';
import Results from './components/Results';
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="App bg-slate-900 min-h-screen">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/results" element={<Results />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;