'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Circle, CircleMarker, MapContainer, Marker, Polygon, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { Check, ChevronLeft, ChevronRight, CloudFog, CloudRain, Factory, Flame, Globe2, Layers3, LocateFixed, MapPin, MapPinned, Minus, Moon, Plus, Sun, ThermometerSun, Trash2, Waves, Wind } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { loadGoogleMaps } from './googleMaps';

const statusColors = { safe: '#16805d', moderate: '#d49614', high: '#e46e2e', critical: '#cf3741' };
const mapHazardIcons = {
  flood: Waves,
  fire: Flame,
  'air quality': Wind,
  heat: ThermometerSun,
  weather: CloudRain,
  dust: CloudFog,
  'industrial pollution': Factory,
};
const DELHI_BOUNDS = [[28.404629, 76.838835], [28.883446, 77.345338]];
const DELHI_BORDER = [
  [28.573231, 76.838835], [28.550012, 76.84586], [28.543673, 76.864447],
  [28.52495, 76.876868], [28.520306, 76.887138], [28.505582, 76.880522],
  [28.501376, 76.885438], [28.500831, 76.89195], [28.50905, 76.898353],
  [28.508925, 76.902943], [28.513763, 76.906904], [28.50691, 76.920902],
  [28.511019, 76.934963], [28.505313, 76.943325], [28.505316, 76.952758],
  [28.521253, 76.978362], [28.513568, 76.990946], [28.519711, 76.996808],
  [28.514726, 77.010051], [28.521077, 77.016964], [28.530984, 77.001336],
  [28.533492, 77.001664], [28.540905, 77.007818], [28.540516, 77.013457],
  [28.525155, 77.043358], [28.52092, 77.048508], [28.516643, 77.046206],
  [28.511929, 77.067162], [28.520259, 77.0723], [28.518022, 77.080411],
  [28.511407, 77.098659], [28.50708, 77.095753], [28.504855, 77.097652],
  [28.495139, 77.119507], [28.473184, 77.112472], [28.45971, 77.123476],
  [28.442834, 77.127729], [28.438924, 77.132284], [28.436558, 77.1493],
  [28.428515, 77.16284], [28.425666, 77.165855], [28.414437, 77.165168],
  [28.406236, 77.171498], [28.410181, 77.217901], [28.425033, 77.250023],
  [28.432921, 77.252684], [28.433072, 77.249164], [28.446921, 77.249208],
  [28.454373, 77.245924], [28.456675, 77.242985], [28.45509, 77.234595],
  [28.458505, 77.233071], [28.471106, 77.235689], [28.47882, 77.243435],
  [28.487024, 77.27191], [28.490551, 77.271953], [28.49322, 77.276405],
  [28.496492, 77.290245], [28.494087, 77.300642], [28.489594, 77.300593],
  [28.489391, 77.306521], [28.483422, 77.314138], [28.489844, 77.327603],
  [28.505166, 77.336186], [28.513453, 77.345338], [28.539762, 77.321439],
  [28.556349, 77.299805], [28.576174, 77.292886], [28.581545, 77.294837],
  [28.589328, 77.308858], [28.596525, 77.313382], [28.598181, 77.325895],
  [28.60514, 77.341222], [28.623649, 77.340423], [28.637748, 77.316823],
  [28.6501, 77.321959], [28.662584, 77.320129], [28.677856, 77.325245],
  [28.681642, 77.332952], [28.698706, 77.323688], [28.708794, 77.325427],
  [28.713197, 77.331107], [28.711835, 77.304424], [28.709803, 77.299029],
  [28.703652, 77.296875], [28.706366, 77.291259], [28.714448, 77.286339],
  [28.722735, 77.29087], [28.735562, 77.275666], [28.735587, 77.260922],
  [28.738542, 77.255834], [28.752634, 77.258671], [28.759164, 77.238115],
  [28.774953, 77.23288], [28.77916, 77.22104], [28.784575, 77.228034],
  [28.786696, 77.207277], [28.796964, 77.200024], [28.813567, 77.202125],
  [28.810843, 77.21872], [28.817487, 77.219364], [28.822318, 77.223669],
  [28.855818, 77.214236], [28.85943, 77.197074], [28.858534, 77.175194],
  [28.850054, 77.17206], [28.849324, 77.166299], [28.839214, 77.157094],
  [28.836848, 77.157995], [28.838051, 77.145279], [28.842462, 77.141425],
  [28.853702, 77.145515], [28.861749, 77.140223], [28.863127, 77.133739],
  [28.857955, 77.12186], [28.869895, 77.109994], [28.871803, 77.093281],
  [28.875542, 77.087824], [28.881013, 77.08762], [28.883446, 77.082588],
  [28.877022, 77.077438], [28.871664, 77.07934], [28.867191, 77.074675],
  [28.870718, 77.061221], [28.868016, 77.058301], [28.847042, 77.045558],
  [28.831804, 77.040172], [28.839143, 77.023379], [28.839624, 76.994362],
  [28.834382, 76.987124], [28.821486, 76.980335], [28.827637, 76.971349],
  [28.827688, 76.965826], [28.8149, 76.961701], [28.818253, 76.951224],
  [28.816078, 76.949213], [28.798655, 76.941898], [28.790278, 76.954028],
  [28.779773, 76.948308], [28.767662, 76.95565], [28.753889, 76.944426],
  [28.742837, 76.958755], [28.738186, 76.956029], [28.729922, 76.959837],
  [28.712461, 76.948117], [28.6992, 76.968025], [28.683962, 76.95743],
  [28.669574, 76.954501], [28.670236, 76.937368], [28.649643, 76.924516],
  [28.633056, 76.944394], [28.627232, 76.942396], [28.618442, 76.935266],
  [28.631479, 76.919134], [28.63218, 76.914234], [28.623624, 76.906534],
  [28.631805, 76.889357], [28.58553, 76.86461], [28.582535, 76.839436],
  [28.573231, 76.838835],
];

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
    attribution: 'Imagery &copy; Esri · Boundary &copy; OpenStreetMap contributors',
  },
};

