import React, { useState, useEffect, useRef } from 'react';
import '../styles/SearchBar.css';
import { useLocation } from '../contexts/LocationContext';

/**
 * Props
 * -----
 * onResults?: function  // callback para receber os dados retornados pela API de "raio".
 */

const TEMPO_MIN = 30; // tempo fixo, conforme requisito

const SearchBar = ({ onResults }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const searchContainerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const { updatePosition } = useLocation();

  // Mantemos o listener de clique fora do componente para esconder recomendações
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
   * Faz a busca de endereços usando Nominatim
   */
  const searchAddress = async (query) => {
    if (!query.trim()) {
      setRecommendations([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query
          )}&limit=5&addressdetails=1&countrycodes=br&accept-language=pt-BR`,
          {
            headers: {
              'Accept-Language': 'pt-BR',
              'User-Agent': 'MeuMapaDeOnibus/1.0'
            }
          }
      );

      if (!response.ok) {
        throw new Error('Erro na busca de endereços');
      }

      const data = await response.json();
      const formattedRecommendations = data.map(item => ({
        displayName: item.display_name,
        lat: item.lat,
        lon: item.lon
      }));

      setRecommendations(formattedRecommendations);
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualiza o input e faz debounce para pesquisar
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      searchAddress(value);
    }, 300);

    if (value.trim()) {
      setShowRecommendations(true);
    } else {
      setShowRecommendations(false);
    }
  };

  /**
   * Seleciona uma recomendação e guarda as coordenadas
   */
  const handleRecommendationClick = (recommendation) => {
    setSearchQuery(recommendation.displayName);
    setShowRecommendations(false);
    const lat = parseFloat(recommendation.lat);
    const lon = parseFloat(recommendation.lon);
    setSelectedCoordinates({ latitude: lat, longitude: lon });
  };

  /**
   * Faz submit: atualiza o mapa e chama o backend de raio
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCoordinates) {
      console.log('Nenhuma coordenada selecionada');
      setShowRecommendations(false);
      return;
    }

    try {
      // 1. Move o mapa imediatamente
      updatePosition(selectedCoordinates.latitude, selectedCoordinates.longitude);

      // 2. Chama o endpoint Python (testar_raio_visual_externo.py)
      const response = await fetch('http://191.9.114.117:18001/transporte/api/raio/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: selectedCoordinates.latitude,
          lon: selectedCoordinates.longitude,
          tempo: TEMPO_MIN
        })
      });

      if (!response.ok) throw new Error('Falha na API de raio');

      const raioData = await response.json(); // GeoJSON + meta

      // 3. Propaga os dados para quem precisar renderizar no Leaflet
      if (onResults) {
        onResults(raioData);
      }
    } catch (error) {
      console.error('Erro ao processar busca:', error);
      // Aqui você pode exibir um toast ou alerta para o usuário
    } finally {
      setShowRecommendations(false);
    }
  };

  return (
      <div className="search-container" ref={searchContainerRef}>
        <form onSubmit={handleSubmit}>
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
                  recommendations.map((recommendation, index) => (
                      <div
                          key={index}
                          className="recommendation-item"
                          onClick={() => handleRecommendationClick(recommendation)}
                      >
                        {recommendation.displayName}
                      </div>
                  ))
              )}
            </div>
        )}
      </div>
  );
};

export default SearchBar;
