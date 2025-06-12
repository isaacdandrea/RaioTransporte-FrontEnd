import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Home from './pages/Home';
import Sobre from './pages/Sobre';
import { LocationProvider } from './contexts/LocationContext';

function App() {
  return (
    <LocationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
        </Routes>
      </Router>
    </LocationProvider>
  );
}

export default App;