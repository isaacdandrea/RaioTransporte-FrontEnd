import React, { useState, useEffect, useRef } from 'react';
import '../styles/SearchBar.css';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchContainerRef = useRef(null);
  const debounceTimerRef = useRef(null);

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

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Limpa o timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Define um novo timer
    debounceTimerRef.current = setTimeout(() => {
      searchAddress(value);
    }, 300); // 300ms de debounce

    if (value.trim()) {
      setShowRecommendations(true);
    } else {
      setShowRecommendations(false);
    }
  };

  const handleRecommendationClick = (recommendation) => {
    setSearchQuery(recommendation.displayName);
    setShowRecommendations(false);
    // Aqui você pode usar recommendation.lat e recommendation.lon para outras funcionalidades
    console.log('Localização selecionada:', recommendation);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Busca realizada:', searchQuery);
    setShowRecommendations(false);
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
        <button type="submit">
          Buscar
        </button>
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