function getHazardIcon(hazard = '') {
  const normalized = hazard.toLowerCase();
  if (normalized.includes('fire') || normalized.includes('smoke')) return Flame;
  if (normalized.includes('flood') || normalized.includes('water') || normalized.includes('yamuna')) return Waves;
  if (normalized.includes('air') || normalized.includes('wind')) return Wind;
  if (normalized.includes('heat') || normalized.includes('temperature')) return ThermometerSun;
  if (normalized.includes('dust') || normalized.includes('fog')) return CloudFog;
  if (normalized.includes('industrial') || normalized.includes('factory')) return Factory;
  return mapHazardIcons[normalized] || CloudRain;
}

function createNodeIcon(node, selected) {
  const Icon = getHazardIcon(node.hazard);
  const svg = renderToStaticMarkup(<Icon size={17} strokeWidth={2.35} aria-hidden="true" />);
  const color = statusColors[node.status] || statusColors.safe;
  return L.divIcon({
    className: `hazard-node-marker ${node.status || 'safe'} ${selected ? 'selected' : ''}`,
    html: `<span class="hazard-node-pin" style="--node-color:${color}">${svg}</span>`,
    iconSize: [40, 44],
    iconAnchor: [20, 42],
    tooltipAnchor: [0, -34],
  });
}

function MapViewport({ selectedNode }) {
  const map = useMap();
  useEffect(() => {
    if (selectedNode) map.flyTo([selectedNode.lat, selectedNode.lng], 13, { duration: 0.7 });
  }, [map, selectedNode]);
  return null;
}

function LocationPicker({ enabled, onPick }) {
  const map = useMapEvents({
    click(event) {
      if (!enabled) return;
      onPick({ lat: Number(event.latlng.lat.toFixed(6)), lng: Number(event.latlng.lng.toFixed(6)) });
    },
  });

  useEffect(() => {
    const container = map.getContainer();
    container.classList.toggle('location-picking', enabled);
    return () => container.classList.remove('location-picking');
  }, [enabled, map]);
  return null;
}

