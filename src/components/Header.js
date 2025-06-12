// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

const Header = ({ onResults, onCoordinates }) => (
    <header className="app-header">
        <div className="header-left">
            <h1>Até Onde Posso Ir?</h1>
        </div>

        <div className="header-center">
            {/* repassa ambos os callbacks */}
            <SearchBar onResults={onResults} onCoordinates={onCoordinates} />
        </div>

        <nav className="header-right">
            <ul>
                <li><Link to="/">Início</Link></li>
                <li><Link to="/sobre">Sobre</Link></li>
            </ul>
        </nav>
    </header>
);

export default Header;
