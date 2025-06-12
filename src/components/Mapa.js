import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  GeoJSON,
  LayerGroup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

/**
 * Mapa
 * ----
 * Exibe isócronas ("raios") recebidas via `raioData` (GeoJSON FeatureCollection)
 * e atualiza automaticamente sempre que a prop muda.
 *
 * Pontos azuis (paradas) **só aparecem** quando:
 *   • o usuário passa o mouse próximo deles **ou**
 *   • o nível de zoom é ≥ `zoomThreshold` (default: 15)
 *
 * Polígonos são substituídos integralmente quando chegam novos dados —
 * o componente desmonta o `LayerGroup` antigo e monta um novo, garantindo
 * que geometrias antigas não fiquem no mapa.
 *
 * Estilos:
 *   • Borda do polígono: #49701c
 *   • Preenchimento:      #88b256 (30% opacidade)
 *
 * Props
 * -----
 * @param {{ type: "FeatureCollection", features: [] }} raioData - GeoJSON
 * @param {[number, number]} center  - [lat, lon] da origem (default: São Paulo)
 * @param {number} zoom             - Nível de zoom inicial (default: 13)
 */

function OrigemMarker({ position }) {
  return (
      <Marker position={position}>
        <Popup>Origem</Popup>
      </Marker>
  );
}

function RaioLayer({ data, zoomThreshold = 15 }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on("zoomend", onZoom);
    return () => map.off("zoomend", onZoom);
  }, [map]);

  useEffect(() => {
    setVersion((v) => v + 1);
  }, [data]);

  const layers = useMemo(() => {
    if (!data?.features?.length) return null;

    return data.features.map((feat, idx) => {
      const { geometry, properties } = feat;

      if (geometry.type === "Point") {
        const visible = zoom >= zoomThreshold;

        return (
            <CircleMarker
                key={`pt-${idx}`}
                center={[geometry.coordinates[1], geometry.coordinates[0]]}
                radius={6}
                pathOptions={{
                  color: "blue",
                  weight: 1,
                  opacity: visible ? 1 : 0,
                  fillOpacity: visible ? 0.7 : 0,
                }}
                eventHandlers={{
                  mouseover: (e) => {
                    if (zoom < zoomThreshold) {
                      e.target.setStyle({ opacity: 1, fillOpacity: 0.7 });
                    }
                  },
                  mouseout: (e) => {
                    if (zoom < zoomThreshold) {
                      e.target.setStyle({ opacity: 0, fillOpacity: 0 });
                    }
                  },
                }}
            >
              <Popup>
                {properties?.stop_name} ({properties?.tempo_min} min)
              </Popup>
            </CircleMarker>
        );
      }

      if (geometry.type === "Polygon" || geometry.type === "MultiPolygon") {
        return (
            <GeoJSON
                key={`poly-${idx}`}
                data={geometry}
                style={{
                  color: "#49701c", // borda
                  weight: 2,
                  fillColor: "#88b256", // preenchimento
                  fillOpacity: 0.3,
                }}
            />
        );
      }

      return null;
    });
  }, [data, zoom, zoomThreshold]);

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

  return <LayerGroup key={version}>{layers}</LayerGroup>;
}

export default function Mapa({
                               raioData,
                               center = [-23.55052, -46.633308],
                               zoom = 13,
                               zoomThreshold = 15,
                             }) {
  return (
      <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <OrigemMarker position={center} />

        {raioData && (
            <RaioLayer data={raioData} zoomThreshold={zoomThreshold} />
        )}
      </MapContainer>
  );
}
