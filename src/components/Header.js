import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-left">
        <h1>Meu Mapa de Ônibus</h1>
      </div>
      <div className="header-center">
        <SearchBar />
      </div>
      <nav className="header-right">
        <ul>
          <li><Link to="/">Início</Link></li>
          <li><Link to="/sobre">Sobre</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header; 