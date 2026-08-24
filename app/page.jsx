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
  CloudRain,
  Crosshair,
  Download,
  FileText,
  Gauge,
  Map as MapIcon,
  Moon,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  ThermometerSun,
  ToggleLeft,
  ToggleRight,
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

function NavigationRail({ activeView, setActiveView, theme, setTheme }) {
  return (
    <aside className="nav-rail" aria-label="Primary navigation">
      <div className="nav-brand" aria-label="KAVACH Delhi"><ShieldCheck size={22} /><span>KV</span></div>
      <nav>
        {navItems.map(({ label, icon: Icon, badge }) => (
          <button key={label} onClick={() => setActiveView(label)} className={`rail-link ${activeView === label ? 'active' : ''}`} aria-current={activeView === label ? 'page' : undefined} aria-label={label} title={label}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{badge && <b>{badge}</b>}
          </button>
        ))}
      </nav>
      <div className="rail-bottom">
        <button className="theme-switch" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}<span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
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

function MapCanvas({ title, filter, setFilter, selectedNode, setSelectedNode }) {
  return (
    <section className="map-canvas" aria-label={`Delhi ${title} map`}>
      <HazardMap nodes={delhiNodes} filter={filter} selectedNode={selectedNode} onSelect={setSelectedNode} />
      <div className="map-identity"><div className="delhi-seal"><ShieldCheck size={18} /></div><div><span>KAVACH · DELHI</span><h1>{title}</h1></div></div>
      <div className="map-status"><span><i />08 nodes deployed</span><b>10 DISTRICTS</b><b>06 ACTIVE ALERTS</b><b>24 AUG · 14:32 IST</b></div>
      <div className="map-filters" role="group" aria-label="Filter map hazards">
        {['All', 'Flood', 'Air Quality', 'Heat'].map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}
      </div>
      <div className="map-legend" aria-label="Map severity legend"><span><i className="safe" />Normal</span><span><i className="moderate" />Moderate</span><span><i className="high" />High</span><span><i className="critical" />Critical</span></div>
      <SelectedNode node={selectedNode} onClose={() => setSelectedNode(null)} />
    </section>
  );
}

function NodeRail({ selectedNode, onSelect }) {
  return (
    <aside className="node-rail">
      <header><div><span>DELHI SENSOR GRID</span><b>Deployed nodes</b></div><em><i />08 online</em></header>
      <div className="node-rail-stats"><div><strong>08</strong><span>Reporting</span></div><div><strong>04</strong><span>Hazards</span></div><div><strong>31s</strong><span>Avg. sync</span></div></div>
      <div className="node-list-heading"><span>FIELD REGISTRY</span><b>Risk ranked</b></div>
      <div className="node-list">
        {delhiNodes.map((node) => {
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

function AlertsPage({ acknowledged, onAcknowledge, onLocate }) {
  const [level, setLevel] = useState('All');
  const filteredAlerts = level === 'All' ? alerts : alerts.filter((alert) => alert.level === level.toLowerCase());
  return (
    <section className="module-page">
      <ModuleHeader eyebrow="INCIDENT OPERATIONS · DELHI NCT" title="Active Alerts" description="AI-ranked events awaiting command-centre action across Delhi districts." action={<div className="module-live"><i />SIMULATED LIVE FEED</div>} />
      <div className="module-metrics"><div><span>Critical</span><strong className="red-text">01</strong><small>Immediate action</small></div><div><span>High</span><strong className="orange-text">02</strong><small>District response</small></div><div><span>Moderate</span><strong>02</strong><small>Enhanced watch</small></div><div><span>Acknowledged</span><strong>{Object.values(acknowledged).filter(Boolean).length}</strong><small>Current session</small></div></div>
      <div className="module-toolbar"><div className="segmented">{['All', 'Critical', 'High', 'Moderate'].map((item) => <button key={item} className={level === item ? 'active' : ''} onClick={() => setLevel(item)}>{item}</button>)}</div><span>{filteredAlerts.length} incidents shown</span></div>
      <div className="alerts-page-grid">{filteredAlerts.map((alert) => <AlertItem key={alert.id} alert={alert} state={acknowledged[alert.id]} onAcknowledge={onAcknowledge} onLocate={onLocate} />)}</div>
    </section>
  );
}

function SensorsPage({ onLocate }) {
  const [query, setQuery] = useState('');
  const visibleNodes = useMemo(() => delhiNodes.filter((node) => `${node.id} ${node.name} ${node.area} ${node.hazard}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <section className="module-page">
      <ModuleHeader eyebrow="FIELD INFRASTRUCTURE" title="Sensor Grid" description="Live registry of Delhi environmental sensing and edge-intelligence nodes." action={<button className="module-button" onClick={() => setQuery('')}><Radio size={13} />Refresh registry</button>} />
      <div className="module-metrics"><div><span>Total nodes</span><strong>08</strong><small>Across 7 districts</small></div><div><span>Network health</span><strong className="green-text">100%</strong><small>All reporting</small></div><div><span>High risk</span><strong className="orange-text">03</strong><small>Priority watch</small></div><div><span>Median latency</span><strong>31s</strong><small>Last heartbeat</small></div></div>
      <div className="module-toolbar"><label className="search-box"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search node, district or hazard" /></label><span>{visibleNodes.length} of {delhiNodes.length} nodes</span></div>
      <div className="sensor-table">
        <div className="sensor-row sensor-head"><span>Node</span><span>District</span><span>Hazard</span><span>Status</span><span>Latest signal</span><span>Risk</span><span>Action</span></div>
        {visibleNodes.map((node) => <div className="sensor-row" key={node.id}><span><b>{node.id}</b><small>{node.name}</small></span><span>{node.area}</span><span>{node.hazard}</span><span><i className={`severity-dot ${node.status}`} />{node.status}</span><span><b>{Object.values(node.readings)[0]}</b><small>{Object.keys(node.readings)[0]}</small></span><span><strong className={`${node.status}-text`}>{node.risk}%</strong></span><span><button onClick={() => onLocate(node.id)}>Locate <ArrowUpRight size={12} /></button></span></div>)}
      </div>
    </section>
  );
}

function AnalyticsPage() {
  const [range, setRange] = useState('24H');
  const riskTrend = [42, 51, 47, 62, 72, 91, 78, 69, 58, 63, 55, 49];
  const districts = [['North Delhi', 91], ['Central Delhi', 82], ['East Delhi', 78], ['South West', 59], ['North West', 54]];
  return (
    <section className="module-page">
      <ModuleHeader eyebrow="DECISION INTELLIGENCE" title="Analytics" description="Cross-hazard patterns, response performance and district-level risk for Delhi." action={<div className="segmented">{['6H', '24H', '7D'].map((item) => <button key={item} className={range === item ? 'active' : ''} onClick={() => setRange(item)}>{item}</button>)}</div>} />
      <div className="module-metrics"><div><span>Peak risk</span><strong className="red-text">91%</strong><small>Wazirabad · 14:20</small></div><div><span>Mean response</span><strong>08m</strong><small>−18% vs prior period</small></div><div><span>Signals processed</span><strong>18.4k</strong><small>87% at the edge</small></div><div><span>Prediction accuracy</span><strong className="green-text">93%</strong><small>Validated events</small></div></div>
      <div className="analytics-layout">
        <section className="analytics-panel"><header><div><span>COMPOSITE RISK TREND</span><b>Delhi · {range}</b></div><em>Peak 91%</em></header><div className="bar-chart" aria-label="Composite risk trend">{riskTrend.map((value, index) => <div key={index}><i style={{height:`${value}%`}} className={value >= 80 ? 'critical-bar' : value >= 60 ? 'high-bar' : ''}/><span>{index % 2 === 0 ? `${index * 2}:00` : ''}</span></div>)}</div></section>
        <section className="analytics-panel district-risk"><header><div><span>DISTRICT RISK RANKING</span><b>Highest current score</b></div></header>{districts.map(([name, value]) => <div className="risk-row" key={name}><span>{name}</span><i><b style={{width:`${value}%`}} /></i><strong>{value}%</strong></div>)}</section>
        <section className="analytics-panel hazard-volume"><header><div><span>EVENT DISTRIBUTION</span><b>By hazard type</b></div></header>{[['Flood / Water', 46, 'cyan'], ['Air quality', 27, 'purple'], ['Heat stress', 17, 'orange'], ['Severe weather', 10, 'slate']].map(([name, value, color]) => <div key={name}><span>{name}</span><i><b className={color} style={{width:`${value}%`}} /></i><strong>{value}%</strong></div>)}</section>
      </div>
    </section>
  );
}

function ReportsPage() {
  const baseReports = [
    { id: 'RPT-208', title: 'Delhi Daily Situation Report', scope: 'All districts', created: '24 Aug · 14:00', format: 'JSON' },
    { id: 'RPT-207', title: 'Yamuna Flood Intelligence Brief', scope: 'North Delhi', created: '24 Aug · 13:30', format: 'JSON' },
    { id: 'RPT-206', title: 'Air Quality Cluster Analysis', scope: 'East Delhi', created: '24 Aug · 12:45', format: 'JSON' },
    { id: 'RPT-205', title: 'Sensor Network Health Summary', scope: 'Delhi NCT', created: '24 Aug · 12:00', format: 'JSON' },
  ];
  const [reports, setReports] = useState(baseReports);
  const [generated, setGenerated] = useState(false);
  const generateReport = () => {
    if (!generated) setReports((current) => [{ id: 'RPT-209', title: 'On-demand Command Brief', scope: 'Delhi NCT', created: 'Just now', format: 'JSON' }, ...current]);
    setGenerated(true);
  };
  const downloadReport = (report) => {
    const payload = JSON.stringify({ report, generatedBy: 'KAVACH Delhi Command Centre', incidents: alerts, nodes: delhiNodes }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${report.id.toLowerCase()}.json`; anchor.click(); URL.revokeObjectURL(url);
  };
  return (
    <section className="module-page">
      <ModuleHeader eyebrow="SITUATIONAL REPORTING" title="Reports" description="Command-ready intelligence briefs generated from Delhi field signals and incidents." action={<button className="module-button primary" onClick={generateReport}><FileText size={13} />{generated ? 'Brief generated' : 'Generate brief'}</button>} />
      <div className="report-callout"><div><span>AUTOMATED COMMAND BRIEF</span><h2>Next scheduled report · 18:00 IST</h2><p>Includes district risk, alert actions, Yamuna telemetry and network health.</p></div><strong>03h 28m</strong></div>
      <div className="report-table"><div className="report-row report-head"><span>Report</span><span>Scope</span><span>Generated</span><span>Format</span><span>Action</span></div>{reports.map((report) => <div className="report-row" key={report.id}><span><i><FileText size={15} /></i><b>{report.title}</b><small>{report.id}</small></span><span>{report.scope}</span><span>{report.created}</span><span>{report.format}</span><span><button onClick={() => downloadReport(report)}><Download size={13} />Download</button></span></div>)}</div>
    </section>
  );
}

function SettingsPage({ theme, setTheme }) {
  const [rules, setRules] = useState({ escalation: true, offline: true, community: false, edge: true });
  const toggleRule = (key) => setRules((current) => ({ ...current, [key]: !current[key] }));
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
        <section className="settings-section"><header><span>AUTOMATION</span><h2>Rules & alerts</h2></header>{items.map(([key, title, detail]) => <button className="setting-toggle" key={key} onClick={() => toggleRule(key)}><span><b>{title}</b><small>{detail}</small></span>{rules[key] ? <ToggleRight size={25} className="toggle-on" /> : <ToggleLeft size={25} />}</button>)}</section>
        <section className="settings-section thresholds"><header><span>AI RISK LEVELS</span><h2>Severity thresholds</h2></header>{[['Normal', '0–34%', 'safe'], ['Moderate', '35–59%', 'moderate'], ['High', '60–84%', 'high'], ['Critical', '85–100%', 'critical']].map(([label, value, level]) => <div key={label}><span><i className={`severity-dot ${level}`} />{label}</span><strong>{value}</strong></div>)}</section>
      </div>
    </section>
  );
}

export default function Home() {
  const [filter, setFilter] = useState('All');
  const [selectedNode, setSelectedNode] = useState(null);
  const [acknowledged, setAcknowledged] = useState({});
  const [activeView, setActiveView] = useState('Command Centre');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('kavach-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
  }, []);

  useEffect(() => { window.localStorage.setItem('kavach-theme', theme); }, [theme]);

  const locateNode = (nodeId) => {
    const node = delhiNodes.find((item) => item.id === nodeId);
    if (node) setSelectedNode(node);
  };
  const locateNodeAndOpenMap = (nodeId) => { locateNode(nodeId); setActiveView('Live Map'); };
  const onAcknowledge = (id) => setAcknowledged((current) => ({ ...current, [id]: !current[id] }));

  const renderModule = () => {
    if (activeView === 'Alerts') return <AlertsPage acknowledged={acknowledged} onAcknowledge={onAcknowledge} onLocate={locateNodeAndOpenMap} />;
    if (activeView === 'Sensor Grid') return <SensorsPage onLocate={locateNodeAndOpenMap} />;
    if (activeView === 'Analytics') return <AnalyticsPage />;
    if (activeView === 'Reports') return <ReportsPage />;
    return <SettingsPage theme={theme} setTheme={setTheme} />;
  };

  return (
    <main className={`command-shell theme-${theme}`}>
      <NavigationRail activeView={activeView} setActiveView={setActiveView} theme={theme} setTheme={setTheme} />
      {activeView === 'Command Centre' && <><MapCanvas title="Command Centre" filter={filter} setFilter={setFilter} selectedNode={selectedNode} setSelectedNode={setSelectedNode} /><AlertRail states={acknowledged} onAcknowledge={onAcknowledge} onLocate={locateNode} /></>}
      {activeView === 'Live Map' && <><MapCanvas title="Live Map" filter={filter} setFilter={setFilter} selectedNode={selectedNode} setSelectedNode={setSelectedNode} /><NodeRail selectedNode={selectedNode} onSelect={setSelectedNode} /></>}
      {!['Command Centre', 'Live Map'].includes(activeView) && renderModule()}
    </main>
  );
}
