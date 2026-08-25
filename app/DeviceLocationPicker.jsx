'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from './googleMaps';

const DELHI_CENTER = { lat: 28.6358, lng: 77.2189 };
const DELHI_RESTRICTION = { north: 28.883446, south: 28.404629, east: 77.345338, west: 76.838835 };

export default function DeviceLocationPicker({ latitude, longitude, onChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const clickListenerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const [loadState, setLoadState] = useState('loading');

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then((maps) => {
      if (cancelled || !containerRef.current) return;
      const map = new maps.Map(containerRef.current, {
        center: DELHI_CENTER,
        zoom: 10,
        minZoom: 9,
        maxZoom: 19,
        mapTypeId: 'hybrid',
        restriction: { latLngBounds: DELHI_RESTRICTION, strictBounds: false },
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        gestureHandling: 'greedy',
      });
      mapRef.current = map;
      markerRef.current = new maps.Marker({
        map,
        visible: false,
        title: 'Device location',
        icon: { path: maps.SymbolPath.CIRCLE, scale: 9, fillColor: '#22a8b4', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 3 },
      });
      clickListenerRef.current = map.addListener('click', (event) => {
        onChangeRef.current(Number(event.latLng.lat().toFixed(6)), Number(event.latLng.lng().toFixed(6)));
      });
      setLoadState('ready');
    }).catch(() => { if (!cancelled) setLoadState('error'); });

    return () => {
      cancelled = true;
      clickListenerRef.current?.remove();
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const valid = Number.isFinite(latitude) && Number.isFinite(longitude);
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setVisible(valid);
    if (!valid) return;
    const position = { lat: latitude, lng: longitude };
    markerRef.current.setPosition(position);
    mapRef.current.panTo(position);
  }, [latitude, longitude, loadState]);

  return (
    <div className="device-location-map google-compact-map">
      <div ref={containerRef} className="google-map-surface" aria-label="Google satellite map for selecting a device location" />
      {loadState === 'loading' && <div className="google-map-message">Loading Google Maps…</div>}
      {loadState === 'error' && <div className="google-map-message error">Google Maps could not be loaded.</div>}
      <span>Click anywhere inside Delhi to capture coordinates</span>
    </div>
  );
}
