'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import {
  Activity, AlertOctagon, AlertTriangle, BarChart3, BatteryCharging, BellRing,
  Check, ChevronRight, CircleDot, Cloud, Cpu, Database, Download, FileText,
  Flame, Gauge, Layers3, Map as MapIcon, Menu, Mountain, Network, Radio,
  Settings, ShieldCheck, Signal, Siren, SlidersHorizontal, Sparkles, Wind,
  Waves, Wifi, X, Zap,
} from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import mockData from './mock-data.json';

const HazardMap = dynamic(() => import('./HazardMap'), {
  ssr: false,
  loading: () => <div className="map-loading"><Radio size={22} /><span>Synchronizing geospatial intelligence…</span></div>,
});

const navItems = [
  ['Command Center', Activity], ['Live Map', MapIcon], ['Hazard Monitoring', AlertTriangle],
  ['Sensor Nodes', Radio], ['Alerts', BellRing], ['Network', Network],
  ['Analytics', BarChart3], ['Reports', FileText], ['Settings', Settings],
];

const stats = [
  ['128 / 134', 'Active Nodes', 'cyan'], ['07', 'Active Alerts', 'orange'],
  ['03', 'Critical Zones', 'red'], ['96%', 'Network Health', 'green'],
  ['87%', 'Processed at Edge', 'purple'],
];

const technologies = [
  { name: 'IoT Sensor Nodes', icon: Radio, used: 'Collect hyper-local environmental data.', why: 'Ground sensors reveal conditions close to the actual risk area that broader systems can miss.' },
  { name: 'ESP32 Controller', icon: Cpu, used: 'Collect readings and perform local processing.', why: 'Compact, low-cost and low-power hardware fits distributed outdoor deployments.' },
  { name: 'Edge Computing', icon: Zap, used: 'Process sensor data directly at the node.', why: 'Reduces bandwidth, power use and dependence on continuous connectivity.' },
  { name: 'Machine Learning / TinyML', icon: Sparkles, used: 'Detect abnormal patterns and predict risk.', why: 'Relationships across many signals produce smarter predictions than a single threshold.' },
  { name: 'Sensor Fusion', icon: Layers3, used: 'Combine multiple readings before deciding.', why: 'Correlated signals increase confidence and reduce false alarms.' },
  { name: 'Mesh Networking', icon: Network, used: 'Relay events from node to node.', why: 'Self-healing multi-hop communication reaches gateways where direct internet is unreliable.' },
  { name: 'LoRa / Wi-Fi / Cellular', icon: Wifi, used: 'Connect field networks to infrastructure.', why: 'Every terrain can use the range, availability and energy profile that fits it best.' },
  { name: 'Cloud / Central Server', icon: Database, used: 'Aggregate, store and manage alerts.', why: 'Local decisions become a wider regional view across multiple nodes.' },
  { name: 'Interactive GIS Map', icon: MapIcon, used: 'Place nodes, hazards and alerts geographically.', why: 'Authorities immediately see what happened, where it happened and how serious it is.' },
];

const hazardCards = [
  { name: 'Flood Monitoring', icon: Waves, color: 'cyan', sensors: ['Water Level', 'Rainfall', 'Humidity', 'Pressure', 'Soil Moisture'], risk: '84%', node: 'FLOOD-041' },
  { name: 'Forest Fire Monitoring', icon: Flame, color: 'red', sensors: ['Temperature', 'Humidity', 'Smoke', 'Flame', 'Air Quality', 'Acoustic'], risk: '91%', node: 'FIRE-023' },
  { name: 'Pollution Monitoring', icon: Wind, color: 'purple', sensors: ['Air Quality / Gas', 'Particulate Matter', 'Temperature', 'Humidity'], risk: '63%', node: 'AIR-018' },
  { name: 'Landslide & Weather', icon: Mountain, color: 'orange', sensors: ['Soil Moisture', 'Rainfall', 'Pressure', 'Environmental Conditions'], risk: '78%', node: 'LAND-012' },
];

const flow = [
  ['Environment', Cloud], ['Multi-Sensor Node', Radio], ['Edge Processing', Cpu],
  ['AI / ML Prediction', Sparkles], ['Risk Score', Gauge], ['Important Data Only', Zap],
  ['Mesh Network', Network], ['Cloud / Server', Database], ['Command Dashboard', MapIcon],
  ['Community Alerts', Siren],
];

