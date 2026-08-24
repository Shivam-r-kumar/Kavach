'use client';

import { useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DELHI_CENTER = [28.6358, 77.2189];
const DELHI_BOUNDS = [[28.404629, 76.838835], [28.883446, 77.345338]];

function PickerMarker({ latitude, longitude, onChange }) {
  const map = useMap();
  useMapEvents({
    click(event) {
      onChange(Number(event.latlng.lat.toFixed(6)), Number(event.latlng.lng.toFixed(6)));
    },
  });

  const valid = Number.isFinite(latitude) && Number.isFinite(longitude);
  useEffect(() => {
    if (valid) map.panTo([latitude, longitude], { animate: true });
  }, [latitude, longitude, valid, map]);

  if (!valid) return null;
  return <CircleMarker center={[latitude, longitude]} radius={9} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#22a8b4', fillOpacity: 1 }}><Tooltip permanent direction="top" offset={[0, -10]}>Device location</Tooltip></CircleMarker>;
}

export default function DeviceLocationPicker({ latitude, longitude, onChange }) {
  return (
    <div className="device-location-map">
      <MapContainer center={DELHI_CENTER} zoom={10} minZoom={9} maxZoom={18} maxBounds={DELHI_BOUNDS} maxBoundsViscosity={0.72} scrollWheelZoom>
        <TileLayer attribution="Imagery &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" zIndex={350} />
        <PickerMarker latitude={latitude} longitude={longitude} onChange={onChange} />
      </MapContainer>
      <span>Click anywhere inside Delhi to capture coordinates</span>
    </div>
  );
}
