import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Mapa from '../components/Mapa';

/**
 * Home component
 * ---------------
 * Guarda os dados retornados pelo backend (raioData) e os distribui
 * para o Header → SearchBar (via callback) e para o Mapa.
 */

const Home = () => {
  const [raioData, setRaioData] = useState(null);
  const [coords, setCoords] = useState({ lat: null, lon: null });

  // log para conferência
  useEffect(() => {
    if (raioData) console.log('🔄 Dados recebidos no Home:', raioData);
  }, [raioData]);

  useEffect(() => {
    if (coords.lat !== null) console.log('📍 Coordenadas recebidas:', coords);
  }, [coords]);

  const handleCoordinates = (lat, lon) => setCoords({ lat, lon });

  return (
      <div className="App">
        {/* passa os dois handlers para o Header → SearchBar */}
        <Header onResults={setRaioData} onCoordinates={handleCoordinates} />

        <div className="content-container">
          <div className="map-section">
            {/* ✅ coords agora é passado para o Mapa */}
            <Mapa raioData={raioData} coords={coords} />
          </div>

          <div className="text-section">
            <div className="project-description">
              <h2>Encontre Pontos de Ônibus Próximos</h2>
              <p>
                Bem-vindo ao Meu Mapa de Ônibus! Este projeto foi desenvolvido para ajudar você a localizar
                pontos de ônibus próximos à sua localização atual. Utilizando dados do OpenStreetMap e
                geolocalização, nosso sistema mostra em tempo real os pontos de ônibus em um raio de 500 metros
                ao seu redor.
              </p>
              <p>
                O mapa interativo exibe sua localização com um marcador vermelho e os pontos de ônibus com
                marcadores azuis. A área roxa representa a região que engloba todos os pontos de ônibus encontrados,
                ajudando você a visualizar melhor a distribuição dos pontos em sua região.
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Home;