function MapTools({ mapStyle, setMapStyle, labelsVisible, setLabelsVisible, zonesVisible, setZonesVisible, collapsed, setCollapsed, picking, setPicking, savedLocation, clearLocation }) {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!controlRef.current) return;
    L.DomEvent.disableClickPropagation(controlRef.current);
    L.DomEvent.disableScrollPropagation(controlRef.current);
  }, []);

  return (
    <div className={`map-tools ${collapsed ? 'collapsed' : ''}`} ref={controlRef}>
      <button className="map-tools-toggle" onClick={() => setCollapsed((current) => !current)} aria-label={collapsed ? 'Open map tools' : 'Collapse map tools'} title={collapsed ? 'Open map tools' : 'Collapse map tools'}>
        {collapsed ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
      </button>
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
      <button className={`label-toggle ${zonesVisible ? 'on' : ''}`} onClick={() => setZonesVisible((current) => !current)} aria-pressed={zonesVisible}>
        <Layers3 size={14} /><span>Operational zones</span><b>{zonesVisible ? 'ON' : 'OFF'}</b>
      </button>
      <button className={`location-picker-button ${picking ? 'picking' : ''} ${savedLocation ? 'saved' : ''}`} onClick={() => setPicking((current) => !current)} aria-pressed={picking}>
        {savedLocation && !picking ? <Check size={14} /> : <MapPinned size={14} />}<span>{picking ? 'Click a point on map' : savedLocation ? 'Change saved location' : 'Pick a location'}</span><b>{picking ? 'PICKING' : savedLocation ? 'SAVED' : 'SET'}</b>
      </button>
      {savedLocation && <div className="saved-location"><MapPin size={13} /><span><b>Saved point</b><small>{savedLocation.lat.toFixed(5)}, {savedLocation.lng.toFixed(5)}</small></span><button onClick={clearLocation} aria-label="Clear saved location" title="Clear saved location"><Trash2 size={13} /></button></div>}
      <div className="zoom-tools" aria-label="Map zoom controls">
        <button onClick={() => map.zoomIn()} aria-label="Zoom in" title="Zoom in"><Plus size={16} /></button>
        <button onClick={() => map.zoomOut()} aria-label="Zoom out" title="Zoom out"><Minus size={16} /></button>
        <button onClick={() => map.flyToBounds(DELHI_BOUNDS, { padding: [24, 24], duration: 0.65 })} aria-label="Show full Delhi overview" title="Show full Delhi overview"><LocateFixed size={15} /></button>
      </div>
    </div>
  );
}