const statusLabels = { safe: 'Normal', moderate: 'Moderate', high: 'High', critical: 'Critical', offline: 'Offline' };
const riskPalette = ['#3ddc97', '#f1c84b', '#ff9933', '#ff4d55'];
const hazardPie = [
  { name: 'Flood', value: 28, color: '#21d4e9' },
  { name: 'Fire', value: 24, color: '#ff665d' },
  { name: 'Pollution', value: 31, color: '#9e7bff' },
  { name: 'Landslide', value: 17, color: '#ff9933' },
];

function SectionHeading({ eyebrow, title, detail, action }) {
  return <div className="section-heading"><div><span>{eyebrow}</span><h2>{title}</h2>{detail && <p>{detail}</p>}</div>{action}</div>;
}

function MetricRow() {
  return <div className="situation-strip"><div className="situation-label"><span className="live-pulse"/><b>NATIONAL STATUS</b><small>LIVE</small></div>{stats.map(([value, label, color]) => <div className={`situation-cell ${color}`} key={label}><span>{label}</span><strong>{value}</strong></div>)}<div className="situation-action"><AlertTriangle size={14}/><span><b>FIRE-023</b> requires action</span></div></div>;
}

function NodeInspector({ node, onClose }) {
  if (!node) return null;
  return (
    <aside className="node-inspector">
      <button className="inspector-close" onClick={onClose} aria-label="Close node details"><X size={15} /></button>
      <div className="node-kicker"><span className={`state-dot ${node.status}`} /> {node.id}</div>
      <h3>{node.name}</h3>
      <div className="node-meta"><span><Signal size={13} /> {node.status === 'offline' ? 'Offline' : 'Online'}</span><span><BatteryCharging size={13} /> {node.battery}%</span><span><Network size={13} /> {node.mesh}</span></div>
      <div className="sensor-readings">{Object.entries(node.sensors).map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
      <div className={`ai-prediction ${node.status}`}><span><Sparkles size={13} /> AI PREDICTION</span><strong>{node.hazard} Risk</strong><div><b>{node.risk}%</b><em>{statusLabels[node.status]}</em></div></div>
      <small>Last updated {node.updated}</small>
    </aside>
  );
}

function MapPanel({ nodes, filter, setFilter, layers, setLayers, selectedNode, setSelectedNode, full = false }) {
  const filters = ['All', 'Flood', 'Fire', 'Pollution', 'Landslide'];
  const layerItems = [['nodes', 'Sensor Nodes'], ['hazardZones', 'Hazard Zones'], ['pollution', 'Pollution Heatmap']];
  return (
    <section className={`panel map-panel ${full ? 'full-map-panel' : ''}`}>
      <div className="panel-heading"><div><span>GEOSPATIAL INTELLIGENCE</span><h2>Live Hazard Map</h2></div><div className="filter-pills">{filters.map((item) => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div></div>
      <div className="map-stage">
        <HazardMap nodes={nodes} filter={filter} layers={layers} selectedNode={selectedNode} onSelect={setSelectedNode} />
        <div className="map-layer-control"><span><Layers3 size={13} /> MAP LAYERS</span>{layerItems.map(([key, label]) => <button key={key} onClick={() => setLayers((current) => ({ ...current, [key]: !current[key] }))} className={layers[key] ? 'on' : ''}><i>{layers[key] && <Check size={9} />}</i>{label}</button>)}</div>
        <div className="map-legend"><span><i className="safe" />Normal</span><span><i className="moderate" />Moderate</span><span><i className="high" />High</span><span><i className="critical" />Critical</span><span><i className="offline" />Offline</span></div>
        <NodeInspector node={selectedNode} onClose={() => setSelectedNode(null)} />
      </div>
    </section>
  );
}

function AlertCard({ alert, state, onAction, expanded = false }) {
  const Icon = alert.level === 'critical' ? Flame : alert.node.startsWith('FLOOD') ? Waves : alert.node.startsWith('LAND') ? Mountain : Wind;
  return (
    <article className={`alert-item ${alert.level} ${expanded ? 'expanded' : ''}`}>
      <div className="alert-icon"><Icon size={18} /></div>
      <div className="alert-content"><span>{alert.level.toUpperCase()} · {alert.time}</span><strong>{alert.title}</strong><p>{alert.node} · {alert.region}</p><em>AI Confidence {alert.confidence}%</em>{expanded && <div className="recommended-action"><b>RECOMMENDED ACTION</b><p>{alert.action}</p></div>}<div className="alert-actions"><button>View location</button><button onClick={() => onAction(alert.id, 'acknowledged')}>{state === 'acknowledged' ? 'Acknowledged' : 'Acknowledge'}</button><button onClick={() => onAction(alert.id, 'escalated')}>{state === 'escalated' ? 'Escalated' : 'Escalate'}</button></div></div>
    </article>
  );
}

function LiveAlerts({ alertStates, onAction, limit = 3 }) {
  return <section className="panel alerts-panel"><div className="panel-heading"><div><span>PRIORITY QUEUE</span><h2>Live Alerts</h2></div><b className="active-alert-count">07 ACTIVE</b></div><div className="alerts-list">{mockData.alerts.slice(0, limit).map((alert) => <AlertCard key={alert.id} alert={alert} state={alertStates[alert.id]} onAction={onAction} />)}</div></section>;
}

function MicroSpark({ values, color = '#4bc7d1' }) {
  const width = 86;
  const height = 24;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => `${(index / (values.length - 1)) * width},${height - ((value - min) / range) * (height - 4) - 2}`).join(' ');
  return <svg className="micro-spark" viewBox={`0 0 ${width} ${height}`} aria-hidden="true"><polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke"/></svg>;
}

function EdgePanel() {
  const edgeMetrics = [
    ['Edge processed', '87%', [73,76,75,81,79,84,82,87], '#4bc7d1'],
    ['Data transmitted', '13%', [22,20,18,19,16,15,14,13], '#7d8a98'],
    ['Bandwidth saved', '68%', [52,56,58,61,60,64,66,68], '#48bd83'],
    ['Predictions', '42/hr', [19,25,22,31,29,36,34,42], '#e9a23b'],
  ];
  return (
    <section className="panel edge-panel"><div className="panel-heading"><div><span>SMART TRANSMISSION</span><h2>Edge Intelligence</h2></div><div className="chip purple">TINYML ACTIVE</div></div><div className="resource-monitor">{edgeMetrics.map(([label, value, values, color]) => <div className="resource-row" key={label}><span>{label}</span><MicroSpark values={values} color={color}/><strong>{value}</strong></div>)}</div><div className="mini-pipeline">{[['Sensors', Radio], ['Edge AI', Cpu], ['Risk Detection', Sparkles], ['Important Data', Zap], ['Network', Network]].map(([label, Icon], i) => <div key={label}><span><Icon size={14} /></span><b>{label}</b>{i < 4 && <i />}</div>)}</div></section>
  );
}

function MeshTopology({ large = false }) {
  return (
    <section className={`panel mesh-panel ${large ? 'large' : ''}`}><div className="panel-heading"><div><span>RESILIENT CONNECTIVITY</span><h2>Mesh Network</h2></div><div className="chip green"><span className="live-pulse" /> 96% HEALTH</div></div><div className="mesh-body"><div className="mesh-topology" aria-label="Mesh network topology visualization"><svg viewBox="0 0 560 240" role="img" aria-label="Connected IoT nodes and gateways"><g className="mesh-links"><line x1="90" y1="70" x2="210" y2="48"/><line x1="90" y1="70" x2="170" y2="145"/><line x1="210" y1="48" x2="290" y2="118"/><line x1="170" y1="145" x2="290" y2="118"/><line x1="170" y1="145" x2="245" y2="205"/><line x1="290" y1="118" x2="392" y2="60"/><line x1="290" y1="118" x2="398" y2="175"/><line x1="245" y1="205" x2="398" y2="175"/><line x1="392" y1="60" x2="486" y2="108"/><line x1="398" y1="175" x2="486" y2="108"/></g><g className="mesh-nodes"><circle cx="90" cy="70" r="9"/><circle cx="170" cy="145" r="7"/><circle cx="210" cy="48" r="7"/><circle cx="245" cy="205" r="7"/><circle className="gateway" cx="290" cy="118" r="15"/><circle cx="392" cy="60" r="8"/><circle cx="398" cy="175" r="7"/><circle className="gateway" cx="486" cy="108" r="15"/></g><g className="mesh-labels"><text x="278" y="91">GATEWAY 06</text><text x="469" y="80">GATEWAY 11</text><text x="76" y="50">NODE 08</text><text x="382" y="201">NODE 27</text></g></svg></div><div className="mesh-metrics">{[['128', 'Active Nodes'], ['06', 'Offline'], ['312', 'Mesh Links'], ['12', 'Gateways']].map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></div></section>
  );
}

function AnalyticsSummary({ timeRange, setTimeRange, extended = false }) {
  const ranges = ['1H', '6H', '24H', '7D', 'Custom'];
  return (
    <section className={`panel analytics-panel ${extended ? 'extended' : ''}`}><div className="panel-heading chart-header"><div><span>ENVIRONMENTAL TELEMETRY</span><h2>{extended ? 'Multi-Signal Analytics' : 'Incident & Risk Trend'}</h2></div><div className="filter-pills">{ranges.map((range) => <button key={range} className={timeRange === range ? 'selected' : ''} onClick={() => setTimeRange(range)}>{range}</button>)}</div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={mockData.telemetry} margin={{ top: 12, right: 8, bottom: 0, left: -22 }}><CartesianGrid stroke="#27313c" strokeDasharray="2 5" vertical={false}/><XAxis dataKey="time" stroke="#667482" tickLine={false} axisLine={false} fontSize={9}/><YAxis stroke="#667482" tickLine={false} axisLine={false} fontSize={9}/><Tooltip contentStyle={{ background:'#0d131a', border:'1px solid #2d3945', fontSize:10 }} /><Area type="monotone" dataKey="risk" stroke="#f04f54" fill="#f04f5412" strokeWidth={2}/><Line type="monotone" dataKey="humidity" stroke="#4bc7d1" dot={false} strokeWidth={1.4}/></AreaChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="risk-line" /> Risk Score</span><span><i className="humidity-line" /> Humidity</span><b>PEAK RISK 84% · 16:00</b></div><div className="incident-metrics"><div><span>Critical incidents</span><strong>03</strong><em>+1 today</em></div><div><span>Mean time to respond</span><strong>12 min</strong><em>−18%</em></div><div><span>Escalation rate</span><strong>14%</strong><em>2 pending</em></div></div></section>
  );
}

function CommandCenter(props) {
  return <><MetricRow /><div className="command-grid"><MapPanel {...props} /><LiveAlerts alertStates={props.alertStates} onAction={props.onAction} /></div><div className="intelligence-grid"><EdgePanel /><MeshTopology /></div><AnalyticsSummary timeRange={props.timeRange} setTimeRange={props.setTimeRange} /></>;
}

function HazardMonitoring() {
  return (
    <div className="view-stack"><SectionHeading eyebrow="MULTI-HAZARD INTELLIGENCE" title="Hazard Monitoring" detail="One distributed sensing layer, purpose-configured for each environmental threat." /><section className="panel hazard-matrix"><div className="hazard-matrix-head"><span>Hazard profile</span><span>Sensor fusion inputs</span><span>Detecting node</span><span>AI risk</span><span>Disposition</span></div>{hazardCards.map(({ name, icon: Icon, color, sensors, risk, node }) => <button className={`hazard-matrix-row ${color}`} key={name}><span className="hazard-identity"><i><Icon size={17}/></i><b>{name}</b></span><span className="matrix-sensors">{sensors.map((sensor) => <em key={sensor}>{sensor}</em>)}</span><span className="matrix-node"><CircleDot size={10}/>{node}</span><span className="matrix-risk"><b>{risk}</b><i><u style={{width:risk}}/></i></span><span className="matrix-action">Open feed <ChevronRight size={12}/></span></button>)}</section><section className="panel fusion-panel"><SectionHeading eyebrow="SENSOR FUSION" title="Correlated signals create stronger predictions" /><div className="fusion-examples"><div><b>FOREST FIRE RISK</b><p><span>Temperature ↑</span><i>+</i><span>Humidity ↓</span><i>+</i><span>Smoke ↑</span><em>→</em><strong>91% CRITICAL</strong></p></div><div><b>FLOOD RISK</b><p><span>Rainfall ↑</span><i>+</i><span>Water Level ↑</span><i>+</i><span>Soil Moisture ↑</span><em>→</em><strong>84% HIGH</strong></p></div></div></section></div>
  );
}

function SensorNodes({ nodes, setSelectedNode, setActiveView }) {
  return (
    <div className="view-stack"><SectionHeading eyebrow="FIELD INFRASTRUCTURE" title="Sensor Nodes" detail="134 distributed sensing units across 42 vulnerable zones." action={<button className="outline-button"><Download size={13}/> Export inventory</button>} /><div className="node-summary">{[['134','Total Nodes'],['128','Online'],['6','Offline'],['82%','Avg. Battery'],['312','Mesh Links']].map(([v,l]) => <div key={l}><strong>{v}</strong><span>{l}</span></div>)}</div><section className="panel table-panel"><div className="table-toolbar"><div><CircleDot size={13}/> LIVE NODE REGISTRY</div><button><SlidersHorizontal size={13}/> Filter</button></div><div className="data-table"><div className="table-row table-head"><span>Node ID</span><span>Deployment Zone</span><span>Hazard</span><span>Status</span><span>Battery</span><span>Risk</span><span>Updated</span></div>{nodes.map((node) => <button className="table-row" key={node.id} onClick={() => {setSelectedNode(node);setActiveView('Live Map')}}><span><b>{node.id}</b></span><span>{node.name}</span><span>{node.hazard}</span><span><i className={`state-dot ${node.status}`}/>{statusLabels[node.status]}</span><span>{node.battery}%</span><span><strong className={node.status}>{node.risk}%</strong></span><span>{node.updated}</span></button>)}</div></section></div>
  );
}

function AlertsView({ alertStates, onAction }) {
  return <div className="view-stack"><SectionHeading eyebrow="INCIDENT OPERATIONS" title="Active Alerts" detail="AI-ranked events awaiting command-center action." action={<div className="chip red"><Siren size={12}/> 3 REQUIRE ACTION</div>} /><div className="alert-overview"><div><strong>01</strong><span>Critical</span></div><div><strong>02</strong><span>High</span></div><div><strong>04</strong><span>Moderate</span></div><div><strong>12m</strong><span>Avg. response</span></div></div><div className="alert-feed">{mockData.alerts.map((alert) => <AlertCard key={alert.id} alert={alert} state={alertStates[alert.id]} onAction={onAction} expanded />)}</div></div>;
}

function NetworkView() {
  return <div className="view-stack"><SectionHeading eyebrow="NETWORK OPERATIONS" title="Mesh Network" detail="Self-healing, multi-hop connectivity from field nodes to 12 regional gateways." /><MetricRow /><MeshTopology large /><div className="network-cards"><section className="panel"><div className="panel-heading"><div><span>GATEWAY TRAFFIC</span><h2>Data relay volume</h2></div></div><div className="gateway-bars">{[['GW-06 Uttarakhand',82],['GW-11 Assam',74],['GW-03 Delhi',66],['GW-09 Nilgiri',58],['GW-02 Kerala',47]].map(([name,value]) => <div key={name}><span>{name}</span><i><b style={{width:`${value}%`}}/></i><strong>{value}%</strong></div>)}</div></section><section className="panel network-health-detail"><div className="panel-heading"><div><span>RESILIENCE</span><h2>Network safeguards</h2></div></div>{[['Self-healing routes','Active'],['Multi-hop relay','312 links'],['Packet delivery','98.4%'],['Gateway redundancy','2.6×']].map(([l,v]) => <div key={l}><span>{l}</span><strong>{v}</strong></div>)}</section></div></div>;
}

function AnalyticsView({ timeRange, setTimeRange }) {
  return (
    <div className="view-stack analytics-view"><SectionHeading eyebrow="DECISION INTELLIGENCE" title="Environmental Analytics" detail="Cross-hazard telemetry, risk trends and regional patterns." /><AnalyticsSummary timeRange={timeRange} setTimeRange={setTimeRange} extended /><div className="chart-grid"><section className="panel chart-card"><div className="panel-heading"><div><span>ALERT VOLUME</span><h2>Alerts over time</h2></div></div><ResponsiveContainer width="100%" height={220}><BarChart data={mockData.telemetry} margin={{top:20,right:15,left:-20,bottom:0}}><CartesianGrid stroke="#203245" vertical={false}/><XAxis dataKey="time" stroke="#61768b" fontSize={9} axisLine={false}/><YAxis stroke="#61768b" fontSize={9} axisLine={false}/><Tooltip contentStyle={{background:'#0b1725',border:'1px solid #2a3f54',fontSize:10}}/><Bar dataKey="alerts" fill="#ff9933" radius={[2,2,0,0]}/></BarChart></ResponsiveContainer></section><section className="panel chart-card pie-card"><div className="panel-heading"><div><span>HAZARD MIX</span><h2>Events by type</h2></div></div><div className="pie-layout"><ResponsiveContainer width="55%" height={220}><PieChart><Pie data={hazardPie} dataKey="value" innerRadius={55} outerRadius={82} paddingAngle={3}>{hazardPie.map((item) => <Cell key={item.name} fill={item.color}/>)}</Pie><Tooltip contentStyle={{background:'#0b1725',border:'1px solid #2a3f54',fontSize:10}}/></PieChart></ResponsiveContainer><div>{hazardPie.map((item) => <span key={item.name}><i style={{background:item.color}}/>{item.name}<b>{item.value}%</b></span>)}</div></div></section></div><section className="panel chart-card region-chart"><div className="panel-heading"><div><span>REGIONAL DISTRIBUTION</span><h2>Hazards by region</h2></div></div><ResponsiveContainer width="100%" height={250}><BarChart data={mockData.regions} margin={{top:20,right:20,left:-10,bottom:0}}><CartesianGrid stroke="#203245" vertical={false}/><XAxis dataKey="name" stroke="#61768b" fontSize={9}/><YAxis stroke="#61768b" fontSize={9}/><Tooltip contentStyle={{background:'#0b1725',border:'1px solid #2a3f54',fontSize:10}}/><Bar dataKey="flood" stackId="a" fill="#21d4e9"/><Bar dataKey="fire" stackId="a" fill="#ff665d"/><Bar dataKey="pollution" stackId="a" fill="#9e7bff"/><Bar dataKey="landslide" stackId="a" fill="#ff9933" radius={[2,2,0,0]}/></BarChart></ResponsiveContainer></section></div>
  );
}

function ReportsView() {
  const reports = [['National Risk Summary','24 Aug 2026 · 14:00 IST','PDF · 4.8 MB'],['Uttarakhand Fire Intelligence','24 Aug 2026 · 13:42 IST','PDF · 2.1 MB'],['Assam Flood Basin Analysis','24 Aug 2026 · 12:30 IST','PDF · 3.4 MB'],['Network Health & Uptime','24 Aug 2026 · 12:00 IST','CSV · 1.2 MB']];
  return <div className="view-stack"><SectionHeading eyebrow="SITUATIONAL REPORTS" title="Reports" detail="Command-ready summaries generated from fused field intelligence." action={<button className="primary-small"><FileText size={13}/> Generate report</button>} /><section className="panel report-list"><div className="report-list-head"><span>Report</span><span>Scope</span><span>Generated</span><span>Format</span><span>Action</span></div>{reports.map(([title,date,size],index) => <div className="report-list-row" key={title}><span><i><FileText size={15}/></i><b>{title}</b></span><span>{index === 0 ? 'National' : 'Regional'}</span><span>{date}</span><span>{size}</span><button><Download size={13}/> Download</button></div>)}</section><section className="panel report-schedule"><div><span>AUTOMATED BRIEFINGS</span><h3>Daily command brief</h3><p>Compiled every day at 06:00 and 18:00 IST from all active node clusters.</p></div><div className="toggle on"><i/></div></section></div>;
}

function SettingsView() {
  const rules = [['Critical risk escalation','Automatically notify district authority above 85% AI confidence',true],['Offline node warning','Create an alert when a node misses three mesh heartbeats',true],['Community broadcasts','Send public alerts only after human command approval',false],['Bandwidth conservation','Use smart event-only transmission on low-power clusters',true]];
  return <div className="view-stack"><SectionHeading eyebrow="SYSTEM CONFIGURATION" title="Settings" detail="Operational thresholds and communication rules." /><div className="settings-grid"><section className="panel settings-panel"><div className="panel-heading"><div><span>ALERT LOGIC</span><h2>Rules & automation</h2></div></div>{rules.map(([title,desc,on]) => <div className="setting-row" key={title}><div><strong>{title}</strong><p>{desc}</p></div><div className={`toggle ${on?'on':''}`}><i/></div></div>)}</section><section className="panel settings-panel"><div className="panel-heading"><div><span>RISK THRESHOLDS</span><h2>AI severity levels</h2></div></div>{[['LOW','0–34%',0],['MODERATE','35–59%',1],['HIGH','60–84%',2],['CRITICAL','85–100%',3]].map(([label,value,index]) => <div className="threshold-row" key={label}><span><i style={{background:riskPalette[index]}}/>{label}</span><strong>{value}</strong></div>)}</section></div></div>;
}

function MissionBriefing({ onEnter }) {
  return (
    <div className="briefing-overlay" role="dialog" aria-modal="true" aria-labelledby="briefing-title"><div className="briefing-window briefing-complete"><header className="briefing-header"><div className="brand-mark large"><ShieldCheck size={27} /></div><div className="briefing-title"><span>MISSION BRIEFING · SMART INDIA HACKATHON 2026</span><h2 id="briefing-title">KAVACH</h2><p>AI-Powered Multi-Hazard Environmental Intelligence Network</p></div><button className="skip" onClick={onEnter}>Skip introduction</button></header><div className="briefing-body">
      <section className="mission-intro"><div><span className="eyebrow">ONE NETWORK · MULTIPLE HAZARDS</span><h3>Intelligence at<br />the <em>edge.</em></h3><p>A digital protective shield that senses local danger, predicts risk early and helps authorities respond faster.</p><div className="briefing-badges"><span><Waves size={12}/> Flood</span><span><Flame size={12}/> Forest Fire</span><span><Wind size={12}/> Pollution</span><span><Mountain size={12}/> Landslide</span></div></div><div className="hazard-orbit"><div className="shield-core"><ShieldCheck size={36} /><b>KAVACH</b></div><span className="orbit-point fire-point"><Flame size={17} /></span><span className="orbit-point flood-point"><Waves size={17} /></span><span className="orbit-point air-point"><Wind size={17} /></span><span className="orbit-point weather-point"><Cloud size={17} /></span></div></section>
      <section className="brief-section numbered"><div className="section-number">01</div><div><span className="eyebrow">THE PROBLEM</span><h4>Disconnected systems. Fragmented intelligence.</h4><p>India faces floods, forest fires, air pollution, landslides and extreme weather. Existing systems are generally built for individual hazards across different agencies, platforms and data sources. Responders need one unified, hyper-local ground intelligence layer that watches many risks continuously.</p></div></section>
      <section className="solution-callout"><div className="callout-icon"><Radio size={23}/></div><div><span className="eyebrow">02 · OUR SOLUTION</span><h4>A unified ground-level environmental monitoring network.</h4><p>KAVACH deploys intelligent sensor nodes at vulnerable locations. Instead of relying only on centralized monitoring, it fuses local signals and performs intelligence directly near the data source.</p><strong className="process-mantra">PROCESS LOCALLY. TRANSMIT INTELLIGENTLY.</strong></div></section>
      <section className="brief-block flow-section"><span className="eyebrow">03 · HOW KAVACH WORKS</span><h4>From environmental signal to coordinated action</h4><div className="flow-track">{flow.map(([label, Icon], index) => <div className="flow-step" key={label}><span><Icon size={18}/></span><b>{label}</b>{index < flow.length-1 && <i/>}</div>)}</div></section>
      <section className="brief-block"><span className="eyebrow">04 · TECHNOLOGIES WE USE — AND WHY</span><h4>Every technology solves a field constraint.</h4><div className="technology-grid">{technologies.map(({name,icon:Icon,used,why}) => <article key={name}><div><Icon size={18}/></div><h5>{name}</h5><p><b>USED FOR</b>{used}</p><p><b>WHY</b>{why}</p></article>)}</div></section>
      <section className="brief-block transmission-block"><span className="eyebrow">05 · SMART DATA TRANSMISSION</span><h4>Less noise. Faster decisions. Longer field life.</h4><div className="transmission-compare"><article className="traditional"><span>TRADITIONAL APPROACH</span><div className="vertical-flow"><b>Sensor</b><i/><b>Continuous Raw Data</b><i/><b>Server</b></div><ul><li>High bandwidth usage</li><li>Higher power consumption</li><li>Network dependency</li></ul></article><div className="versus">VS</div><article className="kavach-approach"><span>KAVACH APPROACH</span><div className="vertical-flow"><b>Sensor</b><i/><b>Edge Processing + ML</b><i/><b>Important Event Only</b><i/><b>Risk + Alert + Location</b></div><ul><li>Lower bandwidth & power use</li><li>Faster local decisions</li><li>Works better in remote areas</li></ul></article></div></section>
      <section className="brief-block"><span className="eyebrow">06 · MULTI-HAZARD MONITORING</span><h4>One node architecture. Multiple sensing profiles.</h4><div className="hazard-grid briefing-hazards">{hazardCards.map(({name,icon:Icon,color,sensors}) => <article className={color} key={name}><div><Icon size={20}/></div><h5>{name}</h5><span>SENSOR INPUTS</span><p>{sensors.join(' · ')}</p></article>)}</div></section>
      <section className="brief-block risk-intel"><div><span className="eyebrow">07 · RISK INTELLIGENCE</span><h4>Signals become clear, actionable risk.</h4><div className="risk-scale"><span className="low">LOW</span><span className="moderate">MODERATE</span><span className="high">HIGH</span><span className="critical">CRITICAL</span></div></div><article><div className="node-kicker"><span className="state-dot critical"/> FOREST NODE F-023</div><h5>Uttarakhand Forest Zone</h5><div className="risk-sensors"><span>Temperature <b>44°C</b></span><span>Humidity <b>18%</b></span><span>Smoke Index <b>High</b></span></div><div className="risk-result"><Sparkles size={17}/><div><span>AI RISK SCORE</span><strong>91% — CRITICAL FIRE RISK</strong></div></div><p><Siren size={14}/> Immediate alert generated</p></article></section>
      <section className="innovation-block"><AlertOctagon size={29}/><span className="eyebrow">08 · CORE INNOVATION</span><h4>KAVACH is not just another sensor dashboard.</h4><p>It combines ground-level sensors, edge computing, AI risk prediction, sensor fusion, mesh networking, smart data transmission and unified multi-hazard monitoring into one distributed environmental intelligence network.</p><div>{['Ground Sensors','Edge Computing','AI Prediction','Sensor Fusion','Mesh Network','Smart Transmission'].map((item) => <span key={item}><Check size={11}/>{item}</span>)}</div></section>
      <section className="mission-ending"><div className="brand-mark large"><ShieldCheck size={27}/></div><span className="eyebrow">09 · FINAL MISSION</span><h4>A digital protective shield<br/>over vulnerable regions.</h4><div className="mission-shift"><span>REACTIVE RESPONSE</span><ChevronRight size={20}/><strong>PROACTIVE RISK PREVENTION</strong></div><p>SENSE LOCALLY <i/> PREDICT EARLY <i/> RESPOND FASTER</p><button className="enter-button hero-enter" onClick={onEnter}>ENTER KAVACH COMMAND CENTER <ChevronRight size={18}/></button></section>
      </div><footer className="briefing-footer"><div><span className="live-pulse"/> SYSTEM BRIEFING READY · SCROLL TO EXPLORE</div><button className="enter-button" onClick={onEnter}>ENTER COMMAND CENTER <ChevronRight size={18}/></button></footer></div></div>
  );
}

export default function Home() {
  const [briefingOpen, setBriefingOpen] = useState(true);
  const [activeView, setActiveView] = useState('Command Center');
  const [filter, setFilter] = useState('All');
  const [layers, setLayers] = useState({ nodes: true, hazardZones: true, pollution: false });
  const [selectedNode, setSelectedNode] = useState(mockData.nodes[0]);
  const [alertStates, setAlertStates] = useState({});
  const [timeRange, setTimeRange] = useState('24H');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const liveClock = useMemo(() => 'IST 14:32:08', []);
  const onAlertAction = (id, state) => setAlertStates((current) => ({ ...current, [id]: state }));
  const mapProps = { nodes: mockData.nodes, filter, setFilter, layers, setLayers, selectedNode, setSelectedNode };

  const renderView = () => {
    if (activeView === 'Command Center') return <CommandCenter {...mapProps} alertStates={alertStates} onAction={onAlertAction} timeRange={timeRange} setTimeRange={setTimeRange}/>;
    if (activeView === 'Live Map') return <div className="view-stack"><SectionHeading eyebrow="GEOSPATIAL OPERATIONS" title="Live Hazard Map" detail="Interactive node intelligence across active deployment regions."/><MapPanel {...mapProps} full/></div>;
    if (activeView === 'Hazard Monitoring') return <HazardMonitoring/>;
    if (activeView === 'Sensor Nodes') return <SensorNodes nodes={mockData.nodes} setSelectedNode={setSelectedNode} setActiveView={setActiveView}/>;
    if (activeView === 'Alerts') return <AlertsView alertStates={alertStates} onAction={onAlertAction}/>;
    if (activeView === 'Network') return <NetworkView/>;
    if (activeView === 'Analytics') return <AnalyticsView timeRange={timeRange} setTimeRange={setTimeRange}/>;
    if (activeView === 'Reports') return <ReportsView/>;
    return <SettingsView/>;
  };

  return (
    <main className="app-shell"><aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}><div className="brand-lockup"><div className="brand-mark"><ShieldCheck size={20}/></div><div><strong>KAVACH</strong><span>MISSION CONTROL</span></div><button className="mobile-close" onClick={() => setSidebarOpen(false)}><X size={17}/></button></div><div className="nav-label">OPERATIONS</div><nav>{navItems.map(([label,Icon]) => <button title={label} aria-label={label} className={activeView === label ? 'nav-item active' : 'nav-item'} key={label} onClick={() => {setActiveView(label);setSidebarOpen(false)}}><Icon size={17}/><span>{label}</span>{label === 'Alerts' && <b>7</b>}</button>)}</nav><button title="Mission Briefing" className="briefing-replay" onClick={() => setBriefingOpen(true)}><ShieldCheck size={15}/><span>Mission Briefing</span></button><div className="system-status"><span className="status-dot"/><div><strong>NETWORK READY</strong><small>Last sync 12 sec ago</small></div></div></aside><section className="workspace"><header className="topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={19}/></button><div><p>INDIA · MULTI-HAZARD OPERATIONS</p><h1>{activeView}</h1></div><div className="topbar-critical"><span>CRITICAL</span><b>Uttarakhand fire risk</b><small>91% confidence</small></div><div className="topbar-status"><span className="live-pulse"/> LIVE <b>{liveClock}</b></div></header>{renderView()}<footer className="app-footer"><span>KAVACH · EDGE-AI MULTI-HAZARD NETWORK</span><b>SENSE LOCALLY · PREDICT EARLY · RESPOND FASTER</b><span>SIH 2026</span></footer></section>{sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"/>}{briefingOpen && <MissionBriefing onEnter={() => setBriefingOpen(false)}/>}</main>
  );
}
