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
              Este projeto foi desenvolvido com o objetivo de criar uma plataforma inovadora
              que facilite a gestão e o acompanhamento de processos importantes para a
              comunidade acadêmica. Nossa missão é proporcionar uma experiência intuitiva
              e eficiente para todos os usuários.
            </p>
          </section>

          <section className="projeto-section">
            <h2>O que Oferecemos</h2>
            <ul>
              Sistema de gestão integrado <br />
              Interface amigável e responsiva <br />
              Ferramentas de acompanhamento em tempo real <br />
              Suporte técnico especializado <br />
            </ul>
          </section>

          <section className="projeto-section">
            <h2>Tecnologias Utilizadas</h2>
            <p>
              Desenvolvemos este projeto utilizando as mais modernas tecnologias do mercado,
              incluindo React.js para o frontend, garantindo uma experiência fluida e
              responsiva para todos os usuários.
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