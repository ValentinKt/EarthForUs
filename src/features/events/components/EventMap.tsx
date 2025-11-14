import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Button from '../../../shared/ui/Button';

type EventMapProps = {
  address?: string;
  lat?: number;
  lng?: number;
  radius?: number; // meters
  minRadius?: number;
  maxRadius?: number;
  onLocationChange?: (lat: number, lng: number) => void;
  onRadiusChange?: (radius: number) => void;
};

// Configure default Leaflet marker icon via CDN to avoid bundler asset issues
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const haversineKm = (rMeters: number) => (rMeters / 1000);
const areaSqMeters = (rMeters: number) => Math.PI * rMeters * rMeters;

const EventMap: React.FC<EventMapProps> = ({
  address,
  lat,
  lng,
  radius = 500,
  minRadius = 100,
  maxRadius = 5000,
  onLocationChange,
  onRadiusChange,
}) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(lat && lng ? { lat, lng } : null);
  const [r, setR] = useState<number>(radius);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState<string>(address || '');
  const isMounted = useRef<boolean>(false);
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Geocode when address prop is provided and coords are not set
  useEffect(() => {
    const shouldGeocode = Boolean(addressInput) && !coords;
    if (!shouldGeocode) return;
    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressInput)}&limit=1`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('No results found for provided address');
        const item = data[0];
        const next = { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
        if (isMounted.current) {
          setCoords(next);
          onLocationChange?.(next.lat, next.lng);
        }
      } catch (e) {
        const msg = (e as Error)?.message || 'Geocoding error';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [addressInput, coords, onLocationChange]);

  const handleRadiusChange = (val: number) => {
    const clamped = Math.min(Math.max(val, minRadius), maxRadius);
    setR(clamped);
    onRadiusChange?.(clamped);
  };

  const center = useMemo(() => {
    return coords || { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco for initial view
  }, [coords]);

  const DraggableMarker: React.FC = () => {
    const [draggable, setDraggable] = useState(true);
    useMapEvents({
      click(e) {
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        onLocationChange?.(e.latlng.lat, e.latlng.lng);
      },
    });
    if (!coords) return null;
    return (
      <Marker
        position={coords}
        draggable={draggable}
        eventHandlers={{
          dragend: (ev) => {
            const m = ev.target as L.Marker;
            const p = m.getLatLng();
            setCoords({ lat: p.lat, lng: p.lng });
            onLocationChange?.(p.lat, p.lng);
          },
        }}
      />
    );
  };

  return (
    <div className="space-y-4" aria-label="Map showing event location">
      {/* Controls */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="address-input">Event address</label>
            <div className="flex gap-2">
              <input
                id="address-input"
                aria-label="Event address to geocode"
                className="w-full rounded-xl border border-gray-300 px-3 py-2"
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="e.g., Coastal Cleanup at Sunrise Beach"
              />
              <Button variant="earth" onClick={() => setCoords(null)} aria-label="Geocode address">Geocode</Button>
            </div>
            {error && <p className="mt-1 text-sm text-red-600" aria-live="polite">{error}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="radius-range">Radius</label>
            <input
              id="radius-range"
              aria-label="Radius in meters"
              className="w-full"
              type="range"
              min={minRadius}
              max={maxRadius}
              step={50}
              value={r}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
            />
            <div className="mt-1 text-sm text-gray-700" aria-live="polite">
              Radius: {r} m ({haversineKm(r).toFixed(2)} km) • Area ≈ {Math.round(areaSqMeters(r)).toLocaleString()} m² ({(areaSqMeters(r)/10000).toFixed(2)} ha)
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="lat-input">Latitude</label>
            <input
              id="lat-input"
              aria-label="Latitude"
              className="w-full rounded-xl border border-gray-300 px-3 py-2"
              type="number"
              step="0.000001"
              value={coords?.lat ?? ''}
              onChange={(e) => {
                const raw = Number(e.target.value);
                if (Number.isFinite(raw)) {
                  const v = clamp(raw, -90, 90);
                  const next = { lat: v, lng: coords?.lng ?? center.lng };
                  setCoords(next);
                  onLocationChange?.(next.lat, next.lng);
                  if (raw !== v) setError('Latitude clamped to valid range (-90 to 90)');
                } else {
                  setError('Invalid latitude');
                }
              }}
              placeholder="e.g., 37.7749"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="lng-input">Longitude</label>
            <input
              id="lng-input"
              aria-label="Longitude"
              className="w-full rounded-xl border border-gray-300 px-3 py-2"
              type="number"
              step="0.000001"
              value={coords?.lng ?? ''}
              onChange={(e) => {
                const raw = Number(e.target.value);
                if (Number.isFinite(raw)) {
                  const v = clamp(raw, -180, 180);
                  const next = { lat: coords?.lat ?? center.lat, lng: v };
                  setCoords(next);
                  onLocationChange?.(next.lat, next.lng);
                  if (raw !== v) setError('Longitude clamped to valid range (-180 to 180)');
                } else {
                  setError('Invalid longitude');
                }
              }}
              placeholder="e.g., -122.4194"
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-brand-700 text-sm">Loading map...</span>
            </div>
          )}
          <MapContainer
            center={[center.lat, center.lng]}
            zoom={13}
            className="w-full h-64 sm:h-80 md:h-96"
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              eventHandlers={{
                tileerror: () => setMapError('Map tiles failed to load'),
              }}
            />
            <DraggableMarker />
            {coords && (
              <Circle center={[coords.lat, coords.lng]} radius={r} pathOptions={{ color: '#0f766e', fillColor: '#99f6e4', fillOpacity: 0.2 }} />
            )}
          </MapContainer>
        </div>
        {mapError && (
          <div className="border-t border-red-200 bg-red-50 p-2 text-red-700 text-sm" aria-live="polite">{mapError}</div>
        )}
      </div>

      {/* Interaction feedback */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span role="status" aria-live="polite">{isLoading ? 'Geocoding…' : 'Ready'}</span>
        <span>•</span>
        <span>Click map to set location. Drag marker to adjust.</span>
      </div>
    </div>
  );
};

export default React.memo(EventMap);