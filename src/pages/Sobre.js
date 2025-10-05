import React from 'react';
import Header from '../components/Header';
import '../styles/Sobre.css';

const Sobre = () => {
  return (
    <div className="App">
      <Header />
      <div className="content-container">
        <div className="sobre-content">
          <h1>Sobre o Projeto</h1>
          
          <section className="projeto-section">
            <h2>Nossa Missão</h2>
            <p>
              Promover a mobilidade urbana sustentável por meio da tecnologia, ajudando as pessoas a fazerem escolhas mais conscientes sobre moradia, deslocamento e estilo de vida. Acreditamos que o acesso à informação em tempo real pode transformar a forma como vivemos e nos conectamos com a cidade, tornando-a mais acessível, eficiente e integrada.
            </p>
          </section>

          <section className="projeto-section">
            <h2>O que Oferecemos</h2>
            <ul>
              Oferecemos uma plataforma interativa que mostra, em tempo real, todas as áreas acessíveis em até 30 minutos por transporte público a partir de qualquer localização. Utilizando mapas personalizados, dados geoespaciais e informações atualizadas, ajudamos usuários a:<br />

              Explorar opções de mobilidade urbana;<br />

              Avaliar regiões para morar com base na acessibilidade;<br />

              Incentivar o uso de transporte coletivo;<br />

              Apoiar o comércio local ao destacar áreas de fácil acesso.<br />
            </ul>
          </section>

          <section className="projeto-section">
            <h2>Tecnologias Utilizadas</h2>
            <p>
              O projeto foi desenvolvido com metodologia ágil, usando o framework Scrum e sprints quinzenais.
              No front-end, foram utilizadas as tecnologias React e Maplibre para criação de interfaces dinâmicas e mapas interativos.
              No back-end, Python com Django.
              Para mapas e geolocalização, foram usadas APIs gratuitas como OpenStreetMap e Open Free Map, Maputnik Editor para estilização.
              PostgreSQL com PostGIS para banco de dados geoespacial.
            </p>
          </section>

          <section className="projeto-section">
            <h2>Nossa Equipe</h2>
            <p>
              Gabriel Carrasco        22.00906-0 <br />
              Matheus Alatxeve        20.00528-8 <br />
              Lucas Pennone           21.01086-2 <br />
              Isaac d'Andrea          22.01841-7 <br />
              Gustavo Yudji Hiromoto  22.00839-0
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Sobre; 