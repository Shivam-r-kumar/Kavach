'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { Globe2, LocateFixed, MapPin, Minus, Moon, Plus, Sun } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const statusColors = { safe: '#16805d', moderate: '#d49614', high: '#e46e2e', critical: '#cf3741' };
const DELHI_BOUNDS = [[28.39, 76.82], [28.91, 77.39]];

const mapStyles = {
  light: {
    name: 'Light',
    icon: Sun,
    base: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    labels: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  dark: {
    name: 'Dark',
    icon: Moon,
    base: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    labels: 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  earth: {
    name: 'Earth',
    icon: Globe2,
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    labels: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imagery &copy; Esri',
  },
};

function MapViewport({ selectedNode }) {
  const map = useMap();
  useEffect(() => {
    if (selectedNode) map.flyTo([selectedNode.lat, selectedNode.lng], 13, { duration: 0.7 });
  }, [map, selectedNode]);
  return null;
}

function MapTools({ mapStyle, setMapStyle, labelsVisible, setLabelsVisible }) {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!controlRef.current) return;
    L.DomEvent.disableClickPropagation(controlRef.current);
    L.DomEvent.disableScrollPropagation(controlRef.current);
  }, []);

  return (
    <div className="map-tools" ref={controlRef}>
      <span className="map-tools-label">MAP STYLE</span>
      <div className="map-style-options">
        {Object.entries(mapStyles).map(([key, item]) => {
          const Icon = item.icon;
          return <button key={key} className={mapStyle === key ? 'active' : ''} onClick={() => setMapStyle(key)} aria-label={`${item.name} map`} title={`${item.name} map`}><Icon size={14} /><span>{item.name}</span></button>;
        })}
      </div>
      <button className={`label-toggle ${labelsVisible ? 'on' : ''}`} onClick={() => setLabelsVisible((current) => !current)} aria-pressed={labelsVisible}>
        <MapPin size={14} /><span>Place labels</span><b>{labelsVisible ? 'ON' : 'OFF'}</b>
      </button>
      <div className="zoom-tools" aria-label="Map zoom controls">
        <button onClick={() => map.zoomIn()} aria-label="Zoom in" title="Zoom in"><Plus size={16} /></button>
        <button onClick={() => map.zoomOut()} aria-label="Zoom out" title="Zoom out"><Minus size={16} /></button>
        <button onClick={() => map.flyToBounds(DELHI_BOUNDS, { padding: [24, 24], duration: 0.65 })} aria-label="Show full Delhi overview" title="Show full Delhi overview"><LocateFixed size={15} /></button>
      </div>
    </div>
  );
}

export default function HazardMap({ nodes, filter, selectedNode, onSelect }) {
  const [mapStyle, setMapStyle] = useState('light');
  const [labelsVisible, setLabelsVisible] = useState(true);
  const visibleNodes = nodes.filter((node) => filter === 'All' || node.hazard === filter);
  const activeStyle = mapStyles[mapStyle];
  return (
    <MapContainer bounds={DELHI_BOUNDS} boundsOptions={{ padding: [24, 24] }} minZoom={9} maxZoom={18} maxBounds={DELHI_BOUNDS} maxBoundsViscosity={0.72} zoomControl={false} scrollWheelZoom doubleClickZoom boxZoom keyboard className={`leaflet-map map-${mapStyle}`}>
      <TileLayer key={`${mapStyle}-base`} attribution={activeStyle.attribution} url={activeStyle.base} zIndex={200} />
      {labelsVisible && <TileLayer key={`${mapStyle}-labels`} attribution={activeStyle.attribution} url={activeStyle.labels} zIndex={350} />}
      {visibleNodes.filter((node) => ['critical', 'high'].includes(node.status)).map((node) => (
        <Circle key={`${node.id}-zone`} center={[node.lat, node.lng]} radius={node.status === 'critical' ? 4200 : 2800} pathOptions={{ color: statusColors[node.status], fillColor: statusColors[node.status], fillOpacity: 0.09, opacity: 0.65, weight: 1.2 }} />
      ))}
      {visibleNodes.map((node) => (
        <CircleMarker key={node.id} center={[node.lat, node.lng]} radius={selectedNode?.id === node.id ? 10 : node.status === 'critical' ? 8 : 6.5} eventHandlers={{ click: () => onSelect(node) }} pathOptions={{ color: selectedNode?.id === node.id ? '#162233' : '#ffffff', weight: selectedNode?.id === node.id ? 2.6 : 2, fillColor: statusColors[node.status], fillOpacity: 1 }}>
          <Tooltip direction="top" offset={[0, -8]} opacity={1}><div className="map-tooltip"><b>{node.name}</b><span>{node.id} · {node.area}</span><em>{node.risk}% {node.hazard} risk</em></div></Tooltip>
        </CircleMarker>
      ))}
      <MapViewport selectedNode={selectedNode} />
      <MapTools mapStyle={mapStyle} setMapStyle={setMapStyle} labelsVisible={labelsVisible} setLabelsVisible={setLabelsVisible} />
    </MapContainer>
  );
}