export default function HazardMap({ nodes, zones = [], filter, selectedNode, onSelect }) {
  const [mapStyle, setMapStyle] = useState('earth');
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [zonesVisible, setZonesVisible] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [picking, setPicking] = useState(false);
  const [savedLocation, setSavedLocation] = useState(null);
  const visibleNodes = nodes.filter((node) => filter === 'All' || node.hazard === filter);
  const activeStyle = mapStyles[mapStyle];

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('kavach-saved-location'));
      if (Number.isFinite(saved?.lat) && Number.isFinite(saved?.lng)) setSavedLocation(saved);
    } catch { /* Ignore an invalid saved browser value. */ }
  }, []);

  const saveLocation = (location) => {
    setSavedLocation(location);
    setPicking(false);
    window.localStorage.setItem('kavach-saved-location', JSON.stringify(location));
  };
  const clearLocation = () => {
    setSavedLocation(null);
    setPicking(false);
    window.localStorage.removeItem('kavach-saved-location');
  };

  return (
    <MapContainer bounds={DELHI_BOUNDS} boundsOptions={{ padding: [24, 24] }} minZoom={9} maxZoom={18} maxBounds={DELHI_BOUNDS} maxBoundsViscosity={0.72} zoomControl={false} scrollWheelZoom doubleClickZoom boxZoom keyboard className={`leaflet-map map-${mapStyle}`}>
      <TileLayer key={`${mapStyle}-base`} attribution={activeStyle.attribution} url={activeStyle.base} zIndex={200} />
      {labelsVisible && <TileLayer key={`${mapStyle}-labels`} attribution={activeStyle.attribution} url={activeStyle.labels} zIndex={350} />}
      {zonesVisible && zones.map((zone) => (
        <Polygon
          key={zone.id}
          positions={zone.positions}
          interactive={false}
          pathOptions={{ color: zone.color, fillColor: zone.color, weight: 0.85, opacity: 0.48, fillOpacity: mapStyle === 'earth' ? 0.22 : 0.16 }}
        />
      ))}
      {zonesVisible && zones.map((zone) => (
        <CircleMarker key={`${zone.id}-label`} center={zone.label} radius={1} pathOptions={{ opacity: 0, fillOpacity: 0 }}>
          <Tooltip permanent direction="center" className="zone-map-label" opacity={1}>
            <div className="zone-tag"><b>{zone.id.replace('ZONE-', 'Z')}</b><span>{zone.short || zone.name}</span></div>
          </Tooltip>
        </CircleMarker>
      ))}
      <Polygon positions={DELHI_BORDER} interactive={false} pathOptions={{ color: mapStyle === 'light' ? '#ffffff' : '#071016', weight: 7, opacity: mapStyle === 'earth' ? 0.82 : 0.62, fillColor: '#32bac7', fillOpacity: 0.025 }} />
      <Polygon positions={DELHI_BORDER} interactive={false} pathOptions={{ color: mapStyle === 'light' ? '#087c88' : '#54e4ed', weight: 2.4, opacity: 0.98, dashArray: '9 5', fillColor: '#32bac7', fillOpacity: mapStyle === 'earth' ? 0.045 : 0.02 }} />
      {visibleNodes.filter((node) => ['critical', 'high'].includes(node.status)).map((node) => (
        <Circle key={`${node.id}-zone`} center={[node.lat, node.lng]} radius={node.status === 'critical' ? 4200 : 2800} pathOptions={{ color: statusColors[node.status], fillColor: statusColors[node.status], fillOpacity: 0.09, opacity: 0.65, weight: 1.2 }} />
      ))}
      {visibleNodes.map((node) => (
        node.status === 'safe' ? (
          <CircleMarker key={node.id} center={[node.lat, node.lng]} radius={selectedNode?.id === node.id ? 8 : 5.5} eventHandlers={{ click: () => onSelect(node) }} pathOptions={{ color: '#ffffff', weight: selectedNode?.id === node.id ? 3 : 2, fillColor: statusColors.safe, fillOpacity: 1 }}>
            <Tooltip direction="top" offset={[0, -7]} opacity={1}><div className="map-tooltip"><b>{node.name}</b><span>{node.id} · {node.area}</span><em>Normal · {node.hazard} monitoring</em></div></Tooltip>
          </CircleMarker>
        ) : (
          <Marker key={node.id} position={[node.lat, node.lng]} icon={createNodeIcon(node, selectedNode?.id === node.id)} eventHandlers={{ click: () => onSelect(node) }}>
            <Tooltip direction="top" opacity={1}><div className="map-tooltip"><b>{node.name}</b><span>{node.id} · {node.area}</span><em>{node.risk}% {node.hazard} risk</em></div></Tooltip>
          </Marker>
        )
      ))}
      {savedLocation && <CircleMarker center={[savedLocation.lat, savedLocation.lng]} radius={9} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#1799a5', fillOpacity: 1 }}><Tooltip permanent direction="top" offset={[0, -10]} opacity={1}><div className="saved-map-tag"><b>Saved location</b><span>{savedLocation.lat.toFixed(5)}, {savedLocation.lng.toFixed(5)}</span></div></Tooltip></CircleMarker>}
      <MapViewport selectedNode={selectedNode} />
      <LocationPicker enabled={picking} onPick={saveLocation} />
      <MapTools mapStyle={mapStyle} setMapStyle={setMapStyle} labelsVisible={labelsVisible} setLabelsVisible={setLabelsVisible} zonesVisible={zonesVisible} setZonesVisible={setZonesVisible} collapsed={collapsed} setCollapsed={setCollapsed} picking={picking} setPicking={setPicking} savedLocation={savedLocation} clearLocation={clearLocation} />
    </MapContainer>
  );
}

