import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import * as turf from '@turf/turf';

// Importações necessárias do Leaflet
import 'leaflet/dist/leaflet.css';
import iconBlue from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Criando o ícone vermelho para o usuário
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Criando o ícone azul para os pontos de ônibus
const blueIcon = L.icon({
  iconUrl: iconBlue,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para centralizar o mapa
const MapView = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position[0] !== 0 && position[1] !== 0) {
      map.setView(position, 15);
    }
  }, [map, position]);

  return null;
};

const Mapa = () => {
  const [position, setPosition] = useState([-23.5505, -46.6333]);
  const [busStops, setBusStops] = useState([]);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBusStops = useCallback(async () => {
    if (!isMounted) return;
    
    console.log('Buscando pontos de ônibus para posição:', position);
    if (position[0] === 0 && position[1] === 0) {
      console.log('Posição inválida, não buscando pontos');
      return;
    }

    setIsLoading(true);
    const radius = 500;
    const query = `
      [out:json];
      (
        node["highway"="bus_stop"](around:${radius}, ${position[0]}, ${position[1]});
      );
      out body;
    `;

    try {
      console.log('Fazendo requisição para Overpass API...');
      const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      console.log('Resposta recebida:', response.data);
      
      if (isMounted && response.data.elements) {
        const stops = response.data.elements.map(stop => ({
          id: stop.id,
          lat: stop.lat,
          lon: stop.lon,
          name: stop.tags?.name || 'Ponto de ônibus',
        }));
        console.log('Pontos de ônibus processados:', stops);
        setBusStops(stops);
      }
    } catch (error) {
      console.error("Erro detalhado ao buscar pontos de ônibus:", error);
      if (isMounted) {
        setError('Erro ao buscar pontos de ônibus próximos.');
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  }, [position, isMounted]);

  useEffect(() => {
    console.log('Componente montado');
    setIsMounted(true);
    return () => {
      console.log('Componente desmontado');
      setIsMounted(false);
      setBusStops([]);
      setError('');
    };
  }, []);

  useEffect(() => {
    console.log('Verificando geolocalização...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log('Geolocalização obtida:', pos.coords);
          if (isMounted) {
            const newPosition = [pos.coords.latitude, pos.coords.longitude];
            console.log('Nova posição definida:', newPosition);
            setPosition(newPosition);
          }
        },
        (err) => {
          console.error("Erro detalhado de geolocalização:", err);
          if (isMounted) {
            setError('Não foi possível obter a localização.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.log('Geolocalização não suportada');
      if (isMounted) {
        setError('Geolocalização não é suportada por este navegador.');
      }
    }
  }, [isMounted]);

  useEffect(() => {
    console.log('Efeito de busca de pontos de ônibus acionado');
    if (isMounted && !isLoading) {
      fetchBusStops();
    }
  }, [position, fetchBusStops, isMounted, isLoading]);

  const convexHull = () => {
    if (busStops.length < 3) return null;

    const points = turf.featureCollection(
      busStops.map(stop => turf.point([stop.lon, stop.lat]))
    );

    const hull = turf.convex(points);

    if (!hull) return null;

    return hull.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
  };

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="map-container">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        key={`map-${position[0]}-${position[1]}`}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <Marker position={position} icon={redIcon}>
          <Popup>Sua localização</Popup>
        </Marker>

        <MapView position={position} />

        {busStops.map(stop => (
          <Marker key={stop.id} position={[stop.lat, stop.lon]} icon={blueIcon}>
            <Popup>{stop.name}</Popup>
          </Marker>
        ))}

        {convexHull() && (
          <Polygon
            positions={convexHull()}
            pathOptions={{ color: 'purple', fillOpacity: 0.2 }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Mapa; 