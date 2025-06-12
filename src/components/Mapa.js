import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  GeoJSON,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Mapa
 * ----
 * Exibe isócronas ("raios") recebidas via `raioData` (GeoJSON FeatureCollection)
 * e atualiza automaticamente sempre que a prop muda.
 *
 * A implementação replica o comportamento de `testar_raio_visual_externo.py`:
 *  • Polígonos/MultiPolígonos recebem contorno roxo e preenchimento translúcido
 *  • Pontos recebem `CircleMarker` azul com popup indicando a parada e o tempo
 *  • Um marcador vermelho indica a posição de origem (centro do mapa)
 *
 * Props
 * -----
 * @param {{ type: "FeatureCollection", features: [] }} raioData - GeoJSON com isócronas
 * @param {[number, number]} center  - [lat, lon] do ponto de origem (default: São Paulo‑SP)
 * @param {number} zoom             - Nível de zoom inicial (default: 13)
 */

// 🔹 Marcador da posição de origem
function OrigemMarker({ position }) {
  return (
      <Marker position={position}>
        <Popup>Origem</Popup>
      </Marker>
  );
}

// 🔹 Camada que desenha pontos e polígonos dos raios
function RaioLayer({ data }) {
  const map = useMap();

  // 🔄 Constrói os elementos Leaflet a partir do GeoJSON
  const layers = useMemo(() => {
    if (!data?.features?.length) return null;

    return data.features.map((feat, idx) => {
      const { geometry, properties } = feat;

      if (geometry.type === "Point") {
        return (
            <CircleMarker
                key={`pt-${idx}`}
                center={[geometry.coordinates[1], geometry.coordinates[0]]}
                radius={4}
                pathOptions={{ color: "blue", fillOpacity: 0.7 }}
            >
              <Popup>
                {properties?.stop_name} ({properties?.tempo_min} min)
              </Popup>
            </CircleMarker>
        );
      }

      if (geometry.type === "Polygon" || geometry.type === "MultiPolygon") {
        return (
            <GeoJSON
                key={`poly-${idx}`}
                data={geometry}
                style={{ color: "purple", weight: 2, fillOpacity: 0.15 }}
            />
        );
      }

      // Geometrias inesperadas são ignoradas (ex.: LineString)
      return null;
    });
  }, [data]);

  // 🔍 Ajusta o enquadramento sempre que chegam novos dados
  useEffect(() => {
    if (!data?.features?.length) return;

    const bounds = [];

    data.features.forEach((feat) => {
      const { geometry } = feat;

      if (geometry.type === "Point") {
        bounds.push([geometry.coordinates[1], geometry.coordinates[0]]);
      } else if (geometry.type === "Polygon") {
        geometry.coordinates[0].forEach((c) => bounds.push([c[1], c[0]]));
      } else if (geometry.type === "MultiPolygon") {
        geometry.coordinates.forEach((poly) =>
            poly[0].forEach((c) => bounds.push([c[1], c[0]])),
        );
      }
    });

    if (bounds.length) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [data, map]);

  return <>{layers}</>;
}

export default function Mapa({
                               raioData,
                               center = [-23.55052, -46.633308], // São Paulo (default)
                               zoom = 13,
                             }) {
  return (
      <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Origem */}
        <OrigemMarker position={center} />

        {/* Raios (isócronas) */}
        {raioData && <RaioLayer data={raioData} />}
      </MapContainer>
  );
}
