// src/components/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../styles/SearchBar.css';
import { useLocation } from '../contexts/LocationContext';

const DEFAULT_TEMPO = 30;

const SearchBar = ({ onResults, onCoordinates }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [selectedTempo, setSelectedTempo] = useState(DEFAULT_TEMPO);

  const searchContainerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const { updatePosition } = useLocation();

  // Esconde o popup de recomendações ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowRecommendations(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Busca endereços via Nominatim
   */
  const searchAddress = async (query) => {
    if (!query.trim()) {
      setRecommendations([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=br&accept-language=pt-BR`,
          {
            headers: {
              'Accept-Language': 'pt-BR',
              'User-Agent': 'MeuMapaDeOnibus/1.0'
            }
          }
      );

      if (!response.ok) throw new Error('Erro na busca de endereços');

      const data = await response.json();
      const formatted = data.map(item => ({
        displayName: item.display_name,
        lat: item.lat,
        lon: item.lon
      }));

      setRecommendations(formatted);
    } catch (err) {
      console.error('Erro ao buscar endereços:', err);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  /** Atualiza campo de busca com debounce */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => searchAddress(value), 300);

    setShowRecommendations(!!value.trim());
  };

  const handleRecommendationClick = (rec) => {
    setSearchQuery(rec.displayName);
    setShowRecommendations(false);
    setSelectedCoordinates({ latitude: parseFloat(rec.lat), longitude: parseFloat(rec.lon) });
  };

  /**
   * Alteração do dropdown de tempo
   */
  const handleTempoChange = (e) => setSelectedTempo(parseInt(e.target.value, 10));

  /**
   * Submit: move mapa e chama backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCoordinates) {
      console.log('Nenhuma coordenada selecionada');
      setShowRecommendations(false);
      return;
    }

    try {
      updatePosition(selectedCoordinates.latitude, selectedCoordinates.longitude);

      const response = await fetch('http://191.9.114.117:18001/transporte/api/raio/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: selectedCoordinates.latitude,
          lon: selectedCoordinates.longitude,
          tempo: selectedTempo
        })
      });

      if (!response.ok) throw new Error('Falha na API de raio');
      const raioData = await response.json();

      // --- envia tudo para o pai ---
      onResults?.(raioData);
      onCoordinates?.(selectedCoordinates.latitude, selectedCoordinates.longitude);
    } catch (err) {
      console.error('Erro ao processar busca:', err);
    } finally {
      setShowRecommendations(false);
    }
  };

  return (
      <div className="search-container" ref={searchContainerRef}>
        <form onSubmit={handleSubmit} className="search-form">
          {/* Dropdown de tempo */}
          <select
              className="tempo-select"
              value={selectedTempo}
              onChange={handleTempoChange}
          >
            <option value={5}>5 min</option>
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
          </select>

          {/* Campo de texto */}
          <input
              type="text"
              placeholder="Digite um endereço ou local..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => searchQuery.trim() && setShowRecommendations(true)}
          />

          <button type="submit">Buscar</button>
        </form>

        {showRecommendations && (recommendations.length > 0 || isLoading) && (
            <div className="recommendations">
              {isLoading ? (
                  <div className="recommendation-item loading">Carregando...</div>
              ) : (
                  recommendations.map((rec, idx) => (
                      <div
                          key={idx}
                          className="recommendation-item"
                          onClick={() => handleRecommendationClick(rec)}
                      >
                        {rec.displayName}
                      </div>
                  ))
              )}
            </div>
        )}
      </div>
  );
};

export default SearchBar;