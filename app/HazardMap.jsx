'use client';

import { useEffect } from 'react';
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const statusColors = { safe: '#16805d', moderate: '#d49614', high: '#e46e2e', critical: '#cf3741' };
const DELHI_BOUNDS = [[28.39, 76.82], [28.91, 77.39]];

function MapViewport({ selectedNode }) {
  const map = useMap();
  useEffect(() => {
    if (selectedNode) map.flyTo([selectedNode.lat, selectedNode.lng], 13, { duration: 0.7 });
  }, [map, selectedNode]);
  return null;
}

export default function HazardMap({ nodes, filter, selectedNode, onSelect }) {
  const visibleNodes = nodes.filter((node) => filter === 'All' || node.hazard === filter);
  return (
    <MapContainer center={[28.6358, 77.2189]} zoom={11} minZoom={10} maxZoom={16} maxBounds={DELHI_BOUNDS} maxBoundsViscosity={0.82} zoomControl={false} scrollWheelZoom={false} className="leaflet-map">
      <TileLayer attribution="&copy; OpenStreetMap &copy; CARTO" url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {visibleNodes.filter((node) => ['critical', 'high'].includes(node.status)).map((node) => (
        <Circle key={`${node.id}-zone`} center={[node.lat, node.lng]} radius={node.status === 'critical' ? 4200 : 2800} pathOptions={{ color: statusColors[node.status], fillColor: statusColors[node.status], fillOpacity: 0.09, opacity: 0.65, weight: 1.2 }} />
      ))}
      {visibleNodes.map((node) => (
        <CircleMarker key={node.id} center={[node.lat, node.lng]} radius={selectedNode?.id === node.id ? 10 : node.status === 'critical' ? 8 : 6.5} eventHandlers={{ click: () => onSelect(node) }} pathOptions={{ color: selectedNode?.id === node.id ? '#162233' : '#ffffff', weight: selectedNode?.id === node.id ? 2.6 : 2, fillColor: statusColors[node.status], fillOpacity: 1 }}>
          <Tooltip direction="top" offset={[0, -8]} opacity={1}><div className="map-tooltip"><b>{node.name}</b><span>{node.id} · {node.area}</span><em>{node.risk}% {node.hazard} risk</em></div></Tooltip>
        </CircleMarker>
      ))}
      <MapViewport selectedNode={selectedNode} />
    </MapContainer>
  );
}
