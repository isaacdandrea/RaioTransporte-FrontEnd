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
              <h2>Até onde posso ir?</h2>
              <p className="text-lg">
                Bem-vindo ao nosso TCC! Este projeto foi desenvolvido para ajudar você a entender todos os lugares que pode ir em um certo tempo de transporte coletivo. Veja os lugares acessíveis ao seu redor e entenda melhor o seu bairro.
              </p>
              <p className="text-lg mt-4">
                Para usar, digite um endereço e escolha o tempo de transporte para visualizar todos os locais acessíveis. Após isso, em instantes, um raio aparecerá no mapa mostrando todas as áreas que você pode alcançar nesse tempo e, ao passar o mouse por cima delas, aparecerão os pontos de ônibus ou metrôs com o tempo aproximado que leva para chegar até eles. Assim, você consegue ter uma melhor ideia de onde ir e quanto tempo demora para chegar ao local! O nosso projeto está implementado para a cidade de São Paulo apenas, no futuro implementaremos a região metropolitana de São Paulo e possivelmente outras cidades!
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Home;
