'use client';

import { useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DELHI_BOUNDS = [[28.404629, 76.838835], [28.883446, 77.345338]];
const statusColors = { safe: '#16805d', moderate: '#d49614', high: '#e46e2e', critical: '#cf3741' };

function RegistryViewport({ selectedNode }) {
  const map = useMap();
  useEffect(() => {
    if (selectedNode) map.flyTo([selectedNode.lat, selectedNode.lng], 13, { duration: 0.55 });
  }, [map, selectedNode]);
  return null;
}

export default function DeviceRegistryMap({ nodes, selectedNode, onSelect }) {
  return (
    <div className="device-registry-map">
      <MapContainer bounds={DELHI_BOUNDS} boundsOptions={{ padding: [18, 18] }} minZoom={9} maxZoom={18} maxBounds={DELHI_BOUNDS} maxBoundsViscosity={0.72} scrollWheelZoom>
        <TileLayer attribution="Imagery &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" zIndex={350} />
        {nodes.map((node) => {
          const selected = selectedNode?.id === node.id;
          return (
            <CircleMarker key={node.id} center={[node.lat, node.lng]} radius={selected ? 10 : node.status === 'safe' ? 5.5 : 7.5} eventHandlers={{ click: () => onSelect(node) }} pathOptions={{ color: '#ffffff', weight: selected ? 3 : 2, fillColor: statusColors[node.status] || statusColors.safe, fillOpacity: 1 }}>
              <Tooltip permanent={selected} direction="top" offset={[0, -9]} opacity={1}><b>{node.id}</b><br />{node.name}</Tooltip>
            </CircleMarker>
          );
        })}
        <RegistryViewport selectedNode={selectedNode} />
      </MapContainer>
      <span>Click a device marker to manage it</span>
    </div>
  );
}
