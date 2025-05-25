import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import * as turf from '@turf/turf';

// Importações necessárias do Leaflet
import 'leaflet/dist/leaflet.css';
import iconBlue from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Criando um ícone vermelho para o usuário
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Criando um ícone azul para os pontos de ônibus
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
  const [position, setPosition] = useState([-23.5505, -46.6333]); // Coordenadas iniciais de São Paulo
  const [busStops, setBusStops] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          setError('Não foi possível obter a localização.');
          console.error("Erro de geolocalização:", err);
        }
      );
    } else {
      setError('Geolocalização não é suportada por este navegador.');
    }
  }, []);

  useEffect(() => {
    const fetchBusStops = async () => {
      if (position[0] === 0 && position[1] === 0) return;

      const radius = 500; // Raio em metros
      const query = `
        [out:json];
        (
          node["highway"="bus_stop"](around:${radius}, ${position[0]}, ${position[1]});
        );
        out body;
      `;

      try {
        const response = await axios.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        const stops = response.data.elements.map(stop => ({
          id: stop.id,
          lat: stop.lat,
          lon: stop.lon,
          name: stop.tags?.name || 'Ponto de ônibus',
        }));
        setBusStops(stops);
      } catch (error) {
        console.error("Erro ao buscar pontos de ônibus:", error);
        setError('Erro ao buscar pontos de ônibus próximos.');
      }
    };

    fetchBusStops();
  }, [position]);

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