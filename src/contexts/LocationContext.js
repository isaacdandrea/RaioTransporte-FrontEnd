import React, { createContext, useState, useContext } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [position, setPosition] = useState([-23.5505, -46.6333]);

  const updatePosition = (lat, lon) => {
    setPosition([lat, lon]);
  };

  return (
    <LocationContext.Provider value={{ position, updatePosition }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation deve ser usado dentro de um LocationProvider');
  }
  return context;
}; 