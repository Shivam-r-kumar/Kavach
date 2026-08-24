'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BellRing,
  Building2,
  Check,
  ChevronRight,
  CloudRain,
  Crosshair,
  FileText,
  Gauge,
  Map as MapIcon,
  Radio,
  Settings,
  ShieldCheck,
  ThermometerSun,
  Waves,
  Wind,
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

const navItems = [
  { label: 'Command Centre', icon: Activity, active: true },
  { label: 'Live Map', icon: MapIcon },
  { label: 'Alerts', icon: BellRing, badge: 6 },
  { label: 'Sensor Grid', icon: Radio },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Reports', icon: FileText },
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

const hazardIcons = { Flood: Waves, 'Air Quality': Wind, Heat: ThermometerSun, Weather: CloudRain };

function NavigationRail() {
  return (
    <aside className="nav-rail" aria-label="Primary navigation">
      <div className="nav-brand" aria-label="KAVACH Delhi"><ShieldCheck size={22} /><span>KV</span></div>
      <nav>
        {navItems.map(({ label, icon: Icon, active, badge }) => (
          <button key={label} className={`rail-link ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined} aria-label={label} title={label}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{badge && <b>{badge}</b>}
          </button>
        ))}
      </nav>
      <div className="rail-bottom">
        <button className="rail-link" aria-label="Settings" title="Settings"><Settings size={18} /></button>
        <div className="network-beacon" title="Delhi sensor network online"><i />DL</div>
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
      <div className="node-risk"><Icon size={16} /><span>{node.hazard} risk</span><strong>{node.risk}%</strong><small>Updated {node.updated}</small></div>
    </aside>
  );
}

function AlertItem({ alert, state, onAcknowledge, onLocate }) {
  const node = delhiNodes.find((item) => item.id === alert.node);
  const Icon = hazardIcons[node?.hazard] || AlertTriangle;
  return (
    <article className={`incident ${alert.level} ${state ? 'acknowledged' : ''}`}>
      <div className="incident-topline"><span><i />{alert.level}</span><time>{alert.time} ago</time></div>
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

function AlertRail({ states, onAcknowledge, onLocate }) {
  return (
    <aside className="alert-rail" aria-label="Delhi active alerts">
      <header className="alert-rail-header">
        <div className="jurisdiction"><span>DELHI / NCT</span><b>Command Centre</b></div>
        <div className="feed-state"><i />Simulated feed</div>
      </header>
      <div className="alert-summary">
        <div><span>Active incidents</span><strong>06</strong></div>
        <div><span>Unacknowledged</span><strong>{alerts.length - Object.keys(states).filter((id) => states[id]).length}</strong></div>
        <div><span>Highest risk</span><strong className="critical-text">91%</strong></div>
      </div>
      <div className="queue-heading"><div><span>PRIORITY QUEUE</span><b>Newest first</b></div><button aria-label="Filter alerts">All <ChevronRight size={12} /></button></div>
      <div className="incident-feed">
        {alerts.map((alert) => <AlertItem key={alert.id} alert={alert} state={states[alert.id]} onAcknowledge={onAcknowledge} onLocate={onLocate} />)}
      </div>
    </aside>
  );
}

export default function Home() {
  const [filter, setFilter] = useState('All');
  const [selectedNode, setSelectedNode] = useState(null);
  const [acknowledged, setAcknowledged] = useState({});

  const locateNode = (nodeId) => {
    const node = delhiNodes.find((item) => item.id === nodeId);
    if (node) setSelectedNode(node);
  };

  return (
    <main className="command-shell">
      <NavigationRail />
      <section className="map-canvas" aria-label="Delhi command centre map">
        <HazardMap nodes={delhiNodes} filter={filter} selectedNode={selectedNode} onSelect={setSelectedNode} />
        <div className="map-identity"><div className="delhi-seal"><ShieldCheck size={18} /></div><div><span>KAVACH · DELHI</span><h1>Command Centre</h1></div></div>
        <div className="map-status"><span><i />08 nodes deployed</span><b>10 DISTRICTS</b><b>06 ACTIVE ALERTS</b><b>24 AUG · 14:32 IST</b></div>
        <div className="map-filters" role="group" aria-label="Filter map hazards">
          {['All', 'Flood', 'Air Quality', 'Heat'].map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}
        </div>
        <div className="map-legend" aria-label="Map severity legend"><span><i className="safe" />Normal</span><span><i className="moderate" />Moderate</span><span><i className="high" />High</span><span><i className="critical" />Critical</span></div>
        <SelectedNode node={selectedNode} onClose={() => setSelectedNode(null)} />
      </section>
      <AlertRail states={acknowledged} onAcknowledge={(id) => setAcknowledged((current) => ({ ...current, [id]: !current[id] }))} onLocate={locateNode} />
    </main>
  );
}