const GOOGLE_DELHI_BOUNDS = { north: 28.883446, south: 28.404629, east: 77.345338, west: 76.838835 };
const lightRoadStyles = [
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e8ecea' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dce8de' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#d8dfe3' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#b7d9e2' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#d8dee1' }] },
];
const darkRoadStyles = [
  { elementType: 'geometry', stylers: [{ color: '#17212a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#17212a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8d9ba6' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#3b4a56' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1d2932' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#183029' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c3943' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3b4852' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#26333d' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#102a37' }] },
];

function escapeMapText(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function createGoogleOverlay(maps, map, position, className, html, onClick, title = '') {
  const overlay = new maps.OverlayView();
  let element;
  overlay.onAdd = () => {
    element = document.createElement('button');
    element.type = 'button';
    element.className = className;
    element.innerHTML = html;
    element.title = title;
    element.style.position = 'absolute';
    element.style.transform = 'translate(-50%, -100%)';
    element.style.border = '0';
    element.style.padding = '0';
    element.style.background = 'transparent';
    if (onClick) element.addEventListener('click', onClick);
    else element.tabIndex = -1;
    overlay.getPanes().overlayMouseTarget.appendChild(element);
  };
  overlay.draw = () => {
    if (!element) return;
    const point = overlay.getProjection().fromLatLngToDivPixel(new maps.LatLng(position));
    if (point) { element.style.left = `${point.x}px`; element.style.top = `${point.y}px`; }
  };
  overlay.onRemove = () => { element?.remove(); element = null; };
  overlay.setMap(map);
  return overlay;
}

function GoogleMapTools({ map, mapStyle, setMapStyle, labelsVisible, setLabelsVisible, zonesVisible, setZonesVisible, collapsed, setCollapsed, picking, setPicking, savedLocation, clearLocation }) {
  const showDelhi = () => map?.fitBounds(GOOGLE_DELHI_BOUNDS, 24);
  return (
    <div className={`map-tools ${collapsed ? 'collapsed' : ''}`}>
      <button className="map-tools-toggle" onClick={() => setCollapsed((current) => !current)} aria-label={collapsed ? 'Open map tools' : 'Collapse map tools'} title={collapsed ? 'Open map tools' : 'Collapse map tools'}>
        {collapsed ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
      </button>
      <span className="map-tools-label">GOOGLE MAP STYLE</span>
      <div className="map-style-options">
        {Object.entries(mapStyles).map(([key, item]) => { const Icon = item.icon; return <button key={key} className={mapStyle === key ? 'active' : ''} onClick={() => setMapStyle(key)} aria-label={`${item.name} map`} title={`${item.name} map`}><Icon size={14} /><span>{item.name}</span></button>; })}
      </div>
      <button className={`label-toggle ${labelsVisible ? 'on' : ''}`} onClick={() => setLabelsVisible((current) => !current)} aria-pressed={labelsVisible}>
        <MapPin size={14} /><span>Google place labels</span><b>{labelsVisible ? 'ON' : 'OFF'}</b>
      </button>
      <button className={`label-toggle ${zonesVisible ? 'on' : ''}`} onClick={() => setZonesVisible((current) => !current)} aria-pressed={zonesVisible}>
        <Layers3 size={14} /><span>Operational zones</span><b>{zonesVisible ? 'ON' : 'OFF'}</b>
      </button>
      <button className={`location-picker-button ${picking ? 'picking' : ''} ${savedLocation ? 'saved' : ''}`} onClick={() => setPicking((current) => !current)} aria-pressed={picking}>
        {savedLocation && !picking ? <Check size={14} /> : <MapPinned size={14} />}<span>{picking ? 'Click a point on map' : savedLocation ? 'Change saved location' : 'Pick a location'}</span><b>{picking ? 'PICKING' : savedLocation ? 'SAVED' : 'SET'}</b>
      </button>
      {savedLocation && <div className="saved-location"><MapPin size={13} /><span><b>Saved point</b><small>{savedLocation.lat.toFixed(5)}, {savedLocation.lng.toFixed(5)}</small></span><button onClick={clearLocation} aria-label="Clear saved location" title="Clear saved location"><Trash2 size={13} /></button></div>}
      <div className="zoom-tools" aria-label="Map zoom controls">
        <button onClick={() => map?.setZoom(Math.min(19, (map.getZoom() || 10) + 1))} aria-label="Zoom in" title="Zoom in"><Plus size={16} /></button>
        <button onClick={() => map?.setZoom(Math.max(9, (map.getZoom() || 10) - 1))} aria-label="Zoom out" title="Zoom out"><Minus size={16} /></button>
        <button onClick={showDelhi} aria-label="Show full Delhi overview" title="Show full Delhi overview"><LocateFixed size={15} /></button>
      </div>
    </div>
  );
}

function GoogleHazardMap({ nodes, zones = [], filter, selectedNode, onSelect }) {
  const containerRef = useRef(null);
  const mapsRef = useRef(null);
  const mapRef = useRef(null);
  const nodeObjectsRef = useRef([]);
  const zoneObjectsRef = useRef([]);
  const borderObjectsRef = useRef([]);
  const savedObjectRef = useRef(null);
  const pickingRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const [googleMap, setGoogleMap] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [mapStyle, setMapStyle] = useState('earth');
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [zonesVisible, setZonesVisible] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [picking, setPicking] = useState(false);
  const [savedLocation, setSavedLocation] = useState(null);
  const visibleNodes = nodes.filter((node) => filter === 'All' || node.hazard === filter);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { pickingRef.current = picking; if (mapRef.current) mapRef.current.setOptions({ draggableCursor: picking ? 'crosshair' : null }); }, [picking]);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('kavach-saved-location'));
      if (Number.isFinite(saved?.lat) && Number.isFinite(saved?.lng)) setSavedLocation(saved);
    } catch { /* Ignore an invalid saved browser value. */ }
  }, []);

  useEffect(() => {
    let cancelled = false; let clickListener;
    loadGoogleMaps().then((maps) => {
      if (cancelled || !containerRef.current) return;
      const map = new maps.Map(containerRef.current, {
        center: { lat: 28.6358, lng: 77.2189 }, zoom: 10, minZoom: 9, maxZoom: 19,
        mapTypeId: 'hybrid', restriction: { latLngBounds: GOOGLE_DELHI_BOUNDS, strictBounds: false },
        streetViewControl: false, mapTypeControl: false, fullscreenControl: false, zoomControl: false,
        clickableIcons: false, gestureHandling: 'greedy', keyboardShortcuts: true,
      });
      map.fitBounds(GOOGLE_DELHI_BOUNDS, 24);
      clickListener = map.addListener('click', (event) => {
        if (!pickingRef.current) return;
        const location = { lat: Number(event.latLng.lat().toFixed(6)), lng: Number(event.latLng.lng().toFixed(6)) };
        setSavedLocation(location); setPicking(false);
        window.localStorage.setItem('kavach-saved-location', JSON.stringify(location));
      });
      mapsRef.current = maps; mapRef.current = map; setGoogleMap(map); setLoadState('ready');
    }).catch(() => { if (!cancelled) setLoadState('error'); });
    return () => {
      cancelled = true; clickListener?.remove();
      [...nodeObjectsRef.current, ...zoneObjectsRef.current, ...borderObjectsRef.current].forEach((object) => object.setMap(null));
      savedObjectRef.current?.setMap(null);
      mapRef.current = null; mapsRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const baseStyles = mapStyle === 'dark' ? darkRoadStyles : lightRoadStyles;
    const styles = labelsVisible ? baseStyles : [...baseStyles, { elementType: 'labels', stylers: [{ visibility: 'off' }] }];
    map.setOptions({
      mapTypeId: mapStyle === 'earth' ? (labelsVisible ? 'hybrid' : 'satellite') : 'roadmap',
      styles: mapStyle === 'earth' ? null : styles,
    });
  }, [mapStyle, labelsVisible, googleMap]);

  useEffect(() => {
    const map = mapRef.current; const maps = mapsRef.current;
    if (!map || !maps) return;
    borderObjectsRef.current.forEach((object) => object.setMap(null));
    const paths = DELHI_BORDER.map(([lat, lng]) => ({ lat, lng }));
    const outer = new maps.Polygon({ map, paths, clickable: false, strokeColor: mapStyle === 'light' ? '#ffffff' : '#071016', strokeWeight: 7, strokeOpacity: mapStyle === 'earth' ? 0.82 : 0.62, fillColor: '#32bac7', fillOpacity: 0.025, zIndex: 410 });
    const border = new maps.Polygon({ map, paths, clickable: false, strokeColor: mapStyle === 'light' ? '#087c88' : '#54e4ed', strokeWeight: 2.4, strokeOpacity: 0.98, fillColor: '#32bac7', fillOpacity: mapStyle === 'earth' ? 0.045 : 0.02, zIndex: 420 });
    borderObjectsRef.current = [outer, border];
  }, [mapStyle, googleMap]);

  useEffect(() => {
    const map = mapRef.current; const maps = mapsRef.current;
    if (!map || !maps) return;
    zoneObjectsRef.current.forEach((object) => object.setMap(null));
    zoneObjectsRef.current = [];
    if (!zonesVisible) return;
    zones.forEach((zone) => {
      const polygon = new maps.Polygon({
        map, paths: zone.positions.map(([lat, lng]) => ({ lat, lng })), clickable: false,
        strokeColor: zone.color, strokeWeight: 1, strokeOpacity: 0.52, fillColor: zone.color,
        fillOpacity: mapStyle === 'earth' ? 0.22 : 0.16, zIndex: 300,
      });
      const label = createGoogleOverlay(maps, map, { lat: zone.label[0], lng: zone.label[1] }, 'google-zone-label', `<span class="zone-tag"><b>${escapeMapText(zone.id.replace('ZONE-', 'Z'))}</b><span>${escapeMapText(zone.short || zone.name)}</span></span>`, null);
      zoneObjectsRef.current.push(polygon, label);
    });
  }, [zones, zonesVisible, mapStyle, googleMap]);

  useEffect(() => {
    const map = mapRef.current; const maps = mapsRef.current;
    if (!map || !maps) return;
    nodeObjectsRef.current.forEach((object) => { maps.event.clearInstanceListeners(object); object.setMap(null); });
    nodeObjectsRef.current = [];
    visibleNodes.forEach((node) => {
      const position = { lat: Number(node.lat), lng: Number(node.lng) };
      if (['critical', 'high'].includes(node.status)) {
        nodeObjectsRef.current.push(new maps.Circle({ map, center: position, radius: node.status === 'critical' ? 4200 : 2800, clickable: false, strokeColor: statusColors[node.status], strokeOpacity: 0.65, strokeWeight: 1.2, fillColor: statusColors[node.status], fillOpacity: 0.09, zIndex: 440 }));
      }
      if (node.status === 'safe') {
        const selected = selectedNode?.id === node.id;
        const marker = new maps.Marker({ map, position, title: `${node.name} · ${node.area}`, zIndex: selected ? 800 : 600, icon: { path: maps.SymbolPath.CIRCLE, scale: selected ? 8 : 5.5, fillColor: statusColors.safe, fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: selected ? 3 : 2 } });
        marker.addListener('click', () => onSelectRef.current(node));
        nodeObjectsRef.current.push(marker);
      } else {
        const Icon = getHazardIcon(node.hazard);
        const svg = renderToStaticMarkup(<Icon size={17} strokeWidth={2.35} aria-hidden="true" />);
        const overlay = createGoogleOverlay(maps, map, position, `hazard-node-marker ${node.status || 'safe'} ${selectedNode?.id === node.id ? 'selected' : ''}`, `<span class="hazard-node-pin" style="--node-color:${statusColors[node.status] || statusColors.safe}">${svg}</span>`, () => onSelectRef.current(node), `${node.name} · ${node.risk}% ${node.hazard} risk`);
        nodeObjectsRef.current.push(overlay);
      }
    });
  }, [nodes, filter, selectedNode, googleMap]);

  useEffect(() => {
    if (!selectedNode || !mapRef.current) return;
    mapRef.current.panTo({ lat: Number(selectedNode.lat), lng: Number(selectedNode.lng) });
    mapRef.current.setZoom(13);
  }, [selectedNode]);

  useEffect(() => {
    const map = mapRef.current; const maps = mapsRef.current;
    if (!map || !maps) return;
    savedObjectRef.current?.setMap(null); savedObjectRef.current = null;
    if (!savedLocation) return;
    savedObjectRef.current = new maps.Marker({ map, position: savedLocation, title: `Saved location · ${savedLocation.lat.toFixed(5)}, ${savedLocation.lng.toFixed(5)}`, zIndex: 850, icon: { path: maps.SymbolPath.CIRCLE, scale: 9, fillColor: '#1799a5', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 3 } });
  }, [savedLocation, googleMap]);

  const clearLocation = () => { setSavedLocation(null); setPicking(false); window.localStorage.removeItem('kavach-saved-location'); };

  return (
    <div className={`google-map-shell map-${mapStyle} ${picking ? 'location-picking' : ''}`}>
      <div ref={containerRef} className="google-map-surface" aria-label="Google Maps overview of Delhi disaster intelligence nodes" />
      {loadState === 'loading' && <div className="map-loading"><Globe2 size={23} /><span>Loading Google Maps</span></div>}
      {loadState === 'error' && <div className="map-loading map-error"><Globe2 size={23} /><span>Google Maps could not be loaded</span></div>}
      <GoogleMapTools map={googleMap} mapStyle={mapStyle} setMapStyle={setMapStyle} labelsVisible={labelsVisible} setLabelsVisible={setLabelsVisible} zonesVisible={zonesVisible} setZonesVisible={setZonesVisible} collapsed={collapsed} setCollapsed={setCollapsed} picking={picking} setPicking={setPicking} savedLocation={savedLocation} clearLocation={clearLocation} />
    </div>
  );
}
