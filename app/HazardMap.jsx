'use client';

import { useEffect } from 'react';
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const statusColors = {
  safe: '#3ddc97',
  moderate: '#f1c84b',
  high: '#ff9933',
  critical: '#ff4d55',
  offline: '#64748b',
};

function MapViewport({ selectedNode }) {
  const map = useMap();
  useEffect(() => {
    if (selectedNode) map.flyTo([selectedNode.lat, selectedNode.lng], 6, { duration: 0.8 });
  }, [map, selectedNode]);
  return null;
}

export default function HazardMap({ nodes, filter, layers, selectedNode, onSelect }) {
  const visibleNodes = nodes.filter((node) => {
    if (filter === 'All') return true;
    if (filter === 'Fire') return node.hazard === 'Forest Fire';
    return node.hazard === filter;
  });

  return (
    <MapContainer center={[22.9, 79.4]} zoom={4.6} minZoom={4} maxZoom={10} zoomControl={false} className="leaflet-map">
      <TileLayer
        attribution="&copy; OpenStreetMap &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {layers.hazardZones && visibleNodes.filter((node) => ['critical', 'high'].includes(node.status)).map((node) => (
        <Circle
          key={`${node.id}-zone`}
          center={[node.lat, node.lng]}
          radius={node.status === 'critical' ? 85000 : 60000}
          pathOptions={{ color: statusColors[node.status], fillColor: statusColors[node.status], fillOpacity: 0.08, weight: 1 }}
        />
      ))}

      {layers.pollution && nodes.filter((node) => node.hazard === 'Pollution').map((node) => (
        <Circle key={`${node.id}-air`} center={[node.lat, node.lng]} radius={110000} pathOptions={{ color: '#9e7bff', fillColor: '#9e7bff', fillOpacity: 0.11, weight: 0.8 }} />
      ))}

      {layers.nodes && visibleNodes.map((node) => (
        <CircleMarker
          key={node.id}
          center={[node.lat, node.lng]}
          radius={selectedNode?.id === node.id ? 10 : node.status === 'critical' ? 8 : 6}
          eventHandlers={{ click: () => onSelect(node) }}
          pathOptions={{
            color: selectedNode?.id === node.id ? '#ffffff' : '#07111f',
            weight: selectedNode?.id === node.id ? 2 : 1.5,
            fillColor: statusColors[node.status],
            fillOpacity: 1,
          }}
        >
          <Tooltip direction="top" offset={[0, -7]} opacity={1}>
            <div className="map-tooltip"><b>{node.id}</b><span>{node.name}</span><em>{node.risk}% {node.hazard} risk</em></div>
          </Tooltip>
        </CircleMarker>
      ))}
      <MapViewport selectedNode={selectedNode} />
    </MapContainer>
  );
}
