'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  AlertTriangle,
  BarChart3,
  BellRing,
  Building2,
  Check,
  ChevronRight,
  CloudFog,
  CloudRain,
  Cpu,
  Crosshair,
  Download,
  Eye,
  FileText,
  Factory,
  Flame,
  FlaskConical,
  Gauge,
  LockKeyhole,
  Map as MapIcon,
  MapPinned,
  Moon,
  Pencil,
  Plus,
  Radio,
  RadioTower,
  Save,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Sun,
  ThermometerSun,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Waves,
  Wifi,
  Wind,
  X,
} from 'lucide-react';

const HazardMap = dynamic(() => import('./HazardMap'), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <Crosshair size={22} />
      <span>Loading Delhi operating picture</span>
    </div>
  ),
});

const DeviceLocationPicker = dynamic(() => import('./DeviceLocationPicker'), {
  ssr: false,
  loading: () => <div className="device-map-loading"><MapPinned size={19} /><span>Loading location picker</span></div>,
});

const DeviceRegistryMap = dynamic(() => import('./DeviceRegistryMap'), {
  ssr: false,
  loading: () => <div className="device-map-loading"><MapPinned size={19} /><span>Loading device registry</span></div>,
});

const FIREBASE_URL = (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://sih-kavach-default-rtdb.asia-southeast1.firebasedatabase.app').replace(/\/$/, '');

const navItems = [
  { label: 'Command Centre', icon: Activity },
  { label: 'Live Map', icon: MapIcon },
  { label: 'Alerts', icon: BellRing, badge: 6 },
  { label: 'Sensor Grid', icon: Radio },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Reports', icon: FileText },
  { label: 'Settings', icon: Settings },
];

const delhiNodes = [
  {
    id: 'YAM-01', name: 'Yamuna · Wazirabad', area: 'North Delhi', hazard: 'Flood', status: 'critical',
    lat: 28.7149, lng: 77.2316, risk: 91, updated: '18 sec ago',
    readings: { 'Water level': '207.1 m', 'Flow rate': '8.4 k m³/s', Rainfall: '36 mm/h' },
  },
  {
    id: 'AIR-14', name: 'Anand Vihar', area: 'East Delhi', hazard: 'Air Quality', status: 'high',
    lat: 28.6469, lng: 77.316, risk: 78, updated: '31 sec ago',
    readings: { AQI: '312', 'PM2.5': '168 µg/m³', Wind: '6 km/h' },
  },
  {
    id: 'DRN-08', name: 'Minto Bridge Drain', area: 'Central Delhi', hazard: 'Flood', status: 'high',
    lat: 28.6392, lng: 77.2221, risk: 82, updated: '44 sec ago',
    readings: { 'Road water': '42 cm', Pump: 'Active', Rainfall: '28 mm/h' },
  },
  {
    id: 'DRN-22', name: 'Najafgarh Drain', area: 'South West Delhi', hazard: 'Flood', status: 'moderate',
    lat: 28.5864, lng: 77.0632, risk: 59, updated: '1 min ago',
    readings: { 'Drain level': '72%', 'Flow trend': 'Rising', Rainfall: '19 mm/h' },
  },
  {
    id: 'HEAT-06', name: 'Narela Industrial Area', area: 'North West Delhi', hazard: 'Heat', status: 'moderate',
    lat: 28.8527, lng: 77.0929, risk: 54, updated: '52 sec ago',
    readings: { Temperature: '39.8°C', Humidity: '61%', 'Heat index': '48°C' },
  },
  {
    id: 'WX-12', name: 'Dwarka Sector 8', area: 'South West Delhi', hazard: 'Weather', status: 'safe',
    lat: 28.5656, lng: 77.067, risk: 26, updated: '38 sec ago',
    readings: { Wind: '21 km/h', Pressure: '997 hPa', Rainfall: '8 mm/h' },
  },
  {
    id: 'AIR-03', name: 'RK Puram', area: 'New Delhi', hazard: 'Air Quality', status: 'safe',
    lat: 28.5635, lng: 77.1865, risk: 31, updated: '27 sec ago',
    readings: { AQI: '126', 'PM2.5': '58 µg/m³', Wind: '11 km/h' },
  },
  {
    id: 'YAM-09', name: 'Yamuna · Okhla Barrage', area: 'South East Delhi', hazard: 'Flood', status: 'safe',
    lat: 28.5355, lng: 77.3024, risk: 34, updated: '1 min ago',
    readings: { 'Water level': '198.4 m', 'Flow trend': 'Stable', Rainfall: '11 mm/h' },
  },
];

const demoNodes = [
  ...delhiNodes,
  {
    id: 'GAS-OKH-09', name: 'Okhla Industrial Gas Watch', area: 'South East Delhi', hazard: 'Industrial Pollution', status: 'critical',
    lat: 28.5352, lng: 77.2797, risk: 94, updated: '1 min ago', zone: 'ZONE-6',
    sensors: ['VOC', 'CO', 'NO2', 'SO2', 'PM2.5'], readings: { VOC: '985 ppb', CO: '18.4 ppm', NO2: '196 µg/m³', 'PM2.5': '241 µg/m³' },
    dataQuality: { status: 'invalid', issue: 'VOC channels disagree by 43%; calibration check required.', lastValid: '17 min ago' },
  },
  {
    id: 'RAIN-DWK-02', name: 'Dwarka Rain Gauge', area: 'South West Delhi', hazard: 'Weather', status: 'high',
    lat: 28.5728, lng: 77.0536, risk: 72, updated: '19 min ago', zone: 'ZONE-2',
    sensors: ['Rainfall', 'Pressure', 'Wind speed', 'Humidity'], readings: { Rainfall: '—', Pressure: '996 hPa', 'Wind speed': '34 km/h', Humidity: '88%' },
    dataQuality: { status: 'missing', issue: 'Rain gauge payload missing for three consecutive reporting windows.', lastValid: '19 min ago' },
  },
  {
    id: 'SOIL-NAJ-05', name: 'Najafgarh Floodplain Soil Node', area: 'South West Delhi', hazard: 'Flood', status: 'high',
    lat: 28.5927, lng: 76.9901, risk: 76, updated: '23 min ago', zone: 'ZONE-2',
    sensors: ['Soil moisture', 'Rainfall', 'Water level'], readings: { 'Soil moisture': '98%', Rainfall: '42 mm/h', 'Water level': '1.82 m' },
    dataQuality: { status: 'stale', issue: 'Soil probe packet is 23 minutes old during active rainfall.', lastValid: '23 min ago' },
  },
  {
    id: 'RIV-WZR-11', name: 'Wazirabad River Gauge', area: 'North Delhi', hazard: 'Flood', status: 'critical',
    lat: 28.7114, lng: 77.2257, risk: 92, updated: '12 sec ago', zone: 'ZONE-4',
    sensors: ['Water level', 'Flow rate', 'Rainfall', 'Turbidity'], readings: { 'Water level': '207.3 m', 'Flow rate': '8.8 k m³/s', Rainfall: '39 mm/h', Turbidity: '286 NTU' },
    dataQuality: { status: 'valid', issue: 'Validated by paired river gauge.', lastValid: '12 sec ago' },
  },
  {
    id: 'AQ-ANV-17', name: 'Anand Vihar Traffic Air Node', area: 'East Delhi', hazard: 'Air Quality', status: 'critical',
    lat: 28.6476, lng: 77.3145, risk: 89, updated: '22 sec ago', zone: 'ZONE-4',
    sensors: ['PM2.5', 'PM10', 'NO2', 'CO', 'Noise'], readings: { AQI: '386', 'PM2.5': '231 µg/m³', PM10: '412 µg/m³', NO2: '174 µg/m³' },
    dataQuality: { status: 'valid', issue: 'Cross-checked with roadside reference monitor.', lastValid: '22 sec ago' },
  },
  {
    id: 'GAS-JHM-04', name: 'Jhilmil Industrial Gas Node', area: 'Shahdara', hazard: 'Industrial Pollution', status: 'high',
    lat: 28.6738, lng: 77.3112, risk: 81, updated: '34 sec ago', zone: 'ZONE-4',
    sensors: ['VOC', 'H2S', 'NH3', 'SO2', 'PM10'], readings: { VOC: '712 ppb', H2S: '19 ppm', NH3: '11 ppm', SO2: '96 µg/m³' },
    dataQuality: { status: 'valid', issue: 'Reference drift within tolerance.', lastValid: '34 sec ago' },
  },
  {
    id: 'WTR-SHD-07', name: 'Shahdara Drain Quality Node', area: 'Shahdara', hazard: 'Water Quality', status: 'high',
    lat: 28.6592, lng: 77.2891, risk: 84, updated: '8 min ago', zone: 'ZONE-4',
    sensors: ['pH', 'Turbidity', 'Conductivity', 'H2S', 'NH3'], readings: { pH: '14.7', Turbidity: '—', Conductivity: '4.8 mS/cm', H2S: '21 ppm' },
    dataQuality: { status: 'invalid', issue: 'pH reading is outside sensor range and turbidity channel is unavailable.', lastValid: '8 min ago' },
  },
  {
    id: 'FIR-RDG-03', name: 'Delhi Ridge Fire Node', area: 'South Delhi', hazard: 'Fire', status: 'high',
    lat: 28.5061, lng: 77.1764, risk: 68, updated: '46 sec ago', zone: 'ZONE-5',
    sensors: ['Air temperature', 'Humidity', 'Wind speed', 'PM2.5'], readings: { 'Air temperature': '44.8°C', Humidity: '19%', 'Wind speed': '27 km/h', 'PM2.5': '142 µg/m³' },
    dataQuality: { status: 'valid', issue: 'Optical smoke channel clear.', lastValid: '46 sec ago' },
  },
  {
    id: 'DUST-BWN-08', name: 'Bawana Dust Corridor Node', area: 'North West Delhi', hazard: 'Dust', status: 'moderate',
    lat: 28.7994, lng: 77.0331, risk: 58, updated: '31 sec ago', zone: 'ZONE-1',
    sensors: ['PM10', 'PM2.5', 'Wind speed', 'Humidity'], readings: { PM10: '294 µg/m³', 'PM2.5': '126 µg/m³', 'Wind speed': '24 km/h', Humidity: '33%' },
    dataQuality: { status: 'valid', issue: 'Consistent with transport-corridor baseline.', lastValid: '31 sec ago' },
  },
  {
    id: 'MET-CP-06', name: 'Central Delhi Micro Weather', area: 'New Delhi', hazard: 'Weather', status: 'moderate',
    lat: 28.6306, lng: 77.2182, risk: 47, updated: '28 sec ago', zone: 'ZONE-3',
    sensors: ['Rainfall', 'Pressure', 'Air temperature', 'Humidity', 'Wind speed'], readings: { Rainfall: '14 mm/h', Pressure: '998 hPa', 'Air temperature': '31.4°C', Humidity: '83%' },
    dataQuality: { status: 'valid', issue: 'All weather channels reporting.', lastValid: '28 sec ago' },
  },
];

const alerts = [
  {
    id: 'INC-2048', node: 'YAM-01', level: 'critical', title: 'Yamuna level above danger mark',
    location: 'Wazirabad Barrage · North Delhi', time: '2 min',
    summary: 'Level has risen 18 cm in the last 30 minutes. Low-lying riverbank sectors require verification.',
    metric: '207.1 m', confidence: 91, action: 'Notify North District EOC',
  },
  {
    id: 'INC-2045', node: 'DRN-08', level: 'high', title: 'Rapid waterlogging detected',
    location: 'Minto Bridge · Central Delhi', time: '7 min',
    summary: 'Road-water sensor crossed 40 cm. Pump telemetry is active but inflow remains elevated.',
    metric: '42 cm', confidence: 87, action: 'Dispatch traffic diversion unit',
  },
  {
    id: 'INC-2041', node: 'AIR-14', level: 'high', title: 'Severe air-quality pocket',
    location: 'Anand Vihar · East Delhi', time: '14 min',
    summary: 'PM2.5 readings remain elevated across three adjacent monitors with low wind dispersion.',
    metric: 'AQI 312', confidence: 78, action: 'Increase mobile monitoring',
  },
  {
    id: 'INC-2036', node: 'DRN-22', level: 'moderate', title: 'Drain level trending upward',
    location: 'Najafgarh · South West Delhi', time: '22 min',
    summary: 'Catchment sensors indicate a steady rise. No immediate overflow predicted in the next hour.',
    metric: '+9% / hr', confidence: 73, action: 'Continue enhanced watch',
  },
  {
    id: 'INC-2029', node: 'HEAT-06', level: 'moderate', title: 'Local heat-stress threshold',
    location: 'Narela · North West Delhi', time: '35 min',
    summary: 'Heat index is elevated around the industrial cluster. Exposure window is expected to persist.',
    metric: '48°C HI', confidence: 71, action: 'Alert ward control room',
  },
  {
    id: 'INC-2021', node: 'WX-12', level: 'advisory', title: 'Gust front approaching',
    location: 'Dwarka · South West Delhi', time: '48 min',
    summary: 'Short-duration wind gusts may affect exposed structures. No severe-weather escalation yet.',
    metric: '42 km/h', confidence: 66, action: 'Monitor for escalation',
  },
];

const dataQualityLabels = {
  invalid: 'Invalid sensor data',
  missing: 'Sensor data missing',
  stale: 'Stale sensor transmission',
  unreliable: 'Unreliable sensor signal',
};

const dataQualityAlerts = (nodes) => nodes
  .filter((node) => ['invalid', 'missing', 'stale', 'unreliable'].includes(node.dataQuality?.status))
  .map((node) => ({
    id: `DQ-${node.id}`,
    node: node.id,
    level: node.dataQuality.status === 'invalid' ? 'critical' : 'high',
    title: `${dataQualityLabels[node.dataQuality.status]} · ${node.name}`,
    location: `${node.area} · Delhi NCT`,
    time: node.updated,
    summary: node.dataQuality.issue,
    metric: node.dataQuality.status.toUpperCase(),
    confidence: node.dataQuality.status === 'invalid' ? 96 : 88,
    action: 'Dispatch field verification and use paired-node estimates until data is restored.',
    dataQuality: true,
  }));

const mergeAlertsWithDataQuality = (sourceAlerts, nodes) => {
  const source = Array.isArray(sourceAlerts) ? sourceAlerts : [];
  const qualityAlerts = dataQualityAlerts(nodes);
  const sourceIds = new Set(source.map((alert) => alert.id));
  return [...qualityAlerts.filter((alert) => !sourceIds.has(alert.id)), ...source];
};

const fallbackAnalytics = {
  riskTrend: [42, 51, 47, 62, 72, 91, 78, 69, 58, 63, 55, 49],
  districts: [['North Delhi', 91], ['Central Delhi', 82], ['East Delhi', 78], ['South West', 59], ['North West', 54]],
  hazards: [['Flood / Water', 46, 'cyan'], ['Air quality', 27, 'purple'], ['Heat stress', 17, 'orange'], ['Severe weather', 10, 'slate']],
};

const fallbackReports = [
  { id: 'RPT-208', title: 'Delhi Daily Situation Report', scope: 'All districts', created: '24 Aug · 14:00', format: 'JSON' },
  { id: 'RPT-207', title: 'Yamuna Flood Intelligence Brief', scope: 'North Delhi', created: '24 Aug · 13:30', format: 'JSON' },
  { id: 'RPT-206', title: 'Air Quality Cluster Analysis', scope: 'East Delhi', created: '24 Aug · 12:45', format: 'JSON' },
  { id: 'RPT-205', title: 'Sensor Network Health Summary', scope: 'Delhi NCT', created: '24 Aug · 12:00', format: 'JSON' },
];

const fallbackSettings = { escalation: true, offline: true, community: false, edge: true };

const fallbackZones = [
  {
    id: 'ZONE-1', name: 'North / North-West', short: 'North · NW', color: '#ef8d44',
    areas: ['Narela', 'Bawana', 'Alipur', 'Rohini'],
    hazards: ['Forest / grass fire', 'Dust', 'Industrial pollution'],
    label: [28.787, 77.085],
    positions: [[28.883, 77.083], [28.856, 77.214], [28.797, 77.2], [28.771, 77.233], [28.721, 77.2], [28.7, 77.16], [28.69, 77.1], [28.699, 76.968], [28.712, 76.948], [28.768, 76.956], [28.821, 76.98], [28.84, 77.02]],
  },
  {
    id: 'ZONE-2', name: 'West / South-West', short: 'West · SW', color: '#55b7d6',
    areas: ['Mundka', 'Najafgarh', 'Dwarka'],
    hazards: ['Flooding / waterlogging', 'Industrial pollution', 'Dust'],
    label: [28.596, 77.015],
    positions: [[28.699, 76.968], [28.69, 77.1], [28.67, 77.12], [28.62, 77.15], [28.56, 77.13], [28.511, 77.099], [28.505, 76.953], [28.525, 76.877], [28.583, 76.839], [28.633, 76.944], [28.67, 76.937]],
  },
  {
    id: 'ZONE-3', name: 'Central Delhi', short: 'Central core', color: '#f2c94c',
    areas: ['Central Delhi', 'New Delhi'],
    hazards: ['Air pollution', 'Heat', 'Traffic monitoring'],
    label: [28.64, 77.215],
    positions: [[28.69, 77.1], [28.721, 77.2], [28.69, 77.28], [28.61, 77.28], [28.56, 77.2], [28.56, 77.13], [28.62, 77.15], [28.67, 77.12]],
  },
  {
    id: 'ZONE-4', name: 'East / North-East', short: 'East · NE', color: '#b06bd3',
    areas: ['Shahdara', 'Yamuna east bank'],
    hazards: ['Floods', 'Yamuna risk', 'Dense urban pollution'],
    label: [28.708, 77.295],
    positions: [[28.856, 77.214], [28.823, 77.224], [28.797, 77.2], [28.771, 77.233], [28.721, 77.2], [28.69, 77.28], [28.61, 77.28], [28.59, 77.309], [28.605, 77.341], [28.662, 77.32], [28.713, 77.331], [28.77, 77.337], [28.83, 77.28]],
  },
  {
    id: 'ZONE-5', name: 'South / South-West', short: 'South · SW', color: '#72bd69',
    areas: ['Vasant Kunj', 'Mehrauli', 'Delhi Ridge'],
    hazards: ['Forest fire', 'Heat', 'Dust'],
    label: [28.492, 77.175],
    positions: [[28.56, 77.13], [28.56, 77.2], [28.58, 77.25], [28.52, 77.27], [28.49, 77.272], [28.46, 77.24], [28.41, 77.218], [28.406, 77.171], [28.44, 77.13], [28.473, 77.112], [28.511, 77.099]],
  },
  {
    id: 'ZONE-6', name: 'South-East', short: 'South-East', color: '#e05d74',
    areas: ['Okhla', 'Badarpur', 'Tughlakabad border'],
    hazards: ['Industrial pollution', 'Yamuna / flood risk', 'Heat'],
    label: [28.53, 77.295],
    positions: [[28.61, 77.28], [28.59, 77.309], [28.54, 77.321], [28.513, 77.345], [28.483, 77.314], [28.49, 77.272], [28.52, 77.27], [28.58, 77.25]],
  },
];

const toCollection = (value, fallback) => {
  if (!value) return fallback;
  const rows = Array.isArray(value) ? value.filter(Boolean) : Object.values(value);
  return rows.length ? rows : fallback;
};

const alertLevel = (value, risk = 0) => {
  const normalized = String(value || '').toLowerCase();
  if (['critical', 'emergency', 'severe', 'danger'].some((term) => normalized.includes(term)) || Number(risk) >= 85) return 'critical';
  if (['high', 'warning', 'alert'].some((term) => normalized.includes(term)) || Number(risk) >= 65) return 'high';
  if (['moderate', 'medium', 'watch'].some((term) => normalized.includes(term)) || Number(risk) >= 40) return 'moderate';
  return 'advisory';
};

const alertAge = (value) => {
  if (typeof value === 'string' && value && !Number.isFinite(Number(value))) {
    const parsed = Date.parse(value);
    if (!Number.isFinite(parsed)) return value.replace(/\s+ago$/i, '');
    value = parsed;
  }
  const timestamp = Number(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return 'Just now';
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (elapsedMinutes < 1) return 'Just now';
  if (elapsedMinutes < 60) return `${elapsedMinutes} min`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  return elapsedHours < 24 ? `${elapsedHours} hr` : `${Math.floor(elapsedHours / 24)} day`;
};

function normalizeAlert(record, firebaseKey, order = 0) {
  if (!record || typeof record !== 'object') return null;
  const rawTimestamp = record.timestamp || record.createdAt || record.created_at || record.timeMs || 0;
  const parsedTimestamp = typeof rawTimestamp === 'string' && !Number.isFinite(Number(rawTimestamp)) ? Date.parse(rawTimestamp) : Number(rawTimestamp);
  const timestamp = Number.isFinite(parsedTimestamp) && parsedTimestamp > 0 && parsedTimestamp < 1e12 ? parsedTimestamp * 1000 : parsedTimestamp;
  const relativeTimeLabel = typeof record.time === 'string' && !Number.isFinite(Number(record.time)) && !Number.isFinite(Date.parse(record.time)) ? record.time : timestamp;
  const rawExpiry = Number(record.expiresAt || record.expires_at || 0);
  const expiresAt = rawExpiry > 0 && rawExpiry < 1e12 ? rawExpiry * 1000 : rawExpiry;
  const node = String(record.node || record.nodeId || record.deviceId || record.device_id || record.sensorId || 'UNASSIGNED');
  const risk = Number(record.risk ?? record.riskScore ?? record.confidence ?? 0);
  const hazard = record.hazard || record.type || record.category || 'Edge sensor';
  const rawValue = record.metric ?? record.value ?? record.reading ?? record.sensorValue;
  return {
    ...record,
    id: String(record.id || record.alertId || record.alert_id || firebaseKey || `EDGE-${order + 1}`),
    firebaseKey: String(firebaseKey || record.id || record.alertId || `EDGE-${order + 1}`),
    node,
    level: alertLevel(record.level || record.severity || record.status, risk),
    title: record.title || record.message || `${hazard} threshold alert`,
    location: record.location || record.area || record.district || `${node} · Delhi NCT`,
    time: record.timeLabel || alertAge(relativeTimeLabel),
    summary: record.summary || record.description || record.message || `An edge device reported an abnormal ${String(hazard).toLowerCase()} reading.`,
    metric: rawValue === undefined ? 'Threshold crossed' : String(rawValue),
    confidence: Math.max(0, Math.min(100, Number(record.confidence ?? record.aiConfidence ?? risk ?? 80) || 80)),
    action: record.action || record.recommendedAction || 'Verify signal and notify district control',
    acknowledged: Boolean(record.acknowledged),
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : 0,
    sortTimestamp: Number.isFinite(timestamp) && timestamp > 0 ? timestamp : order,
  };
}

function toAlertCollection(value, fallback = []) {
  if (!value) return fallback;
  const entries = Array.isArray(value) ? value.map((record, index) => [String(index), record]) : Object.entries(value);
  const normalized = entries.map(([key, record], index) => normalizeAlert(record, key, index)).filter((alert) => alert && (!alert.expiresAt || alert.expiresAt > Date.now()));
  return normalized.length ? normalized.sort((a, b) => b.sortTimestamp - a.sortTimestamp) : fallback;
}

function applyFirebaseStreamUpdate(current, path, data, eventType) {
  if (path === '/') {
    if (eventType === 'put') return data;
    return { ...(current && typeof current === 'object' ? current : {}), ...(data && typeof data === 'object' ? data : {}) };
  }
  const next = current && typeof current === 'object' ? JSON.parse(JSON.stringify(current)) : {};
  const segments = path.split('/').filter(Boolean);
  let cursor = next;
  segments.slice(0, -1).forEach((segment) => {
    if (!cursor[segment] || typeof cursor[segment] !== 'object') cursor[segment] = {};
    cursor = cursor[segment];
  });
  const finalSegment = segments.at(-1);
  if (!finalSegment) return next;
  if (data === null) delete cursor[finalSegment];
  else if (eventType === 'patch' && cursor[finalSegment] && typeof cursor[finalSegment] === 'object' && typeof data === 'object') cursor[finalSegment] = { ...cursor[finalSegment], ...data };
  else cursor[finalSegment] = data;
  return next;
}

async function firebaseRequest(path, options = {}) {
  const response = await fetch(`${FIREBASE_URL}/${path}.json`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!response.ok) throw new Error(`Firebase request failed (${response.status})`);
  return response.json();
}

const hazardIcons = { Flood: Waves, Fire: Flame, 'Forest Fire': Flame, 'Air Quality': Wind, Heat: ThermometerSun, Weather: CloudRain, Dust: CloudFog, 'Industrial Pollution': Factory, 'Water Quality': FlaskConical };

const sensorOptions = [
  'Water level', 'Rainfall', 'Soil moisture', 'Water temperature', 'pH', 'Turbidity', 'Conductivity',
  'Air temperature', 'Humidity', 'Heat index', 'PM2.5', 'PM10', 'NO2', 'CO', 'O3', 'SO2', 'VOC',
  'Noise', 'Pressure', 'H2S', 'NH3', 'Wind speed',
];

const hazardSensorPresets = {
  Flood: ['Water level', 'Rainfall', 'Soil moisture'],
  Fire: ['Air temperature', 'Humidity', 'Wind speed', 'PM2.5'],
  'Air Quality': ['PM2.5', 'PM10', 'NO2', 'CO', 'O3'],
  Heat: ['Air temperature', 'Humidity', 'Heat index'],
  Weather: ['Rainfall', 'Air temperature', 'Humidity', 'Pressure', 'Wind speed'],
  Dust: ['PM10', 'PM2.5', 'Wind speed'],
  'Industrial Pollution': ['PM2.5', 'PM10', 'VOC', 'CO', 'NO2', 'SO2'],
  'Water Quality': ['Water level', 'pH', 'Turbidity', 'Conductivity', 'H2S', 'NH3'],
};

const delhiZones = [
  ['ZONE-1', 'Zone 1 · North / North-West'],
  ['ZONE-2', 'Zone 2 · West / South-West'],
  ['ZONE-3', 'Zone 3 · Central Delhi'],
  ['ZONE-4', 'Zone 4 · East / North-East'],
  ['ZONE-5', 'Zone 5 · South / South-West'],
  ['ZONE-6', 'Zone 6 · South-East'],
];

const delhiAreaAnchors = [
  ['Narela', 'North Delhi', 28.8527, 77.0929], ['Bawana', 'North West Delhi', 28.7982, 77.0349],
  ['Alipur', 'North Delhi', 28.7973, 77.1324], ['Rohini', 'North West Delhi', 28.7041, 77.1025],
  ['Model Town', 'North Delhi', 28.7150, 77.1918], ['Wazirabad', 'North Delhi', 28.7083, 77.2300],
  ['Mundka', 'West Delhi', 28.6821, 77.0301], ['Punjabi Bagh', 'West Delhi', 28.6689, 77.1290],
  ['Janakpuri', 'West Delhi', 28.6219, 77.0878], ['Najafgarh', 'South West Delhi', 28.6090, 76.9855],
  ['Dwarka', 'South West Delhi', 28.5921, 77.0460], ['Connaught Place', 'New Delhi', 28.6315, 77.2167],
  ['Karol Bagh', 'Central Delhi', 28.6519, 77.1909], ['Civil Lines', 'Central Delhi', 28.6814, 77.2228],
  ['Minto Bridge', 'Central Delhi', 28.6392, 77.2221], ['Shahdara', 'Shahdara', 28.6733, 77.2890],
  ['Anand Vihar', 'East Delhi', 28.6468, 77.3160], ['Sonia Vihar', 'North East Delhi', 28.7098, 77.2465],
  ['Yamuna Vihar', 'North East Delhi', 28.6988, 77.2737], ['Dilshad Garden', 'Shahdara', 28.6812, 77.3025],
  ['Vasant Kunj', 'South West Delhi', 28.5293, 77.1480], ['Mehrauli', 'South Delhi', 28.5245, 77.1855],
  ['Saket', 'South Delhi', 28.5244, 77.2066], ['R.K. Puram', 'New Delhi', 28.5635, 77.1865],
  ['Lajpat Nagar', 'South East Delhi', 28.5677, 77.2433], ['Okhla', 'South East Delhi', 28.5355, 77.3024],
  ['Jasola', 'South East Delhi', 28.5420, 77.2910], ['Badarpur', 'South East Delhi', 28.5037, 77.3019],
  ['Tughlakabad', 'South East Delhi', 28.5112, 77.2625],
].map(([locality, district, lat, lng]) => ({ locality, district, lat, lng }));

const deviceIdentityCodes = {
  Flood: 'FLD', Fire: 'FIR', 'Air Quality': 'AIR', Heat: 'HET', Weather: 'WTH', Dust: 'DST',
  'Industrial Pollution': 'IND', 'Water Quality': 'WTR',
};

function nearestDelhiArea(latitude, longitude) {
  const lngScale = Math.cos(latitude * Math.PI / 180);
  const nearest = delhiAreaAnchors.reduce((best, anchor) => {
    const distance = (anchor.lat - latitude) ** 2 + ((anchor.lng - longitude) * lngScale) ** 2;
    return distance < best.distance ? { ...anchor, distance } : best;
  }, { ...delhiAreaAnchors[0], distance: Number.POSITIVE_INFINITY });
  return { locality: nearest.locality, district: nearest.district, label: `${nearest.locality} · ${nearest.district}` };
}

function nodeZone(node) {
  const zoneNumber = String(node.zone || '').match(/[1-6]/)?.[0] || String(node.id || '').match(/^Z([1-6])/i)?.[1] || '1';
  return `ZONE-${zoneNumber}`;
}

function generateDeviceIdentity(device, nodes) {
  const zoneNumber = String(device.zone || 'ZONE-1').match(/[1-6]/)?.[0] || '1';
  const sameZoneSequences = nodes
    .filter((node) => nodeZone(node) === `ZONE-${zoneNumber}`)
    .map((node) => Number(String(node.id || '').match(/(\d{1,3})$/)?.[1] || 0));
  const sequence = String(Math.max(0, ...sameZoneSequences) + 1).padStart(3, '0');
  const typeCode = device.nodeType === 'Gateway' ? 'GTW' : device.nodeType === 'Multi-Hazard Node' ? 'MHT' : device.nodeType === 'Reference Node' ? 'REF' : deviceIdentityCodes[device.hazard] || 'NOD';
  const typeName = device.nodeType === 'Gateway' ? 'Gateway' : device.nodeType === 'Multi-Hazard Node' ? 'Multi-Hazard' : device.nodeType === 'Reference Node' ? 'Reference' : device.hazard;
  return { id: `Z${zoneNumber}-${typeCode}-${sequence}`, name: `${typeName} Zone ${zoneNumber} · ${sequence} Node` };
}

const createBlankDevice = () => ({
  id: '', name: '', area: '', district: '', locality: '', zone: 'ZONE-1', nodeType: 'Sensor Node', gatewayId: '', hazard: 'Flood', status: 'safe', risk: '20',
  latitude: '', longitude: '', sensors: [...hazardSensorPresets.Flood],
});

const firebaseReadingKey = (sensor) => sensor.replaceAll('.', '·').replace(/[#$\[\]\/]/g, ' ');
const nodeSensors = (node) => node.sensors?.length ? node.sensors : Object.keys(node.readings || {}).filter((key) => !['Status', 'Signal', 'Source'].includes(key)).map((key) => key.replaceAll('·', '.'));

function buildWarningProfiles(sensors) {
  const normalized = sensors.map((sensor) => sensor.toLowerCase());
  const profiles = [];
  if (normalized.some((sensor) => ['rainfall', 'water level', 'soil moisture'].some((term) => sensor.includes(term)))) profiles.push('monsoon-waterlogging-flood');
  if (normalized.some((sensor) => ['temperature', 'humidity', 'heat index'].some((term) => sensor.includes(term)))) profiles.push('summer-heat-zone');
  if (normalized.some((sensor) => ['pm2.5', 'pm10', 'no2', 'co', 'o3', 'so2', 'voc'].some((term) => sensor.includes(term)))) profiles.push('diwali-pollution');
  return profiles;
}

function SeasonalWarningTicker({ nodes }) {
  const [warningIndex, setWarningIndex] = useState(0);
  const month = new Date().getMonth() + 1;
  const warningTemplates = useMemo(() => {
    const definitions = [
      { id: 'monsoon', months: [6, 7, 8, 9], icon: Waves, title: 'Rainfall → waterlogging → flood watch', detail: 'Rainfall, water-level and soil-moisture nodes escalate in sequence.', terms: ['rainfall', 'water level', 'soil moisture'], season: 'JUN–SEP' },
      { id: 'summer', months: [4, 5, 6], icon: ThermometerSun, title: 'Temperature → heat-zone escalation', detail: 'Heat index rises from local hot spot to district exposure warning.', terms: ['temperature', 'heat index', 'humidity'], season: 'APR–JUN' },
      { id: 'diwali', months: [10, 11], icon: Wind, title: 'PM / gas → Diwali pollution watch', detail: 'Particulate and gas sensors rotate through pollution and smog warnings.', terms: ['pm2.5', 'pm10', 'no2', 'co', 'o3', 'so2', 'voc'], season: 'OCT–NOV' },
    ];
    return definitions.map((warning) => {
      const compatibleNodes = nodes.filter((node) => nodeSensors(node).some((sensor) => warning.terms.some((term) => sensor.toLowerCase().includes(term))));
      return { ...warning, compatibleNodes, active: warning.months.includes(month) };
    }).sort((a, b) => Number(b.active) - Number(a.active));
  }, [month, nodes]);

  useEffect(() => {
    const timer = window.setInterval(() => setWarningIndex((current) => (current + 1) % warningTemplates.length), 5200);
    return () => window.clearInterval(timer);
  }, [warningTemplates.length]);

  const warning = warningTemplates[warningIndex % warningTemplates.length];
  const Icon = warning.icon;
  return (
    <section className={`sensor-warning-ticker ${warning.active ? 'active-season' : ''}`} aria-live="polite">
      <i><Icon size={17} /></i>
      <div><span>SENSOR WARNING LOGIC · {warningIndex + 1}/{warningTemplates.length}</span><strong>{warning.title}</strong><small>{warning.detail}</small></div>
      <em><b>{warning.compatibleNodes.length}</b> NODES<small>{warning.active ? 'ACTIVE SEASON' : warning.season}</small></em>
      <nav aria-label="Warning rotation">{warningTemplates.map((item, index) => <button key={item.id} className={index === warningIndex ? 'active' : ''} onClick={() => setWarningIndex(index)} aria-label={`Show ${item.id} warning`} />)}</nav>
    </section>
  );
}

function NavigationRail({ activeView, setActiveView, theme, setTheme, firebaseStatus, alertCount }) {
  return (
    <aside className="nav-rail" aria-label="Primary navigation">
      <div className="nav-brand" aria-label="KAVACH Delhi"><ShieldCheck size={22} /><span>KV</span></div>
      <nav>
        {navItems.map(({ label, icon: Icon, badge }) => (
          <button key={label} onClick={() => setActiveView(label)} className={`rail-link ${activeView === label ? 'active' : ''}`} aria-current={activeView === label ? 'page' : undefined} aria-label={label} title={label}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{(label === 'Alerts' ? alertCount : badge) > 0 && <b>{label === 'Alerts' ? alertCount : badge}</b>}
          </button>
        ))}
      </nav>
      <div className="rail-bottom">
        <button className="theme-switch" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}<span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
        <div className={`network-beacon ${firebaseStatus}`} title={`Firebase: ${firebaseStatus}`}><i />FB</div>
      </div>
    </aside>
  );
}

function SelectedNode({ node, onClose }) {
  if (!node) return null;
  const Icon = hazardIcons[node.hazard] || Gauge;
  return (
    <aside className="node-card">
      <div className="node-card-head">
        <span className={`severity-dot ${node.status}`} />
        <div><small>{node.id} · {node.area}</small><strong>{node.name}</strong></div>
        <button onClick={onClose} aria-label="Close sensor details">×</button>
      </div>
      <div className="node-readings">
        {Object.entries(node.readings).map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}
      </div>
      {node.dataQuality && node.dataQuality.status !== 'valid' && <div className="node-data-fault"><AlertTriangle size={14} /><span><b>DATA {node.dataQuality.status.toUpperCase()}</b>{node.dataQuality.issue}</span></div>}
      <div className="node-risk"><Icon size={16} /><span>{node.hazard} risk</span><strong>{node.risk}%</strong><small>Updated {node.updated}</small></div>
    </aside>
  );
}

function AlertItem({ alert, state, onAcknowledge, onLocate, nodes = demoNodes }) {
  const node = nodes.find((item) => item.id === alert.node);
  const Icon = hazardIcons[node?.hazard] || AlertTriangle;
  return (
    <article className={`incident ${alert.level} ${state ? 'acknowledged' : ''}`}>
      <div className="incident-topline"><span><i />{alert.level}</span><time>{/^(just )?now$/i.test(alert.time) ? alert.time : /ago$/i.test(alert.time) ? alert.time : `${alert.time} ago`}</time></div>
      <div className="incident-title"><span className="incident-icon"><Icon size={17} /></span><div><small>{alert.id}</small><h3>{alert.title}</h3></div></div>
      <p className="incident-location"><Building2 size={12} />{alert.location}</p>
      <p className="incident-summary">{alert.summary}</p>
      <div className="incident-signal"><div><span>Observed</span><b>{alert.metric}</b></div><div><span>AI confidence</span><b>{alert.confidence}%</b></div></div>
      <div className="incident-action"><span>Recommended</span><strong>{alert.action}</strong></div>
      <div className="incident-buttons">
        <button onClick={() => onLocate(alert.node)}><Crosshair size={13} />Locate</button>
        <button className="primary-action" onClick={() => onAcknowledge(alert.id)}>{state ? <><Check size={13} />Acknowledged</> : 'Acknowledge'}</button>
      </div>
    </article>
  );
}

function AlertRail({ states, onAcknowledge, onLocate, alertsData, nodes, firebaseStatus }) {
  return (
    <aside className="alert-rail" aria-label="Delhi active alerts">
      <header className="alert-rail-header">
        <div className="jurisdiction"><span>DELHI / NCT</span><b>Command Centre</b></div>
        <div className="feed-state"><i />{firebaseStatus === 'connected' ? 'Firebase live' : 'Demo data'}</div>
      </header>
      <div className="alert-summary">
        <div><span>Active incidents</span><strong>{String(alertsData.length).padStart(2, '0')}</strong></div>
        <div><span>Unacknowledged</span><strong>{alertsData.filter((alert) => !states[alert.id]).length}</strong></div>
        <div><span>Highest risk</span><strong className="critical-text">{Math.max(0, ...alertsData.map((alert) => Number(alert.confidence) || 0))}%</strong></div>
      </div>
      <SeasonalWarningTicker nodes={nodes} />
      <div className="queue-heading"><div><span>PRIORITY QUEUE</span><b>Newest first</b></div><button aria-label="Filter alerts">All <ChevronRight size={12} /></button></div>
      <div className="incident-feed">
        {alertsData.map((alert) => <AlertItem key={alert.id} alert={alert} state={states[alert.id]} onAcknowledge={onAcknowledge} onLocate={onLocate} nodes={nodes} />)}
      </div>
    </aside>
  );
}

function MapCanvas({ title, filter, setFilter, selectedNode, setSelectedNode, nodes, zones, alertsData, firebaseStatus }) {
  const hazardFilters = ['All', ...new Set(nodes.map((node) => node.hazard))];
  return (
    <section className="map-canvas" aria-label={`Delhi ${title} map`}>
      <HazardMap nodes={nodes} zones={zones} filter={filter} selectedNode={selectedNode} onSelect={setSelectedNode} />
      <div className="map-identity"><div className="delhi-seal"><ShieldCheck size={18} /></div><div><span>KAVACH · DELHI</span><h1>{title}</h1></div></div>
      <div className="map-status"><span><i />{String(nodes.length).padStart(2, '0')} nodes deployed</span><b>10 DISTRICTS</b><b>{String(alertsData.length).padStart(2, '0')} ACTIVE ALERTS</b><b>{firebaseStatus === 'connected' ? 'FIREBASE LIVE' : 'DEMO FALLBACK'}</b></div>
      <div className="map-filters" role="group" aria-label="Filter map hazards">
        {hazardFilters.map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      <div className="map-legend" aria-label="Map severity legend"><span><i className="safe" />Normal</span><span><i className="moderate" />Moderate</span><span><i className="high" />High</span><span><i className="critical" />Critical / data fault</span></div>
      <SelectedNode node={selectedNode} onClose={() => setSelectedNode(null)} />
    </section>
  );
}

function NodeRail({ selectedNode, onSelect, nodes }) {
  return (
    <aside className="node-rail">
      <header><div><span>DELHI SENSOR GRID</span><b>Deployed nodes</b></div><em><i />{nodes.length} online</em></header>
      <div className="node-rail-stats"><div><strong>{String(nodes.length).padStart(2, '0')}</strong><span>Reporting</span></div><div><strong>{new Set(nodes.map((node) => node.hazard)).size}</strong><span>Hazards</span></div><div><strong>31s</strong><span>Avg. sync</span></div></div>
      <div className="node-list-heading"><span>FIELD REGISTRY</span><b>Risk ranked</b></div>
      <div className="node-list">
        {nodes.map((node) => {
          const Icon = hazardIcons[node.hazard] || Radio;
          return <button key={node.id} className={selectedNode?.id === node.id ? 'selected' : ''} onClick={() => onSelect(node)}><i className={`node-type ${node.status}`}><Icon size={15} /></i><span><small>{node.id} · {node.area}</small><strong>{node.name}</strong><em>Updated {node.updated}</em></span><b>{node.risk}%</b></button>;
        })}
      </div>
    </aside>
  );
}

function ModuleHeader({ eyebrow, title, description, action }) {
  return <header className="module-header"><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</header>;
}

function AlertsPage({ acknowledged, onAcknowledge, onLocate, alertsData, nodes }) {
  const [level, setLevel] = useState('All');
  const filteredAlerts = level === 'All' ? alertsData : alertsData.filter((alert) => alert.level === level.toLowerCase());
  return (
    <section className="module-page">
      <ModuleHeader eyebrow="INCIDENT OPERATIONS · DELHI NCT" title="Active Alerts" description="AI-ranked events awaiting command-centre action across Delhi districts." action={<div className="module-live"><i />SIMULATED LIVE FEED</div>} />
      <div className="module-metrics"><div><span>Critical</span><strong className="red-text">{String(alertsData.filter((alert) => alert.level === 'critical').length).padStart(2, '0')}</strong><small>Immediate action</small></div><div><span>High</span><strong className="orange-text">{String(alertsData.filter((alert) => alert.level === 'high').length).padStart(2, '0')}</strong><small>District response</small></div><div><span>Moderate</span><strong>{String(alertsData.filter((alert) => alert.level === 'moderate').length).padStart(2, '0')}</strong><small>Enhanced watch</small></div><div><span>Acknowledged</span><strong>{alertsData.filter((alert) => acknowledged[alert.id]).length}</strong><small>Firebase state</small></div></div>
      <div className="module-toolbar"><div className="segmented">{['All', 'Critical', 'High', 'Moderate'].map((item) => <button key={item} className={level === item ? 'active' : ''} onClick={() => setLevel(item)}>{item}</button>)}</div><span>{filteredAlerts.length} incidents shown</span></div>
      <div className="alerts-page-grid">{filteredAlerts.map((alert) => <AlertItem key={alert.id} alert={alert} state={acknowledged[alert.id]} onAcknowledge={onAcknowledge} onLocate={onLocate} nodes={nodes} />)}</div>
    </section>
  );
}

function SensorsPage({ onLocate, nodes }) {
  const [query, setQuery] = useState('');
  const visibleNodes = useMemo(() => nodes.filter((node) => `${node.id} ${node.name} ${node.area} ${node.hazard}`.toLowerCase().includes(query.toLowerCase())), [nodes, query]);
  return (
    <section className="module-page">
      <ModuleHeader eyebrow="FIELD INFRASTRUCTURE" title="Sensor Grid" description="Live registry of Delhi environmental sensing and edge-intelligence nodes." action={<button className="module-button" onClick={() => setQuery('')}><Radio size={13} />Refresh registry</button>} />
      <div className="module-metrics"><div><span>Total nodes</span><strong>{String(nodes.length).padStart(2, '0')}</strong><small>Firebase registry</small></div><div><span>Network health</span><strong className="green-text">{nodes.length ? '100%' : '—'}</strong><small>{nodes.length ? 'All reporting' : 'No devices deployed'}</small></div><div><span>High risk</span><strong className="orange-text">{String(nodes.filter((node) => ['high', 'critical'].includes(node.status)).length).padStart(2, '0')}</strong><small>Priority watch</small></div><div><span>Median latency</span><strong>{nodes.length ? '31s' : '—'}</strong><small>Last heartbeat</small></div></div>
      <div className="module-toolbar"><label className="search-box"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search node, district or hazard" /></label><span>{visibleNodes.length} of {nodes.length} nodes</span></div>
      <div className="sensor-table">
        <div className="sensor-row sensor-head"><span>Node</span><span>District</span><span>Hazard</span><span>Status</span><span>Latest signal</span><span>Risk</span><span>Action</span></div>
        {visibleNodes.map((node) => <div className="sensor-row" key={node.id}><span><b>{node.id}</b><small>{node.name}</small></span><span>{node.area}</span><span>{node.hazard}</span><span><i className={`severity-dot ${node.status}`} />{node.status}</span><span><b>{Object.values(node.readings)[0]}</b><small>{Object.keys(node.readings)[0]}</small></span><span><strong className={`${node.status}-text`}>{node.risk}%</strong></span><span><button onClick={() => onLocate(node.id)}>Locate <ArrowUpRight size={12} /></button></span></div>)}
      </div>
    </section>
  );
}

function AnalyticsPage({ analyticsData }) {
  const [range, setRange] = useState('24H');
  const riskTrend = analyticsData.riskTrend || fallbackAnalytics.riskTrend;
  const districts = analyticsData.districts || fallbackAnalytics.districts;
  const hazardDistribution = analyticsData.hazards || fallbackAnalytics.hazards;
  return (
    <section className="module-page">
      <ModuleHeader eyebrow="DECISION INTELLIGENCE" title="Analytics" description="Cross-hazard patterns, response performance and district-level risk for Delhi." action={<div className="segmented">{['6H', '24H', '7D'].map((item) => <button key={item} className={range === item ? 'active' : ''} onClick={() => setRange(item)}>{item}</button>)}</div>} />
      <div className="module-metrics"><div><span>Peak risk</span><strong className="red-text">91%</strong><small>Wazirabad · 14:20</small></div><div><span>Mean response</span><strong>08m</strong><small>−18% vs prior period</small></div><div><span>Signals processed</span><strong>18.4k</strong><small>87% at the edge</small></div><div><span>Prediction accuracy</span><strong className="green-text">93%</strong><small>Validated events</small></div></div>
      <div className="analytics-layout">
        <section className="analytics-panel"><header><div><span>COMPOSITE RISK TREND</span><b>Delhi · {range}</b></div><em>Peak 91%</em></header><div className="bar-chart" aria-label="Composite risk trend">{riskTrend.map((value, index) => <div key={index}><i style={{height:`${value}%`}} className={value >= 80 ? 'critical-bar' : value >= 60 ? 'high-bar' : ''}/><span>{index % 2 === 0 ? `${index * 2}:00` : ''}</span></div>)}</div></section>
        <section className="analytics-panel district-risk"><header><div><span>DISTRICT RISK RANKING</span><b>Highest current score</b></div></header>{districts.map(([name, value]) => <div className="risk-row" key={name}><span>{name}</span><i><b style={{width:`${value}%`}} /></i><strong>{value}%</strong></div>)}</section>
        <section className="analytics-panel hazard-volume"><header><div><span>EVENT DISTRIBUTION</span><b>By hazard type</b></div></header>{hazardDistribution.map(([name, value, color]) => <div key={name}><span>{name}</span><i><b className={color} style={{width:`${value}%`}} /></i><strong>{value}%</strong></div>)}</section>
      </div>
    </section>
  );
}

function ReportsPage({ reportsData, onGenerateReport, alertsData, nodes }) {
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const generateReport = async () => {
    if (generated || generating) return;
    setGenerating(true);
    try { await onGenerateReport(); setGenerated(true); } finally { setGenerating(false); }
  };
  const downloadReport = (report) => {
    const payload = JSON.stringify({ report, generatedBy: 'KAVACH Delhi Command Centre', incidents: alertsData, nodes }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${report.id.toLowerCase()}.json`; anchor.click(); URL.revokeObjectURL(url);
  };
  return (
    <section className="module-page">
      <ModuleHeader eyebrow="SITUATIONAL REPORTING" title="Reports" description="Command-ready intelligence briefs generated from Delhi field signals and incidents." action={<button className="module-button primary" onClick={generateReport}><FileText size={13} />{generated ? 'Brief generated' : generating ? 'Saving…' : 'Generate brief'}</button>} />
      <div className="report-callout"><div><span>AUTOMATED COMMAND BRIEF</span><h2>Next scheduled report · 18:00 IST</h2><p>Includes district risk, alert actions, Yamuna telemetry and network health.</p></div><strong>03h 28m</strong></div>
      <div className="report-table"><div className="report-row report-head"><span>Report</span><span>Scope</span><span>Generated</span><span>Format</span><span>Action</span></div>{reportsData.map((report) => <div className="report-row" key={report.id}><span><i><FileText size={15} /></i><b>{report.title}</b><small>{report.id}</small></span><span>{report.scope}</span><span>{report.created}</span><span>{report.format}</span><span><button onClick={() => downloadReport(report)}><Download size={13} />Download</button></span></div>)}</div>
    </section>
  );
}

function DeviceAdminModal({ stage, setStage, initialMode, onSaveDevice, onDeleteDevice, nodes }) {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [device, setDevice] = useState(createBlankDevice);
  const [selectedRegistryId, setSelectedRegistryId] = useState(null);
  const [deleteArmed, setDeleteArmed] = useState(null);
  const [registryQuery, setRegistryQuery] = useState('');
  const selectedRegistryNode = nodes.find((node) => node.id === selectedRegistryId) || null;
  const registryNodes = useMemo(() => nodes.filter((node) => `${node.id} ${node.name} ${node.area} ${node.nodeType || ''}`.toLowerCase().includes(registryQuery.toLowerCase())), [nodes, registryQuery]);
  const gateways = nodes.filter((node) => node.nodeType === 'Gateway');
  const autoIdentity = generateDeviceIdentity(device, nodes);

  useEffect(() => {
    if (stage === 'manage' && !selectedRegistryNode && nodes.length) setSelectedRegistryId(nodes[0].id);
  }, [nodes, selectedRegistryNode, stage]);

  if (!stage) return null;
  const close = () => { setStage(null); setPin(''); setPinError(''); setFormError(''); setDeleteArmed(null); };
  const startAdd = () => { setEditingId(null); setDevice(createBlankDevice()); setFormError(''); setStage('form'); };
  const showDevices = () => { setEditingId(null); setDevice(createBlankDevice()); setFormError(''); setDeleteArmed(null); setStage('manage'); };
  const verifyPin = (event) => {
    event.preventDefault();
    if (pin === '0') { setPinError(''); setStage(initialMode || 'form'); }
    else setPinError('Incorrect admin PIN');
  };
  const update = (key, value) => setDevice((current) => ({ ...current, [key]: value }));
  const updateHazard = (hazard) => setDevice((current) => ({ ...current, hazard, sensors: hazardSensorPresets[hazard] || current.sensors }));
  const toggleSensor = (sensor) => setDevice((current) => ({ ...current, sensors: current.sensors.includes(sensor) ? current.sensors.filter((item) => item !== sensor) : [...current.sensors, sensor] }));
  const setCoordinates = (latitude, longitude) => {
    const nearest = nearestDelhiArea(latitude, longitude);
    setDevice((current) => ({ ...current, latitude: String(latitude), longitude: String(longitude), area: nearest.label, district: nearest.district, locality: nearest.locality }));
  };
  const syncAreaFromCoordinates = () => {
    if (device.latitude === '' || device.longitude === '') return;
    const latitude = Number(device.latitude); const longitude = Number(device.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    const nearest = nearestDelhiArea(latitude, longitude);
    setDevice((current) => ({ ...current, area: nearest.label, district: nearest.district, locality: nearest.locality }));
  };
  const editDevice = (node) => {
    setEditingId(node.id);
    const nearest = nearestDelhiArea(Number(node.lat), Number(node.lng));
    setDevice({ id: node.id, name: node.name, area: node.area || nearest.label, district: node.district || nearest.district, locality: node.locality || nearest.locality, zone: nodeZone(node), nodeType: node.nodeType || 'Sensor Node', gatewayId: node.gatewayId || '', hazard: node.hazard || 'Weather', status: node.status || 'safe', risk: String(node.risk ?? 20), latitude: String(node.lat), longitude: String(node.lng), sensors: nodeSensors(node) });
    setFormError(''); setDeleteArmed(null);
  };
  const submitDevice = async (event) => {
    event.preventDefault();
    const lat = Number(device.latitude); const lng = Number(device.longitude);
    if (!device.area.trim()) return setFormError('Pick a map point so the nearest area and district can be identified.');
    if (device.nodeType !== 'Gateway' && !device.sensors.length) return setFormError('Select at least one installed sensor.');
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return setFormError('Choose a map point or enter valid coordinates.');
    if (lat < 28.404629 || lat > 28.883446 || lng < 76.838835 || lng > 77.345338) return setFormError('Location must be inside Delhi NCT.');
    setSaving(true); setFormError('');
    const previous = editingId ? nodes.find((node) => node.id === editingId) : null;
    const readings = device.nodeType === 'Gateway'
      ? { Connectivity: previous?.readings?.Connectivity || 'Online', 'Linked nodes': previous?.readings?.['Linked nodes'] || '0' }
      : Object.fromEntries(device.sensors.map((sensor) => {
          const key = firebaseReadingKey(sensor);
          return [key, previous?.readings?.[key] || previous?.readings?.[sensor] || 'Awaiting data'];
        }));
    const payload = {
      id: device.id.trim().toUpperCase() || autoIdentity.id, name: device.name.trim() || autoIdentity.name, area: device.area.trim(), district: device.district, locality: device.locality, zone: device.zone, nodeType: device.nodeType, gatewayId: device.nodeType === 'Gateway' ? '' : device.gatewayId,
      hazard: device.hazard, status: device.status, lat, lng, risk: Math.max(0, Math.min(100, Number(device.risk) || 0)), updated: 'Just now',
      sensors: device.sensors, warningProfiles: buildWarningProfiles(device.sensors), readings,
    };
    try {
      await onSaveDevice(payload, editingId);
      setSelectedRegistryId(payload.id); setEditingId(null); setDevice(createBlankDevice()); setStage('manage');
    } catch (error) { setFormError(error.message || 'Could not save device.'); }
    finally { setSaving(false); }
  };
  const confirmDelete = async () => {
    if (!selectedRegistryNode) return;
    setSaving(true);
    try { await onDeleteDevice(selectedRegistryNode.id); setDeleteArmed(null); setSelectedRegistryId(null); }
    catch (error) { setFormError(error.message || 'Could not delete device.'); }
    finally { setSaving(false); }
  };

  const renderAdminTabs = () => <nav className="device-admin-tabs" aria-label="Device admin views"><button type="button" className={stage === 'form' ? 'active' : ''} onClick={startAdd}><Plus size={13} />Add device</button><button type="button" className={stage === 'manage' ? 'active' : ''} onClick={showDevices}><Eye size={13} />Show devices</button></nav>;
  const renderDeviceEditorPanel = (compact = false) => (
    <section className={`device-editor-panel ${compact ? 'compact' : ''}`}>
      {compact && <header><div><span>EDITING DEVICE</span><h3>{device.id} · {device.name}</h3></div><button type="button" onClick={() => { setEditingId(null); setFormError(''); }}><X size={14} />Cancel edit</button></header>}
      {!editingId && <div className="auto-identity-preview"><i><Cpu size={16} /></i><div><span>AUTO ID</span><b>{device.id.trim().toUpperCase() || autoIdentity.id}</b></div><div><span>AUTO DEVICE NAME</span><b>{device.name.trim() || autoIdentity.name}</b></div><small>{device.area || 'Pick a map point to identify the nearest Delhi locality'}</small></div>}
      <div className="device-fields">
        <label>ZONE<select value={device.zone} onChange={(event) => update('zone', event.target.value)}>{delhiZones.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>DEVICE ID · OPTIONAL<input value={device.id} readOnly={Boolean(editingId)} onChange={(event) => update('id', event.target.value)} placeholder={`Auto · ${autoIdentity.id}`} /></label>
        <label>DEVICE NAME · OPTIONAL<input value={device.name} onChange={(event) => update('name', event.target.value)} placeholder={`Auto · ${autoIdentity.name}`} /></label>
        <label>DISTRICT / AREA<input value={device.area} onChange={(event) => update('area', event.target.value)} placeholder="Auto-filled from map" /></label>
        <label>NODE TYPE<select value={device.nodeType} onChange={(event) => update('nodeType', event.target.value)}><option>Sensor Node</option><option>Gateway</option><option>Multi-Hazard Node</option><option>Reference Node</option></select></label>
        <label>GATEWAY<select value={device.gatewayId} disabled={device.nodeType === 'Gateway'} onChange={(event) => update('gatewayId', event.target.value)}><option value="">Direct / unassigned</option>{gateways.map((gateway) => <option key={gateway.id} value={gateway.id}>{gateway.id} · {gateway.name}</option>)}</select></label>
        <label>HAZARD PROFILE<select value={device.hazard} onChange={(event) => updateHazard(event.target.value)}>{Object.keys(hazardSensorPresets).map((hazard) => <option key={hazard}>{hazard}</option>)}</select></label>
        <label>INITIAL STATUS<select value={device.status} onChange={(event) => update('status', event.target.value)}><option value="safe">Normal</option><option value="moderate">Moderate</option><option value="high">High</option><option value="critical">Critical</option></select></label>
        <label>RISK SCORE<input type="number" min="0" max="100" value={device.risk} onChange={(event) => update('risk', event.target.value)} /></label>
        <label>LATITUDE<input type="number" step="0.000001" value={device.latitude} onChange={(event) => update('latitude', event.target.value)} onBlur={syncAreaFromCoordinates} placeholder="28.613900" /></label>
        <label>LONGITUDE<input type="number" step="0.000001" value={device.longitude} onChange={(event) => update('longitude', event.target.value)} onBlur={syncAreaFromCoordinates} placeholder="77.209000" /></label>
      </div>
      <section className="sensor-selector"><header><div><span>INSTALLED SENSORS</span><b>{device.sensors.length} selected</b></div><button type="button" onClick={() => update('sensors', hazardSensorPresets[device.hazard] || [])}>Use hazard preset</button></header><div>{sensorOptions.map((sensor) => { const selected = device.sensors.includes(sensor); return <button type="button" key={sensor} className={selected ? 'selected' : ''} aria-pressed={selected} onClick={() => toggleSensor(sensor)}><Check size={11} className={selected ? '' : 'sensor-check-hidden'} />{sensor}</button>; })}</div></section>
      {formError && <div className="device-form-error"><AlertTriangle size={14} />{formError}</div>}
      {compact && <footer><button type="button" onClick={() => { setEditingId(null); setFormError(''); }}>Cancel</button><button type="submit" className="admin-primary" disabled={saving}><Save size={14} />{saving ? 'Saving…' : 'Save changes'}</button></footer>}
    </section>
  );

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-label={stage === 'pin' ? 'Admin PIN' : 'Device administration'}>
      {stage === 'pin' ? <form className="pin-card" onSubmit={verifyPin}><button type="button" className="modal-close" onClick={close}><X size={16} /></button><i><LockKeyhole size={22} /></i><span>ADMIN PANEL</span><h2>Enter security PIN</h2><p>Device registration and deletion are restricted to authorised command-centre staff.</p><label>ADMIN PIN<input autoFocus type="password" inputMode="numeric" value={pin} onChange={(event) => setPin(event.target.value)} placeholder="Enter PIN" /></label>{pinError && <em>{pinError}</em>}<button className="admin-primary" type="submit">Continue <ChevronRight size={14} /></button></form>
      : stage === 'form' ? <form className="device-card form-card" onSubmit={submitDevice}>
        <header><div><span>ADMIN PANEL · FIREBASE</span><h2>Add field device</h2><p>Pick the location on the left; complete device setup on the right.</p></div>{renderAdminTabs()}<button type="button" className="device-card-close" onClick={close}><X size={17} /></button></header>
        <div className="device-side-layout"><DeviceLocationPicker latitude={device.latitude === '' ? NaN : Number(device.latitude)} longitude={device.longitude === '' ? NaN : Number(device.longitude)} onChange={setCoordinates} />{renderDeviceEditorPanel()}</div>
        <footer><span><Server size={13} />Firebase <code>{`/devices/${device.id.trim().toUpperCase() || autoIdentity.id}`}</code></span><button type="button" onClick={showDevices}>Cancel</button><button type="submit" className="admin-primary" disabled={saving}><Save size={14} />{saving ? 'Saving…' : 'Add device'}</button></footer>
      </form>
      : <section className="device-card registry-card">
        <header><div><span>ADMIN PANEL · FIREBASE</span><h2>{editingId ? `Editing ${editingId}` : 'Deployed device registry'}</h2><p>{editingId ? 'Update details on the right and move its location from the map.' : 'Select a map marker or list item to manage a device.'}</p></div>{renderAdminTabs()}<button type="button" className="device-card-close" onClick={close}><X size={17} /></button></header>
        <div className="device-manager-body">
          {editingId ? <DeviceLocationPicker latitude={Number(device.latitude)} longitude={Number(device.longitude)} onChange={setCoordinates} /> : <DeviceRegistryMap nodes={nodes} selectedNode={selectedRegistryNode} onSelect={(node) => { setSelectedRegistryId(node.id); setDeleteArmed(null); }} />}
          {editingId ? <form className="registry-inline-form" onSubmit={submitDevice}>{renderDeviceEditorPanel(true)}</form> : <aside className="device-manager-panel"><label><Search size={13} /><input value={registryQuery} onChange={(event) => setRegistryQuery(event.target.value)} placeholder="Search device" /></label><div className="registry-list">{registryNodes.map((node) => <button key={node.id} className={selectedRegistryId === node.id ? 'selected' : ''} onClick={() => { setSelectedRegistryId(node.id); setDeleteArmed(null); }}><i className={`severity-dot ${node.status}`} /><span><b>{node.id} · {node.nodeType || 'Sensor Node'}</b><small>{node.name}</small></span><em>{node.risk}%</em></button>)}</div>{selectedRegistryNode && <article className="registry-selection"><span>SELECTED DEVICE</span><h3>{selectedRegistryNode.name}</h3><p>{selectedRegistryNode.id} · {selectedRegistryNode.area}</p><div><b><Cpu size={12} />{selectedRegistryNode.nodeType || 'Sensor Node'}</b><b><RadioTower size={12} />{selectedRegistryNode.gatewayId || 'Direct'}</b></div><small>{nodeSensors(selectedRegistryNode).join(' · ') || 'No sensors assigned'}</small>{deleteArmed === selectedRegistryNode.id ? <div className="delete-confirm"><p>Delete {selectedRegistryNode.id} permanently?</p><button onClick={() => setDeleteArmed(null)}>Keep</button><button className="danger" onClick={confirmDelete} disabled={saving}>{saving ? 'Deleting…' : 'Delete'}</button></div> : <footer><button onClick={() => editDevice(selectedRegistryNode)}><Pencil size={13} />Edit below</button><button className="danger" onClick={() => setDeleteArmed(selectedRegistryNode.id)}><Trash2 size={13} />Delete</button></footer>}</article>}</aside>}
        </div>
        <footer><span><Server size={13} />{nodes.length} devices live in Firebase</span><button type="button" onClick={close}>Close</button><button type="button" className="admin-primary" onClick={startAdd}><Plus size={14} />Add device</button></footer>
      </section>}
    </div>
  );
}

function SettingsPage({ theme, setTheme, settingsData, onUpdateSetting, seasonMode, onUpdateSeason, onSaveDevice, onDeleteDevice, nodes, firebaseStatus }) {
  const [adminStage, setAdminStage] = useState(null);
  const [adminInitialMode, setAdminInitialMode] = useState('form');
  const openAdmin = (mode) => { setAdminInitialMode(mode); setAdminStage('pin'); };
  const items = [
    ['escalation', 'Critical risk escalation', 'Notify the district EOC automatically above 85% risk.'],
    ['offline', 'Offline node warning', 'Create an alert after three missed sensor heartbeats.'],
    ['community', 'Community broadcasts', 'Allow public alerts after command approval.'],
    ['edge', 'Edge-first processing', 'Transmit important events instead of continuous raw data.'],
  ];
  return (
    <section className="module-page">
      <ModuleHeader eyebrow="SYSTEM CONFIGURATION" title="Settings" description="Display preferences and Delhi command-centre operating rules." />
      <div className="settings-layout">
        <section className="settings-section"><header><span>APPEARANCE</span><h2>Interface theme</h2></header><div className="theme-choice"><button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}><Sun size={18} /><span>Light mode</span><small>Bright operational workspace</small></button><button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}><Moon size={18} /><span>Dark mode</span><small>Low-light command room</small></button></div></section>
        <section className="settings-section"><header><span>AUTOMATION · FIREBASE</span><h2>Rules & alerts</h2></header>{items.map(([key, title, detail]) => <button className="setting-toggle" key={key} onClick={() => onUpdateSetting(key, !settingsData[key])}><span><b>{title}</b><small>{detail}</small></span>{settingsData[key] ? <ToggleRight size={25} className="toggle-on" /> : <ToggleLeft size={25} />}</button>)}</section>
        <section className="settings-section season-panel"><header><span>EDGE SIMULATION · FIREBASE LIVE</span><h2>Operational season</h2></header><div className="season-control">{[
          ['auto', 'Auto', 'Calendar month'], ['summer', 'Summer', 'Heat + fire'], ['monsoon', 'Monsoon', 'Flood + waterlogging'], ['winter', 'Winter', 'Pollution + smog'], ['diwali', 'Diwali', 'Peak pollution'],
        ].map(([value, label, detail]) => <button key={value} className={seasonMode === value ? 'active' : ''} onClick={() => onUpdateSeason(value)}><i>{value === 'summer' ? <Flame size={16} /> : value === 'monsoon' ? <CloudRain size={16} /> : value === 'winter' || value === 'diwali' ? <Wind size={16} /> : <Activity size={16} />}</i><span><b>{label}</b><small>{detail}</small></span>{seasonMode === value && <Check size={14} />}</button>)}</div><footer><i />Firebase path <code>/simulation/season/current</code><b>{seasonMode.toUpperCase()}</b></footer></section>
        <section className="settings-section admin-panel"><header><span>ADMIN PANEL</span><h2>Device management</h2></header><div><i><Server size={21} /></i><span><b>Firebase device registry</b><small>{nodes.length} devices · Database {firebaseStatus}</small></span><div className="admin-actions"><button onClick={() => openAdmin('manage')}><Eye size={14} />Show devices</button><button className="primary" onClick={() => openAdmin('form')}><Plus size={14} />Add device</button></div></div></section>
        <section className="settings-section thresholds"><header><span>AI RISK LEVELS</span><h2>Severity thresholds</h2></header>{[['Normal', '0–34%', 'safe'], ['Moderate', '35–59%', 'moderate'], ['High', '60–84%', 'high'], ['Critical', '85–100%', 'critical']].map(([label, value, level]) => <div key={label}><span><i className={`severity-dot ${level}`} />{label}</span><strong>{value}</strong></div>)}</section>
      </div>
      <DeviceAdminModal stage={adminStage} setStage={setAdminStage} initialMode={adminInitialMode} onSaveDevice={onSaveDevice} onDeleteDevice={onDeleteDevice} nodes={nodes} />
    </section>
  );
}

export default function Home() {
  const [filter, setFilter] = useState('All');
  const [selectedNode, setSelectedNode] = useState(null);
  const [acknowledged, setAcknowledged] = useState({});
  const [activeView, setActiveView] = useState('Command Centre');
  const [theme, setTheme] = useState('dark');
  const [nodes, setNodes] = useState(demoNodes);
  const [alertsData, setAlertsData] = useState(() => mergeAlertsWithDataQuality(alerts, demoNodes));
  const [analyticsData, setAnalyticsData] = useState(fallbackAnalytics);
  const [reportsData, setReportsData] = useState(fallbackReports);
  const [settingsData, setSettingsData] = useState(fallbackSettings);
  const [seasonMode, setSeasonMode] = useState('auto');
  const [zones, setZones] = useState(fallbackZones);
  const [firebaseStatus, setFirebaseStatus] = useState('demo');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('kavach-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
  }, []);

  useEffect(() => { window.localStorage.setItem('kavach-theme', theme); }, [theme]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const data = await firebaseRequest('');
        if (!mounted) return;
        if (!data) { setNodes(demoNodes); setAlertsData(mergeAlertsWithDataQuality(alerts, demoNodes)); setAcknowledged({}); setFirebaseStatus('demo'); return; }
        const firebaseNodes = toCollection(data.devices, []);
        const nextNodes = firebaseNodes.length ? firebaseNodes : demoNodes;
        const firebaseAlerts = toAlertCollection(data.alerts, []);
        const nextAlerts = mergeAlertsWithDataQuality(firebaseAlerts.length ? firebaseAlerts : (firebaseNodes.length ? [] : alerts), nextNodes);
        setNodes(nextNodes);
        setAlertsData(nextAlerts);
        setAnalyticsData(data.analytics || fallbackAnalytics);
        setReportsData(toCollection(data.reports, fallbackReports).sort((a, b) => String(b.id).localeCompare(String(a.id))));
        setSettingsData({ ...fallbackSettings, ...(data.settings || {}) });
        setSeasonMode(data.simulation?.season?.current || 'auto');
        setZones(toCollection(data.zones, fallbackZones));
        setAcknowledged(Object.fromEntries(nextAlerts.filter((alert) => alert.acknowledged).map((alert) => [alert.id, true])));
        setFirebaseStatus('connected');
      } catch {
        if (!mounted) return;
        setNodes(demoNodes);
        setAlertsData(mergeAlertsWithDataQuality(alerts, demoNodes));
        setAcknowledged({});
        setFirebaseStatus('demo');
      }
    };
    loadData();
    const timer = window.setInterval(loadData, 10000);
    return () => { mounted = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    if (typeof window.EventSource === 'undefined') return undefined;
    let alertSnapshot = null;
    const stream = new window.EventSource(`${FIREBASE_URL}/alerts.json`);
    const receiveUpdate = (eventType) => (event) => {
      try {
        const message = JSON.parse(event.data);
        alertSnapshot = applyFirebaseStreamUpdate(alertSnapshot, message.path || '/', message.data, eventType);
        const nextAlerts = mergeAlertsWithDataQuality(toAlertCollection(alertSnapshot, []), nodes);
        setAlertsData(nextAlerts);
        setAcknowledged(Object.fromEntries(nextAlerts.filter((alert) => alert.acknowledged).map((alert) => [alert.id, true])));
        setFirebaseStatus('connected');
      } catch { setFirebaseStatus('error'); }
    };
    stream.addEventListener('put', receiveUpdate('put'));
    stream.addEventListener('patch', receiveUpdate('patch'));
    stream.onopen = () => setFirebaseStatus('connected');
    stream.onerror = () => setFirebaseStatus((current) => current === 'connected' ? 'connecting' : 'demo');
    return () => stream.close();
  }, []);

  useEffect(() => {
    const expiryTimer = window.setInterval(() => setAlertsData((current) => current.filter((alert) => !alert.expiresAt || alert.expiresAt > Date.now())), 5000);
    return () => window.clearInterval(expiryTimer);
  }, []);

  const locateNode = (nodeId) => {
    const node = nodes.find((item) => item.id === nodeId);
    if (node) setSelectedNode(node);
  };
  const locateNodeAndOpenMap = (nodeId) => { locateNode(nodeId); setActiveView('Live Map'); };
  const onAcknowledge = async (id) => {
    const nextValue = !acknowledged[id];
    const firebaseKey = alertsData.find((alert) => alert.id === id)?.firebaseKey || id;
    setAcknowledged((current) => ({ ...current, [id]: nextValue }));
    setAlertsData((current) => current.map((alert) => alert.id === id ? { ...alert, acknowledged: nextValue } : alert));
    if (firebaseStatus !== 'connected') return;
    try { await firebaseRequest(`alerts/${encodeURIComponent(firebaseKey)}/acknowledged`, { method: 'PUT', body: JSON.stringify(nextValue) }); }
    catch { setFirebaseStatus('error'); }
  };
  const saveDevice = async (device, editingId = null) => {
    if (!editingId && nodes.some((node) => node.id === device.id)) throw new Error('A device with this ID already exists.');
    const key = device.id.replace(/[.#$\[\]\/]/g, '-');
    await firebaseRequest(`devices/${encodeURIComponent(key)}`, { method: 'PUT', body: JSON.stringify(device) });
    setNodes((current) => editingId ? current.map((node) => node.id === editingId ? device : node) : [...current, device]);
    setFirebaseStatus('connected');
  };
  const deleteDevice = async (deviceId) => {
    const key = deviceId.replace(/[.#$\[\]\/]/g, '-');
    await firebaseRequest(`devices/${encodeURIComponent(key)}`, { method: 'DELETE' });
    setNodes((current) => current.filter((node) => node.id !== deviceId));
    setSelectedNode((current) => current?.id === deviceId ? null : current);
    setFirebaseStatus('connected');
  };
  const updateSetting = async (key, value) => {
    setSettingsData((current) => ({ ...current, [key]: value }));
    try { await firebaseRequest(`settings/${encodeURIComponent(key)}`, { method: 'PUT', body: JSON.stringify(value) }); setFirebaseStatus('connected'); }
    catch { setFirebaseStatus('error'); }
  };
  const updateSeason = async (season) => {
    setSeasonMode(season);
    try {
      await firebaseRequest('simulation/season', { method: 'PUT', body: JSON.stringify({ current: season, updatedAt: Date.now(), updatedBy: 'KAVACH dashboard' }) });
      setFirebaseStatus('connected');
    } catch { setFirebaseStatus('error'); }
  };
  const generateReport = async () => {
    const report = { id: `RPT-${Date.now().toString().slice(-6)}`, title: 'On-demand Command Brief', scope: 'Delhi NCT', created: 'Just now', format: 'JSON' };
    await firebaseRequest(`reports/${report.id}`, { method: 'PUT', body: JSON.stringify(report) });
    setReportsData((current) => [report, ...current]);
    setFirebaseStatus('connected');
  };

  const renderModule = () => {
    if (activeView === 'Alerts') return <AlertsPage acknowledged={acknowledged} onAcknowledge={onAcknowledge} onLocate={locateNodeAndOpenMap} alertsData={alertsData} nodes={nodes} />;
    if (activeView === 'Sensor Grid') return <SensorsPage onLocate={locateNodeAndOpenMap} nodes={nodes} />;
    if (activeView === 'Analytics') return <AnalyticsPage analyticsData={analyticsData} />;
    if (activeView === 'Reports') return <ReportsPage reportsData={reportsData} onGenerateReport={generateReport} alertsData={alertsData} nodes={nodes} />;
    return <SettingsPage theme={theme} setTheme={setTheme} settingsData={settingsData} onUpdateSetting={updateSetting} seasonMode={seasonMode} onUpdateSeason={updateSeason} onSaveDevice={saveDevice} onDeleteDevice={deleteDevice} nodes={nodes} firebaseStatus={firebaseStatus} />;
  };

  return (
    <main className={`command-shell theme-${theme}`}>
      <NavigationRail activeView={activeView} setActiveView={setActiveView} theme={theme} setTheme={setTheme} firebaseStatus={firebaseStatus} alertCount={alertsData.length} />
      {activeView === 'Command Centre' && <><MapCanvas title="Command Centre" filter={filter} setFilter={setFilter} selectedNode={selectedNode} setSelectedNode={setSelectedNode} nodes={nodes} zones={zones} alertsData={alertsData} firebaseStatus={firebaseStatus} /><AlertRail states={acknowledged} onAcknowledge={onAcknowledge} onLocate={locateNode} alertsData={alertsData} nodes={nodes} firebaseStatus={firebaseStatus} /></>}
      {activeView === 'Live Map' && <><MapCanvas title="Live Map" filter={filter} setFilter={setFilter} selectedNode={selectedNode} setSelectedNode={setSelectedNode} nodes={nodes} zones={zones} alertsData={alertsData} firebaseStatus={firebaseStatus} /><NodeRail selectedNode={selectedNode} onSelect={setSelectedNode} nodes={nodes} /></>}
      {!['Command Centre', 'Live Map'].includes(activeView) && renderModule()}
    </main>
  );
}
