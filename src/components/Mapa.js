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
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Ícone vermelho personalizado para o marcador de origem
const origemIcon = new L.Icon({
    iconUrl: "/location_icon.png", // Caminho relativo à pasta public
    iconSize: [30, 30], // Ajuste conforme necessário
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

// Componente para exibir o marcador da origem
function OrigemMarker({ position }) {
    return (
        <Marker position={position} icon={origemIcon}>
            <Popup>Sua localização</Popup>
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
                            color: "#49701c",
                            weight: 2,
                            fillColor: "#88b256",
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
                    poly[0].forEach((c) => bounds.push([c[1], c[0]]))
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
                                 coords = { lat: null, lon: null },
                                 zoom = 13,
                                 zoomThreshold = 15,
                             }) {
    const isCoordsValid = coords.lat !== null && coords.lon !== null;
    const mapCenter = isCoordsValid
        ? [coords.lat, coords.lon]
        : [-23.55052, -46.633308]; // Fallback para São Paulo

    return (
        <MapContainer center={mapCenter} zoom={zoom} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {isCoordsValid && <OrigemMarker position={[coords.lat, coords.lon]} />}

            {raioData && (
                <RaioLayer data={raioData} zoomThreshold={zoomThreshold} />
            )}
        </MapContainer>
    );
}
