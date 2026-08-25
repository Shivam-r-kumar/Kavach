'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from './googleMaps';

const DELHI_BOUNDS = { north: 28.883446, south: 28.404629, east: 77.345338, west: 76.838835 };
const statusColors = { safe: '#16805d', moderate: '#d49614', high: '#e46e2e', critical: '#cf3741' };

export default function DeviceRegistryMap({ nodes, selectedNode, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const mapsRef = useRef(null);
  const markersRef = useRef([]);
  const onSelectRef = useRef(onSelect);
  const [loadState, setLoadState] = useState('loading');

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((maps) => {
      if (cancelled || !containerRef.current) return;
      const map = new maps.Map(containerRef.current, {
        center: { lat: 28.6358, lng: 77.2189 },
        zoom: 10,
        minZoom: 9,
        maxZoom: 19,
        mapTypeId: 'hybrid',
        restriction: { latLngBounds: DELHI_BOUNDS, strictBounds: false },
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        gestureHandling: 'greedy',
      });
      map.fitBounds(DELHI_BOUNDS, 18);
      mapsRef.current = maps;
      mapRef.current = map;
      setLoadState('ready');
    }).catch(() => { if (!cancelled) setLoadState('error'); });
    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      mapRef.current = null;
      mapsRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current; const maps = mapsRef.current;
    if (!map || !maps) return;
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = nodes.map((node) => {
      const selected = selectedNode?.id === node.id;
      const marker = new maps.Marker({
        map,
        position: { lat: Number(node.lat), lng: Number(node.lng) },
        title: `${node.id} · ${node.name}`,
        zIndex: selected ? 900 : 500,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: selected ? 10 : node.status === 'safe' ? 5.5 : 7.5,
          fillColor: statusColors[node.status] || statusColors.safe,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: selected ? 3 : 2,
        },
      });
      marker.addListener('click', () => onSelectRef.current(node));
      return marker;
    });
  }, [nodes, selectedNode, loadState]);

  useEffect(() => {
    if (!selectedNode || !mapRef.current) return;
    mapRef.current.panTo({ lat: Number(selectedNode.lat), lng: Number(selectedNode.lng) });
    mapRef.current.setZoom(13);
  }, [selectedNode]);

  return (
    <div className="device-registry-map google-compact-map">
      <div ref={containerRef} className="google-map-surface" aria-label="Google satellite map of deployed devices" />
      {loadState === 'loading' && <div className="google-map-message">Loading Google Maps…</div>}
      {loadState === 'error' && <div className="google-map-message error">Google Maps could not be loaded.</div>}
      <span>Click a device marker to manage it</span>
    </div>
  );
}
